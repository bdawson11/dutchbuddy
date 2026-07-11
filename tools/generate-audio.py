#!/usr/bin/env python3
"""Render a pack's voiced lines to studio clips with a neural TTS model.

This is authoring tooling: run it on a machine with GPU-class compute and
open network access to huggingface.co (the app itself never runs a model —
it plays the clips this script writes). Full runbook: docs/tts-pipeline.md.

  node tools/extract-voiced-lines.mjs public/packs/italian-it > lines.json
  python3 tools/generate-audio.py --pack italian-it --lines lines.json

Engines (selected per pack in tools/tts-models.json):
  f5            F5-TTS fine-tunes, e.g. alien79/F5-TTS-italian. Voice identity
                comes from ~10-second reference clips + transcripts in
                refsDir: <Speaker>.wav + <Speaker>.txt per cast member, and a
                required default.wav + default.txt for narrator lines.
                Mozilla Common Voice (CC0) clips are ideal references.
                Deps: pip install f5-tts huggingface_hub soundfile
  orpheus-gguf  Orpheus-3B GGUF quants run through llama.cpp, e.g.
                cstr/kartoffel-orpheus-3b-german-synthetic-GGUF. Voices are
                baked into the model and selected by name ("voice" /
                "speakerVoices" in tts-models.json — names are listed on the
                model card). Token-to-SNAC decoding follows the reference
                Orpheus implementation; verify voice names + prompt format
                against the model card before a full run.
                Deps: pip install llama-cpp-python snac torch soundfile huggingface_hub
  neutts-gguf   Neuphonic NeuTTS GGUF backbones + NeuCodec, e.g.
                neuphonic/neutts-nano-spanish-q8-gguf. Voice identity comes
                from reference clips exactly like the f5 engine (refsDir with
                <Speaker>.wav/.txt + default.wav/.txt, 3-15s each — use
                Peninsular/Castilian speakers for spanish-es!).
                Deps: pip install git+https://github.com/neuphonic/neutts-air
                plus espeak-ng installed on the system (phonemizer backend)

Clips are written to public/packs/<pack>/audio/ as mp3 (ffmpeg on PATH) or
wav, plus an index.json mapping each exact lesson string to its clip file.
Already-rendered clips are skipped, so an interrupted run resumes cleanly.
Use --limit for a smoke test and --days day-01,day-02 to scope a batch.
"""

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SAMPLE_RATE = 24_000  # both supported engines emit 24 kHz mono


def die(msg):
    sys.exit(f"generate-audio: {msg}")


def write_clip(wav, out_path, mp3=True):
    """wav: float32 numpy array at SAMPLE_RATE. Returns the filename written."""
    import soundfile as sf

    wav_path = out_path.with_suffix(".wav")
    sf.write(wav_path, wav, SAMPLE_RATE)
    if mp3:
        mp3_path = out_path.with_suffix(".mp3")
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path),
             "-ac", "1", "-b:a", "64k", str(mp3_path)],
            check=True,
        )
        wav_path.unlink()
        return mp3_path.name
    return wav_path.name


class F5Engine:
    def __init__(self, cfg):
        from huggingface_hub import hf_hub_download, list_repo_files
        from f5_tts.api import F5TTS

        repo = cfg["model"]
        files = list_repo_files(repo)
        ckpt = next((f for f in files if f.endswith((".safetensors", ".pt"))), None)
        vocab = next((f for f in files if f.endswith("vocab.txt")), None)
        if not ckpt:
            die(f"{repo}: no .safetensors/.pt checkpoint found in the repo")
        self.tts = F5TTS(
            ckpt_file=hf_hub_download(repo, ckpt),
            vocab_file=hf_hub_download(repo, vocab) if vocab else "",
        )
        self.refs = {}
        refs_dir = REPO / cfg["refsDir"]
        for txt in refs_dir.glob("*.txt"):
            audio = next(
                (p for ext in (".wav", ".mp3", ".flac")
                 if (p := txt.with_suffix(ext)).exists()),
                None,
            )
            if audio:
                self.refs[txt.stem] = (str(audio), txt.read_text().strip())
        if "default" not in self.refs:
            die(f"{refs_dir}/default.wav + default.txt are required (~10s reference "
                "clip + its transcript; a Mozilla Common Voice CC0 clip works well)")
        print(f"f5: {repo} with reference voices: {', '.join(sorted(self.refs))}")

    def synth(self, text, speaker):
        ref_file, ref_text = self.refs.get(speaker) or self.refs["default"]
        wav, _sr, _spect = self.tts.infer(
            ref_file=ref_file, ref_text=ref_text, gen_text=text, remove_silence=True
        )
        return wav


