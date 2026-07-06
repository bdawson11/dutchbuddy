# Neural TTS pipeline (Dutch)

The app's default voice is the browser's Web Speech API. Its Dutch is poor — the
hard *g*, *sch*, and words like *Scheveningen* come out wrong. This pipeline
replaces it with pre-rendered clips from a neural TTS model.

The default engine is **Coqui XTTS-v2**: natural flow and intonation, Dutch
supported out of the box, fast enough to render a full pack on a laptop CPU in
an hour or two. The fine-tuned Dutch **Tortoise** checkpoint
([`arrivederci19/tortoise_tts_dutch`](https://huggingface.co/arrivederci19/tortoise_tts_dutch))
remains available via `--engine tortoise` (much slower; GPU recommended).

> **License note:** XTTS-v2 ships under the Coqui Public Model License —
> **non-commercial use only**. Fine for a free app; revisit the engine choice
> before ever monetising. The first model download asks you to accept it.

Neural TTS is far too heavy to run in the browser or in real time, so synthesis
is an **offline build step**: render every spoken line once, ship the clips as
static assets, and the app plays them. `src/engine/audio.js` loads a pack's
`audio/index.json` and plays the matching clip, falling back to Web Speech for
anything not (yet) generated — so the app keeps working with zero clips and
improves as they land.

## How it fits together

```
extract.mjs  ──►  audio/jobs.json  ──►  generate.py  ──►  audio/<hash>.mp3
 (what the app                          (XTTS-v2 or          audio/index.json
  actually speaks)                       Tortoise)       (what the app plays)
```

- **`extract.mjs`** is the single source of truth for *what* gets spoken. It
  mirrors the `speak()` calls in `src/engine/blocks/index.jsx` (chips `speak`,
  dictation `speak`, dialogue/shadow `nl`) and writes a deduped `jobs.json`.
  The sentence builder is excluded — its text is composed live and always uses
  the Web Speech fallback.
- **`generate.py`** consumes `jobs.json` (never re-deriving that logic, so the
  audio played can't drift from the audio generated), synthesises each missing
  clip, and writes `index.json`. Jobs carry an extension-less hash id; the
  generator appends the container (`.mp3`/`.wav`), so format changes never
  re-key a clip.
- **`src/engine/ttsKey.js`** holds the one normalisation used to key clips, so
  the runtime looks a clip up under the exact key it was filed under.

## Run it

Extraction and the coverage check run in this repo:

```bash
npm run tts:extract   # regenerate public/packs/dutch-nl/audio/jobs.json
npm run tts:check     # report how many spoken lines still lack a clip
```

Generation runs wherever the model lives — a laptop CPU is fine for XTTS-v2.
Use a dedicated venv (`python3.11 -m venv`); XTTS and Tortoise pin conflicting
`transformers` versions, so they can't share one.

```bash
# XTTS-v2 (default engine); ffmpeg does the MP3 encoding (brew install ffmpeg)
pip install coqui-tts

python tools/tts/generate.py public/packs/dutch-nl --limit 3     # smoke test, then listen
python tools/tts/generate.py public/packs/dutch-nl               # full run (MP3)
python tools/tts/generate.py public/packs/dutch-nl --format wav  # WAV instead of MP3
python tools/tts/generate.py public/packs/dutch-nl --dry-run     # silent placeholders, no model
```

**Voice:** by default XTTS uses a bundled studio speaker (`--speaker`, default
"Ana Florence"). For the most accurate Dutch accent, pass
`--speaker-wav path/to/native-dutch.wav` — 6–10 seconds of one clean native
speaker — and XTTS clones that voice for every clip. Known weak spot: very
short single-word clips can occasionally pick up artifacts; smoke-test those
(`--limit 3` covers *man*/*maan*/*bos*) before a full run.

On a Mac, wrap the full run in `caffeinate -i …` so the machine doesn't sleep,
and tee the log:

```bash
caffeinate -i python tools/tts/generate.py public/packs/dutch-nl 2>&1 | tee ~/tts-run.log
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

### Tortoise engine

```bash
# separate venv! psutil is imported by tortoise at runtime but not declared
pip install tortoise-tts huggingface_hub torch torchaudio psutil
python tools/tts/generate.py public/packs/dutch-nl --engine tortoise --preset fast
```

The generator normalises the fine-tune's checkpoint filename to
`autoregressive.pth` and leaves Tortoise's diffusion/vocoder/CLVP models as the
English defaults — only the autoregressive model carries the Dutch voice.

## Other packs

The engine is language-agnostic: point both tools at `public/packs/<pack>` and
XTTS reads the language from the pack's locale in `jobs.json` (German, Italian
and Spanish are all supported). Only Dutch is wired into the npm scripts today.
