#!/usr/bin/env python3
"""Render a pack's spoken lines to audio clips with a neural TTS engine.

Pipeline:

    node tools/tts/extract.mjs public/packs/dutch-nl     # writes audio/jobs.json
    python tools/tts/generate.py public/packs/dutch-nl   # writes clips + index.json

This reads the job list produced by extract.mjs (never re-deriving what to
speak), synthesises each still-missing clip, and writes audio/index.json
mapping each spoken line to its clip file. The runtime (src/engine/audio.js)
loads that index and plays the clips, falling back to the browser voice for
anything absent.

Engines (--engine):

    xtts (default)  Coqui XTTS-v2. Natural flow and intonation, supports Dutch
                    out of the box, and is fast enough that a full pack is
                    feasible on a laptop CPU. The voice is cloned from either a
                    bundled studio speaker (--speaker) or a short reference
                    recording (--speaker-wav, ~6-10s of clean speech — a native
                    Dutch speaker gives the most accurate accent).
                    License: Coqui Public Model License (NON-COMMERCIAL). The
                    first download asks you to accept it.
                    Install: pip install coqui-tts

    tortoise        The fine-tuned Dutch Tortoise checkpoint
                    (arrivederci19/tortoise_tts_dutch). Slower — GPU strongly
                    recommended for a full pack.
                    Install: pip install tortoise-tts huggingface_hub psutil
                    (psutil is imported by tortoise at runtime but missing
                    from its declared deps)

The two engines pin conflicting transformers versions — install them in
separate venvs. Both are heavyweight neural models: generation is an offline
build step, not something the app does live. Run it once, commit the
resulting audio/ directory (or host it as static assets), and ship.

Modes:
    --dry-run   Write short silent placeholder clips + a valid index.json with
                no model at all. Lets you exercise the full runtime path (the
                app will "play" real files) before committing to a long render.
    --limit N   Only generate the first N missing clips (smoke test).
    --format    mp3 (default; ~10x smaller, needs ffmpeg) | wav.
    --preset    Tortoise-only quality preset: ultra_fast | fast (default) |
                standard | high_quality.
"""

import argparse
import json
import os
import shutil
import struct
import subprocess
import sys
import wave
from pathlib import Path

XTTS_MODEL = "tts_models/multilingual/multi-dataset/xtts_v2"
TORTOISE_REPO = "arrivederci19/tortoise_tts_dutch"
SAMPLE_RATE = 24000  # both XTTS-v2 and Tortoise render at 24 kHz


def load_jobs(audio_dir: Path):
    jobs_path = audio_dir / "jobs.json"
    if not jobs_path.exists():
        sys.exit(
            f"No {jobs_path}. Run: node tools/tts/extract.mjs {audio_dir.parent}"
        )
    return json.loads(jobs_path.read_text())


def load_index(audio_dir: Path):
    index_path = audio_dir / "index.json"
    if index_path.exists():
        return json.loads(index_path.read_text())
    return {"clips": {}}


def write_index(audio_dir: Path, index: dict):
    index_path = audio_dir / "index.json"
    index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    print(f"Wrote {index_path} ({len(index['clips'])} clips)")


def silent_pcm(seconds: float = 0.35) -> bytes:
    """Raw 16-bit PCM silence — used for --dry-run placeholders."""
    return struct.pack("<%dh" % int(SAMPLE_RATE * seconds), *([0] * int(SAMPLE_RATE * seconds)))


def floats_to_pcm(wav) -> bytes:
    """A float waveform (mono, [-1, 1], list/array/tensor) -> raw 16-bit PCM.

    Deliberately avoids torchaudio.save(): newer torchaudio routes saving
    through the separate `torchcodec` package (plus a matching ffmpeg), which
    is fragile to install. Encoding this ourselves works everywhere."""
    import numpy as np

    if hasattr(wav, "detach"):  # torch tensor
        wav = wav.detach().cpu().float().numpy()
    samples = np.clip(np.asarray(wav, dtype=np.float32).reshape(-1), -1.0, 1.0)
    return (samples * 32767.0).astype(np.int16).tobytes()


def write_wav(out: Path, pcm: bytes, sr: int = SAMPLE_RATE):
    with wave.open(str(out), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm)


