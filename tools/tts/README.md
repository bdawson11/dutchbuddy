# Neural TTS pipeline (Tortoise, Dutch)

The app's default voice is the browser's Web Speech API. Its Dutch is poor — the
hard *g*, *sch*, and words like *Scheveningen* come out wrong. This pipeline
replaces it with pre-rendered clips from a fine-tuned Dutch **Tortoise TTS**
model ([`arrivederci19/tortoise_tts_dutch`](https://huggingface.co/arrivederci19/tortoise_tts_dutch)).

Tortoise is an autoregressive, GPU-bound neural model — far too heavy to run in
the browser or in real time. So synthesis is an **offline build step**: render
every spoken line once, ship the clips as static assets, and the app plays them.
`src/engine/audio.js` loads a pack's `audio/index.json` and plays the matching
clip, falling back to Web Speech for anything not (yet) generated — so the app
keeps working with zero clips and improves as they land.

## How it fits together

```
extract.mjs  ──►  audio/jobs.json  ──►  generate.py  ──►  audio/<hash>.wav
 (what the app                          (Tortoise on a         audio/index.json
  actually speaks)                       GPU box)          (what the app plays)
```

- **`extract.mjs`** is the single source of truth for *what* gets spoken. It
  mirrors the `speak()` calls in `src/engine/blocks/index.jsx` (chips `speak`,
  dictation `speak`, dialogue/shadow `nl`) and writes a deduped `jobs.json`.
  The sentence builder is excluded — its text is composed live and always uses
  the Web Speech fallback.
- **`generate.py`** consumes `jobs.json` (never re-deriving that logic, so the
  audio played can't drift from the audio generated), synthesises each missing
  clip, and writes `index.json`.
- **`src/engine/ttsKey.js`** holds the one normalisation used to key clips, so
  the runtime looks a clip up under the exact key it was filed under.

## Run it

Extraction and the coverage check run in this repo:

```bash
npm run tts:extract   # regenerate public/packs/dutch-nl/audio/jobs.json
npm run tts:check     # report how many spoken lines still lack a clip
```

Generation runs where the model lives — a CUDA GPU box is fastest, but CPU
(e.g. a Mac) works for a full pack if you leave it running for a few hours.

```bash
# psutil is used by tortoise at runtime but not declared as a dependency;
# ffmpeg does the MP3 encoding (brew install ffmpeg on macOS)
pip install tortoise-tts huggingface_hub torch torchaudio psutil

python tools/tts/generate.py public/packs/dutch-nl              # full run (MP3)
python tools/tts/generate.py public/packs/dutch-nl --limit 5    # generate a handful first
python tools/tts/generate.py public/packs/dutch-nl --format wav # WAV instead of MP3
python tools/tts/generate.py public/packs/dutch-nl --dry-run    # silent placeholders, no model — smoke-test the runtime
```

On a CPU-only Mac, wrap the full run in `caffeinate -i …` so the machine
doesn't sleep, and tee the log:

```bash
caffeinate -i python tools/tts/generate.py public/packs/dutch-nl --preset ultra_fast 2>&1 | tee ~/tts-run.log
```

**Output format:** MP3 by default (64 kbps mono — transparent for speech, ~10x
smaller than WAV, so all ~1150 clips commit to ~20 MB instead of ~180 MB). MP3
plays in every browser including Safari, and the runtime plays whatever
`index.json` names, so the format is invisible to the app. Pass `--format wav`
if you'd rather not depend on ffmpeg.

`generate.py` writes `index.json` after every clip, so a long run is resumable
and re-running only fills the gaps. Commit the clips + `audio/index.json`
(or host them as static assets) to ship the voice. **Do not** commit `--dry-run`
output — those clips are silent.

Notes:
- Other packs use the same engine; point both tools at `public/packs/<pack>` to
  add neural audio for another language (with an appropriate model).
- The generator normalises the fine-tune's checkpoint filename to
  `autoregressive.pth` and leaves Tortoise's diffusion/vocoder/CLVP models as
  the English defaults — only the autoregressive model carries the Dutch voice.
  To clone a specific speaker, wire `load_voices([...])` into `synth()`.
