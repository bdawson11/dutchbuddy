# Studio voice-over pipeline (v2 pre-generated TTS)

The app's audio contract (`src/engine/audio.js`) is layered: if a pack ships
`public/packs/<pack>/audio/index.json`, every lesson line found in that index
plays a **pre-generated studio clip**; anything else (and dynamic text like
builder sentences) falls back to the Web Speech voice picker shipped in the
v1.5 quality pass. No lesson JSON or component changes are needed to light
this up — generate the clips, drop them in the pack, done.

## Models (chosen per language)

Configured in `tools/tts-models.json`:

| Pack | Model | Engine | Voice identity |
|------|-------|--------|----------------|
| `italian-it` | [`alien79/F5-TTS-italian`](https://huggingface.co/alien79/F5-TTS-italian) | `f5` | cloned from ~10 s reference clips |
| `german-de` | [`cstr/kartoffel-orpheus-3b-german-synthetic-GGUF`](https://huggingface.co/cstr/kartoffel-orpheus-3b-german-synthetic-GGUF) | `orpheus-gguf` | named voices baked into the model |
| `spanish-es` | [`neuphonic/neutts-nano-spanish-q8-gguf`](https://huggingface.co/neuphonic/neutts-nano-spanish-q8-gguf) | `neutts-gguf` | cloned from 3–15 s reference clips |
| `dutch-nl` | *(none yet — Web Speech v1.5)* | | |

Order of work: **Italian first, then German, then Spanish** (per project
direction). Dutch stays on the ranked Web Speech picker until a model is
chosen.

## Where the compute runs

Generation needs GPU-class compute and open network access to
huggingface.co. The Claude remote container **can't run it** (HF is blocked
by the environment network policy and there is no GPU), so this is a
run-locally workflow. Everything in the app and repo is already wired; the
only artifact you produce locally is the `audio/` directory per pack.

## Runbook (Italian example)

```bash
# 1. Extract every voiced line from the pack (1,186 lines for Italian)
node tools/extract-voiced-lines.mjs public/packs/italian-it > /tmp/italian-lines.json

# 2. Reference voices: F5 clones from ~10s clips. Files are named by voice —
#    a required default.<wav|mp3|flac> (narrator/fallback) plus optional
#    per-cast clips (Giulia.mp3, Marco.mp3, …) in tools/tts-refs/italian-it/.
#    Transcripts (<name>.txt) are OPTIONAL — F5 auto-transcribes the clip with
#    Whisper when absent; add one for best fidelity. Mozilla Common Voice
#    italian clips (CC0, ~5-10s, native speakers) are ideal:
#    https://commonvoice.mozilla.org/it/datasets
#    (The italian-it pack already ships three CC0 references — see
#     tools/tts-refs/italian-it/SOURCES.md — so you can skip straight to run.)

# 3. Install deps and smoke-test 10 lines
pip install f5-tts huggingface_hub soundfile   # + ffmpeg on PATH for mp3
python3 tools/generate-audio.py --pack italian-it --lines /tmp/italian-lines.json --limit 10

# 4. Listen to public/packs/italian-it/audio/*.mp3. Happy? Full run:
python3 tools/generate-audio.py --pack italian-it --lines /tmp/italian-lines.json
#    (interruptible — already-rendered clips are skipped on rerun;
#     --days day-01,...,day-07 renders one week at a time)

# 5. Ship it
npm run validate:italian-it && npm run build
git add public/packs/italian-it/audio && git commit && git push
```

German swaps step 2 for voice names: Orpheus voices are baked in, so set
`"voice"` (and optionally per-cast `"speakerVoices"`) in
`tools/tts-models.json` using the names on the kartoffel model card, and
install `llama-cpp-python snac torch soundfile huggingface_hub` instead.
Spanish works like Italian (reference clips in `tools/tts-refs/spanish-es/`,
**Peninsular speakers only** — this is the Castilian-identity pack) with
`pip install git+https://github.com/neuphonic/neutts-air` plus system
`espeak-ng`.

## What the app does with the output

- `index.json` maps each exact lesson string → clip file; `speak(text)`
  checks it first, so dialogue, chips, shadowing, and dictation all get the
  studio voice with zero content changes.
- Shadow blocks request slower speech; clips honor it via `playbackRate`
  scaling (pitch-preserving).
- The 🎙 voice panel shows a "studio voice active" banner (label + model from
  `index.json`) and demotes the system-voice list to fallback-only.
- Lines with no clip — new content, failed renders, builder output — fall
  back to the ranked Web Speech voice silently. A pack with no `audio/` dir
  at all behaves exactly as before this pipeline existed.

## Verification checklist per pack

1. `--limit 10` smoke run; listen for: correct language/accent, no clipped
   endings, consistent loudness across speakers.
2. Spot-check character voices differ where refs/voice names differ
   (dialogue days: 2, 62, 83).
3. Full run, then `node tools/extract-voiced-lines.mjs <pack>` again and
   confirm `index.json` covers `count` lines (rerun retries failures).
4. In-app: open a dialogue day, confirm studio banner in the 🎙 panel and
   clip playback; type a builder sentence and confirm TTS fallback still
   speaks.
5. Repo weight: ~1,200 short mp3 clips ≈ 30–60 MB per pack. Fine for now;
   revisit hosting (LFS/CDN) before all four packs carry audio.

## Licensing notes

- Reference clips: use CC0 sources (Mozilla Common Voice) so cloned voice
  identity carries no attribution burden. Keep the source clip IDs noted in
  the pack's `audio/SOURCES.md` if you want provenance.
- Check each model's card for output-usage terms before publishing clips
  (F5-TTS base is CC-BY-NC for some checkpoints; fine-tune cards state their
  own terms; NeuTTS and kartoffel models likewise).
