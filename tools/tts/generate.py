#!/usr/bin/env python3
"""Render a pack's spoken lines to audio clips with Tortoise TTS (Dutch).

Pipeline:

    node tools/tts/extract.mjs public/packs/dutch-nl     # writes audio/jobs.json
    python tools/tts/generate.py public/packs/dutch-nl   # writes clips + index.json

This reads the job list produced by extract.mjs (never re-deriving what to
speak), synthesises each still-missing clip with the fine-tuned Dutch model
at https://huggingface.co/arrivederci19/tortoise_tts_dutch, and writes
audio/index.json mapping each spoken line to its clip file. The runtime
(src/engine/audio.js) loads that index and plays the clips, falling back to the
browser voice for anything absent.

Tortoise is autoregressive and GPU-bound — generation is an offline build step,
not something the app does live. Run it on a CUDA box, commit the resulting
audio/ directory (or host it as static assets), and ship.

Requirements (install on the generation machine, not in this web project):
    pip install tortoise-tts huggingface_hub torch torchaudio psutil
    # psutil is imported by tortoise at runtime but missing from its deps

Modes:
    --dry-run   Write short silent placeholder clips + a valid index.json with
                no model at all. Lets you exercise the full runtime path (the
                app will "play" real files) before committing to a GPU run.
    --limit N   Only generate the first N missing clips (smoke test).
    --preset    Tortoise quality preset: ultra_fast | fast (default) | standard
                | high_quality.
"""

import argparse
import json
import os
import struct
import sys
import wave
from pathlib import Path

MODEL_REPO = "arrivederci19/tortoise_tts_dutch"
SAMPLE_RATE = 24000  # Tortoise renders at 24 kHz


def load_jobs(audio_dir: Path):
    jobs_path = audio_dir / "jobs.json"
    if not jobs_path.exists():
        sys.exit(
            f"No {jobs_path}. Run: node tools/tts/extract.mjs {audio_dir.parent}"
        )
    return json.loads(jobs_path.read_text())["jobs"]


def load_index(audio_dir: Path):
    index_path = audio_dir / "index.json"
    if index_path.exists():
        return json.loads(index_path.read_text())
    return {"model": MODEL_REPO, "clips": {}}


def write_index(audio_dir: Path, index: dict):
    index_path = audio_dir / "index.json"
    index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
    print(f"Wrote {index_path} ({len(index['clips'])} clips)")


def write_silence(path: Path, seconds: float = 0.35):
    """A valid, tiny silent WAV — enough for the runtime to treat the line as
    'has a clip' during a --dry-run."""
    frames = int(SAMPLE_RATE * seconds)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        w.writeframes(struct.pack("<%dh" % frames, *([0] * frames)))


def build_tts(preset: str):
    """Download the Dutch checkpoint and build a Tortoise engine around it.
    Imported lazily so --dry-run needs none of the ML stack."""
    from huggingface_hub import snapshot_download
    import torch
    import torchaudio  # noqa: F401  (import surfaces a clear error early if missing)
    from tortoise.api import TextToSpeech

    print(f"Fetching {MODEL_REPO} …")
    repo = Path(snapshot_download(MODEL_REPO))

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
    return tts, preset


def synth(tts_bundle, text: str, out: Path):
    import torch
    import torchaudio

    tts, preset = tts_bundle
    with torch.no_grad():
        # No reference voice samples: the fine-tuned model supplies the Dutch
        # timbre. Swap in load_voices([...]) here to clone a specific speaker.
        gen = tts.tts_with_preset(
            text, voice_samples=None, conditioning_latents=None, preset=preset
        )
    torchaudio.save(str(out), gen.squeeze(0).cpu(), SAMPLE_RATE)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("pack_dir", help="e.g. public/packs/dutch-nl")
    ap.add_argument("--dry-run", action="store_true", help="silent placeholders, no model")
    ap.add_argument("--limit", type=int, default=0, help="only the first N missing clips")
    ap.add_argument("--preset", default="fast",
                    choices=["ultra_fast", "fast", "standard", "high_quality"])
    ap.add_argument("--force", action="store_true", help="regenerate clips that already exist")
    args = ap.parse_args()

    audio_dir = Path(args.pack_dir) / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)

    jobs = load_jobs(audio_dir)
    index = load_index(audio_dir)
    clips = index.setdefault("clips", {})
    index["model"] = MODEL_REPO

    todo = [
        j for j in jobs
        if args.force or j["key"] not in clips or not (audio_dir / j["file"]).exists()
    ]
    if args.limit:
        todo = todo[: args.limit]

    print(f"{len(jobs)} spoken lines, {len(todo)} to generate"
          + (" (dry run)" if args.dry_run else ""))
    if not todo:
        write_index(audio_dir, index)
        return

    tts_bundle = None if args.dry_run else build_tts(args.preset)

    for i, job in enumerate(todo, 1):
        out = audio_dir / job["file"]
        print(f"[{i}/{len(todo)}] {job['text']!r} -> {job['file']}")
        try:
            if args.dry_run:
                write_silence(out)
            else:
                synth(tts_bundle, job["text"], out)
        except Exception as e:  # keep going; a bad line shouldn't lose the batch
            print(f"    FAILED: {e}", file=sys.stderr)
            continue
        clips[job["key"]] = job["file"]
        # Persist after every clip so a long GPU run is resumable on interrupt.
        write_index(audio_dir, index)

    if not args.dry_run:
        print("Done. Commit the audio/ directory or host it as static assets.")


if __name__ == "__main__":
    main()