class OrpheusGGUFEngine:
    # Token constants from the reference Orpheus implementation: generation is
    # framed as llama tokens; ids >= AUDIO_BASE are SNAC codes, 7 per frame.
    START, END_TEXT, END_PROMPT = 128259, 128009, 128260
    AUDIO_START, AUDIO_EOS, AUDIO_BASE = 128257, 128258, 128266

    def __init__(self, cfg):
        from huggingface_hub import hf_hub_download, list_repo_files
        from llama_cpp import Llama
        from snac import SNAC

        repo = cfg["model"]
        gguf = cfg.get("ggufFile") or next(
            (f for f in list_repo_files(repo) if f.endswith(".gguf")), None
        )
        if not gguf:
            die(f"{repo}: no .gguf file found; set ggufFile in tts-models.json")
        self.llm = Llama(
            model_path=hf_hub_download(repo, gguf),
            n_ctx=4096, n_gpu_layers=-1, verbose=False,
        )
        self.snac = SNAC.from_pretrained("hubertsiuzdak/snac_24khz").eval()
        self.voice = cfg.get("voice")
        self.speaker_voices = cfg.get("speakerVoices") or {}
        print(f"orpheus-gguf: {repo} ({gguf}), default voice: {self.voice or '(none)'}")

    def synth(self, text, speaker):
        import torch

        voice = self.speaker_voices.get(speaker, self.voice)
        prompt = f"{voice}: {text}" if voice else text
        ids = ([self.START] + self.llm.tokenize(prompt.encode(), add_bos=False)
               + [self.END_TEXT, self.END_PROMPT])
        out = []
        for tok in self.llm.generate(ids, temp=0.4, top_p=0.9, repeat_penalty=1.1):
            if tok == self.AUDIO_EOS:
                break
            out.append(tok)
            if len(out) > 8000:  # ~90s — runaway guard for short lesson lines
                break
        if self.AUDIO_START in out:  # keep only the audio stream
            out = out[out.index(self.AUDIO_START) + 1:]
        codes = [t - self.AUDIO_BASE - (i % 7) * 4096
                 for i, t in enumerate(out) if t >= self.AUDIO_BASE]
        codes = codes[: len(codes) - len(codes) % 7]
        if not codes:
            raise RuntimeError("model produced no audio tokens")
        l1, l2, l3 = [], [], []
        for f in range(0, len(codes), 7):
            c = codes[f:f + 7]
            l1.append(c[0])
            l2 += [c[1], c[4]]
            l3 += [c[2], c[3], c[5], c[6]]
        layers = [torch.tensor(l).unsqueeze(0) for l in (l1, l2, l3)]
        with torch.inference_mode():
            wav = self.snac.decode(layers)
        return wav.squeeze().cpu().numpy()


class NeuTTSEngine:
    def __init__(self, cfg):
        from neuttsair.neutts import NeuTTSAir

        self.tts = NeuTTSAir(
            backbone_repo=cfg["model"],
            codec_repo=cfg.get("codecRepo", "neuphonic/neucodec"),
        )
        self.refs = {}
        refs_dir = REPO / cfg["refsDir"]
        for txt in refs_dir.glob("*.txt"):
            audio = next(
                (p for ext in (".wav", ".mp3", ".flac")
                 if (p := txt.with_suffix(ext)).exists()),
                None,
            )
            if audio:
                # encode once per reference voice; reused for every line
                self.refs[txt.stem] = (
                    self.tts.encode_reference(str(audio)),
                    txt.read_text().strip(),
                )
        if "default" not in self.refs:
            die(f"{refs_dir}/default.wav + default.txt are required (3-15s "
                "Castilian reference clip + transcript; Mozilla Common Voice "
                "es clips from Peninsular speakers work well)")
        print(f"neutts: {cfg['model']} with reference voices: {', '.join(sorted(self.refs))}")

    def synth(self, text, speaker):
        ref_codes, ref_text = self.refs.get(speaker) or self.refs["default"]
        return self.tts.infer(text, ref_codes, ref_text)


ENGINES = {"f5": F5Engine, "orpheus-gguf": OrpheusGGUFEngine, "neutts-gguf": NeuTTSEngine}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--pack", required=True, help="pack dir name, e.g. italian-it")
    ap.add_argument("--lines", required=True, help="output of extract-voiced-lines.mjs")
    ap.add_argument("--limit", type=int, help="render at most N lines (smoke test)")
    ap.add_argument("--days", help="comma-separated day ids to scope the batch")
    args = ap.parse_args()

    models = json.loads((REPO / "tools" / "tts-models.json").read_text())
    cfg = models.get(args.pack) or die(f"no entry for '{args.pack}' in tools/tts-models.json")
    lines = json.loads(Path(args.lines).read_text())["lines"]
    if args.days:
        days = set(args.days.split(","))
        lines = [l for l in lines if days & set(l["days"])]
    if args.limit:
        lines = lines[: args.limit]

    out_dir = REPO / "public" / "packs" / args.pack / "audio"
    out_dir.mkdir(parents=True, exist_ok=True)
    index_path = out_dir / "index.json"
    index = json.loads(index_path.read_text()) if index_path.exists() else {}
    clips = index.get("clips", {})

    mp3 = shutil.which("ffmpeg") is not None
    if not mp3:
        print("warning: ffmpeg not found — writing wav (≈5× larger than mp3)")

    engine = ENGINES[cfg["engine"]](cfg)
    done = failed = 0
    for i, line in enumerate(lines):
        stem = Path(line["file"]).stem
        existing = clips.get(line["text"])
        if existing and (out_dir / existing).exists():
            continue
        speaker = line["speakers"][0] if line["speakers"] else None
        try:
            wav = engine.synth(line["text"], speaker)
            clips[line["text"]] = write_clip(wav, out_dir / stem, mp3=mp3)
            done += 1
        except Exception as e:  # keep the batch going; rerun picks up the rest
            failed += 1
            print(f"  FAIL [{line['file']}] {line['text'][:50]!r}: {e}")
        if (i + 1) % 25 == 0 or i + 1 == len(lines):
            index = {"model": cfg["model"], "engine": cfg["engine"],
                     "label": cfg.get("label", "Studio voice"), "clips": clips}
            index_path.write_text(json.dumps(index, ensure_ascii=False, indent=1))
            print(f"{i + 1}/{len(lines)} processed ({done} new, {failed} failed)")

    print(f"done: {len(clips)} clips indexed at {index_path}")
    if failed:
        print(f"{failed} line(s) failed — rerun the same command to retry just those")


if __name__ == "__main__":
    main()