def write_mp3(out: Path, pcm: bytes, sr: int = SAMPLE_RATE, bitrate: str = "64k"):
    """Encode raw PCM to MP3 via ffmpeg. 64 kbps mono is transparent for speech
    and ~10x smaller than WAV — small enough to commit all clips to the repo.
    MP3 plays in every browser (incl. Safari) with no runtime change."""
    if not shutil.which("ffmpeg"):
        raise RuntimeError("ffmpeg not found — run `brew install ffmpeg`, or pass --format wav")
    cmd = ["ffmpeg", "-y", "-f", "s16le", "-ar", str(sr), "-ac", "1",
           "-i", "pipe:0", "-b:a", bitrate, str(out)]
    r = subprocess.run(cmd, input=pcm, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    if r.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {r.stderr.decode(errors='replace')[-300:]}")


def write_clip(out: Path, pcm: bytes, fmt: str):
    (write_mp3 if fmt == "mp3" else write_wav)(out, pcm)


# ---------- engines ----------

def build_xtts(args, locale):
    """XTTS-v2 via the maintained coqui-tts fork. Returns render(text)->pcm."""
    import torch

    # coqui-tts declares transformers>=4.57 with no upper bound, but recent
    # transformers releases dropped transformers.pytorch_utils.isin_mps_friendly
    # (an MPS shim over torch.isin) that TTS's bundled Tortoise-layer code still
    # imports at module load time. No transformers version satisfies both, so
    # restore the missing helper before importing TTS rather than pin a broken
    # combination.
    import transformers.pytorch_utils as _ptu
    if not hasattr(_ptu, "isin_mps_friendly"):
        _ptu.isin_mps_friendly = lambda elements, test_elements: torch.isin(elements, test_elements)

    from TTS.api import TTS

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Loading {XTTS_MODEL} on {device} …")
    tts = TTS(XTTS_MODEL).to(device)

    lang = locale.split("-")[0].lower()
    # A reference recording beats a bundled studio speaker for accent accuracy;
    # use --speaker-wav with ~6-10s of clean native speech when you have one.
    if args.speaker_wav:
        voice_kwargs = {"speaker_wav": args.speaker_wav}
        print(f"Voice: cloned from {args.speaker_wav}")
    else:
        voice_kwargs = {"speaker": args.speaker}
        print(f"Voice: bundled speaker {args.speaker!r} "
              "(pass --speaker-wav <native-dutch.wav> for the most accurate accent)")

    def render(text):
        return floats_to_pcm(tts.tts(text=text, language=lang, **voice_kwargs))

    return render, XTTS_MODEL


def build_tortoise(args, locale):
    """Fine-tuned Dutch Tortoise. Returns render(text)->pcm."""
    from huggingface_hub import snapshot_download
    import torch
    from tortoise.api import TextToSpeech

    print(f"Fetching {TORTOISE_REPO} …")
    repo = Path(snapshot_download(TORTOISE_REPO))

    # Tortoise loads its autoregressive model from <models_dir>/autoregressive.pth.
    # Point models_dir at whatever directory holds the fine-tuned checkpoint,
    # normalising the filename if the repo ships it under another name. The
    # diffusion/vocoder/CLVP models stay the English defaults (downloaded by
    # Tortoise on first run) — only the AR model carries the Dutch voice.
    ar = repo / "autoregressive.pth"
    if not ar.exists():
        candidates = sorted(repo.rglob("*.pth")) + sorted(repo.rglob("*.safetensors"))
        if not candidates:
            sys.exit(f"No .pth/.safetensors checkpoint found under {repo}")
        src = candidates[0]
        print(f"Using checkpoint {src.name} as the autoregressive model")
        ar.write_bytes(src.read_bytes())

    device = "cuda" if torch.cuda.is_available() else "cpu"
    if device == "cpu":
        print("WARNING: no CUDA device — Tortoise on CPU is extremely slow.")
    tts = TextToSpeech(models_dir=str(repo), device=device)

    def render(text):
        with torch.no_grad():
            # No reference voice samples: the fine-tune supplies the Dutch
            # timbre. Swap in load_voices([...]) here to clone a speaker.
            gen = tts.tts_with_preset(
                text, voice_samples=None, conditioning_latents=None, preset=args.preset
            )
        return floats_to_pcm(gen.squeeze(0))

    return render, TORTOISE_REPO


ENGINES = {"xtts": build_xtts, "tortoise": build_tortoise}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("pack_dir", help="e.g. public/packs/dutch-nl")
    ap.add_argument("--engine", default="xtts", choices=sorted(ENGINES),
                    help="TTS engine (default: xtts)")
    ap.add_argument("--speaker", default="Ana Florence",
                    help="XTTS bundled studio speaker name")
    ap.add_argument("--speaker-wav",
                    help="XTTS reference recording (~6-10s clean speech) to clone; "
                         "overrides --speaker")
    ap.add_argument("--dry-run", action="store_true", help="silent placeholders, no model")
    ap.add_argument("--limit", type=int, default=0, help="only the first N missing clips")
    ap.add_argument("--preset", default="fast",
                    choices=["ultra_fast", "fast", "standard", "high_quality"],
                    help="tortoise-only quality preset")
    ap.add_argument("--format", default="mp3", choices=["mp3", "wav"],
                    help="mp3 (default, ~10x smaller, needs ffmpeg) or wav")
    ap.add_argument("--force", action="store_true", help="regenerate clips that already exist")
    args = ap.parse_args()

    audio_dir = Path(args.pack_dir) / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)

    if args.format == "mp3" and not shutil.which("ffmpeg"):
        sys.exit("ffmpeg not found — run `brew install ffmpeg`, or pass --format wav")

    # jobs.json stores an extension-less hash id; the clip filename is that id
    # plus the chosen container, so switching format never re-keys anything.
    def clip_name(job):
        return f"{job['file']}.{args.format}"

    data = load_jobs(audio_dir)
    jobs = data["jobs"]
    locale = data.get("locale", "nl-NL")
    index = load_index(audio_dir)
    clips = index.setdefault("clips", {})

    todo = [
        j for j in jobs
        if args.force or j["key"] not in clips or not (audio_dir / clip_name(j)).exists()
    ]
    if args.limit:
        todo = todo[: args.limit]

    print(f"{len(jobs)} spoken lines, {len(todo)} to generate as {args.format}"
          + (" (dry run)" if args.dry_run else f" via {args.engine}"))
    if not todo:
        write_index(audio_dir, index)
        return

    render = None
    if not args.dry_run:
        render, model_id = ENGINES[args.engine](args, locale)
        index["model"] = model_id

    for i, job in enumerate(todo, 1):
        fname = clip_name(job)
        out = audio_dir / fname
        print(f"[{i}/{len(todo)}] {job['text']!r} -> {fname}")
        try:
            pcm = silent_pcm() if args.dry_run else render(job["text"])
            write_clip(out, pcm, args.format)
        except Exception as e:  # keep going; a bad line shouldn't lose the batch
            print(f"    FAILED: {e}", file=sys.stderr)
            continue
        clips[job["key"]] = fname
        # Persist after every clip so a long run is resumable on interrupt.
        write_index(audio_dir, index)

    if not args.dry_run:
        print("Done. Commit the audio/ directory or host it as static assets.")


if __name__ == "__main__":
    main()
