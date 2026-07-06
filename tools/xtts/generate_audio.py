#!/usr/bin/env python3
"""Batch-generate pre-recorded audio for a YapWorld content pack with XTTS-v2.

This is the canonical version of the script used for the dutch-nl run: point
it at a pack, give it a ~6-15s clean reference clip of the voice to clone,
and it synthesizes every speakable string in the pack's lessons into
<pack>/audio/*.mp3 plus an index.json the app's audio engine reads.

    python tools/xtts/generate_audio.py public/packs/german-de \
        --speaker-wav ~/refs/german-ref.wav

Setup (once, on the generation machine — GPU or Apple Silicon recommended):
    pip install coqui-tts        # maintained fork of TTS; needs Python 3.10+
    # ffmpeg must be on PATH for mp3 encoding
    # first run downloads the XTTS-v2 model (~1.8 GB)

Notes:
  * XTTS-v2 supports all four pack languages (nl, de, it, es). --language
    defaults to the pack manifest's locale prefix.
  * Resumable: strings already in index.json whose file exists are skipped,
    regardless of filename scheme — an index built by an earlier script
    version stays valid. index.json is rewritten after every clip, so a
    crashed or interrupted run loses at most the clip in flight.
  * The XTTS-v2 model weights ship under the Coqui Public Model License
    (non-commercial). Fine for a free app; revisit before any monetization.

Extraction rules mirror tools/audio-manifest.js and src/engine/blocks:
chips items[].speak, dictation block.speak, dialogue/shadow lines[].nl.
Lookup keys are NFC-normalized with collapsed whitespace, matching the
engine's normalization in src/engine/audio.js.
"""

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata
from pathlib import Path

XTTS_MODEL = "tts_models/multilingual/multi-dataset/xtts_v2"
XTTS_LANGS = {"en", "es", "fr", "de", "it", "pt", "pl", "tr", "ru", "nl", "cs", "ar", "zh-cn", "hu", "ko", "ja", "hi"}


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", unicodedata.normalize("NFC", text)).strip()


def clip_name(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16] + ".mp3"


def extract_strings(pack_dir: Path) -> list[str]:
    manifest = json.loads((pack_dir / "manifest.json").read_text())
    seen, out = set(), []

    def add(raw):
        if not raw:
            return
        text = normalize(raw)
        if text and text not in seen:
            seen.add(text)
            out.append(text)

    for day_id in (d for w in manifest["weeks"] for d in w["days"]):
        f = pack_dir / "lessons" / f"{day_id}.json"
        if not f.exists():
            continue
        for block in json.loads(f.read_text()).get("blocks", []):
            t = block.get("type")
            if t == "chips":
                for item in block.get("items", []):
                    add(item.get("speak"))
            elif t == "dictation":
                add(block.get("speak"))
            elif t in ("dialogue", "shadow"):
                for line in block.get("lines", []):
                    add(line.get("nl"))
    return out


def load_index(path: Path) -> dict:
    if not path.exists():
        return {"version": 1, "clips": {}}
    index = json.loads(path.read_text())
    if "clips" not in index:  # accept a flat {text: file} map from older runs
        index = {"version": 1, "clips": index}
    index["clips"] = {normalize(k): v for k, v in index["clips"].items()}
    return index


def save_index(path: Path, index: dict) -> None:
    tmp = path.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(index, ensure_ascii=False, indent=1))
    tmp.replace(path)
    print(f"Wrote {path} ({len(index['clips'])} clips)")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("pack", type=Path, help="pack dir, e.g. public/packs/german-de")
    ap.add_argument("--speaker-wav", type=Path, required=True, help="reference voice clip (~6-15s clean speech)")
    ap.add_argument("--language", help="XTTS language code; default = manifest locale prefix")
    ap.add_argument("--out", type=Path, help="output dir (default <pack>/audio)")
    ap.add_argument("--bitrate", default="48k", help="mp3 bitrate (default 48k mono — ~20 KB per short clip)")
    ap.add_argument("--limit", type=int, help="only generate the first N missing clips (smoke test)")
    ap.add_argument("--force", action="store_true", help="regenerate even if a clip already exists")
    ap.add_argument("--dry-run", action="store_true", help="list what would be generated, no synthesis")
    args = ap.parse_args()

    manifest = json.loads((args.pack / "manifest.json").read_text())
    language = args.language or manifest["locale"].split("-")[0].lower()
    if language not in XTTS_LANGS:
        sys.exit(f"language '{language}' is not supported by XTTS-v2 ({sorted(XTTS_LANGS)})")

    out_dir = args.out or args.pack / "audio"
    out_dir.mkdir(parents=True, exist_ok=True)
    index_path = out_dir / "index.json"
    index = load_index(index_path)
    index.update({"language": language, "voice": args.speaker_wav.stem, "model": XTTS_MODEL})

    strings = extract_strings(args.pack)
    todo = [
        t for t in strings
        if args.force or t not in index["clips"] or not (out_dir / index["clips"][t]).exists()
    ]
    if args.limit:
        todo = todo[: args.limit]
    print(f"{manifest['packId']}: {len(strings)} strings, {len(strings) - len(todo)} already done, {len(todo)} to generate [{language}]")
    if args.dry_run or not todo:
        for t in todo:
            print(f"  TODO {t!r} -> {clip_name(t)}")
        return 0

    if not args.speaker_wav.exists():
        sys.exit(f"speaker wav not found: {args.speaker_wav}")
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg not found on PATH (needed for mp3 encoding)")

    import torch  # noqa: F401 — imported for device detection below
    from TTS.api import TTS

    device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
    print(f"Loading {XTTS_MODEL} on {device}…")
    tts = TTS(XTTS_MODEL).to(device)

    for i, text in enumerate(todo, 1):
        file = clip_name(text)
        print(f"[{i}/{len(todo)}] {text!r} -> {file}")
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            wav_path = tmp.name
        try:
            tts.tts_to_file(
                text=text,
                speaker_wav=str(args.speaker_wav),
                language=language,
                file_path=wav_path,
            )
            subprocess.run(
                ["ffmpeg", "-loglevel", "error", "-y", "-i", wav_path,
                 "-ac", "1", "-b:a", args.bitrate, str(out_dir / file)],
                check=True,
            )
        finally:
            Path(wav_path).unlink(missing_ok=True)
        index["clips"][text] = file
        save_index(index_path, index)

    print("Done. Spot-check a few clips, then run:")
    print(f"  node tools/audio-manifest.js {args.pack}   # coverage report")
    return 0


if __name__ == "__main__":
    sys.exit(main())
