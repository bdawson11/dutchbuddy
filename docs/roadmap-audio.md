# YapWorld — Real-Voice Audio Roadmap (XTTS rollout + what comes next)

Written mid-flight: the Dutch XTTS batch is running locally (clips landing in
`public/packs/dutch-nl/audio/`, cloned from a ~10s Mozilla Common Voice
reference clip). This doc reviews where the app stands, plans the same rollout
for German, Italian and Spanish, and splits the work into what needs you at
the laptop, what you can decide from your phone, and what can be done for you
while you're away.

---

## 1. Where the app stands (July 2026)

| Area | State |
|------|-------|
| Shell | Unified YapWorld app shipped: login → language picker → course, per-language accent theming, cozy design pass done |
| Content | 4 packs × 98 days (A1→B1 core + B2 weeks 13–14), all validating clean; weeks 15–18 scoped, "coming soon" |
| Engine | 11 block types, per-profile localStorage progress, grading with per-pack diacritic config |
| Audio | **v2 shipped in this branch**: pre-generated clips with Web Speech fallback (see §2). Dutch clips generating locally now |
| Media | **New**: per-language "Learn by watching" dashboard section — classic shows & films per pack, level-tagged, dialect-aware |
| Tooling | `validate.js` (content), `audio-manifest.js` (speakable-string inventory + clip coverage), `xtts/generate_audio.py` (canonical batch generator) |

The single biggest UX gap was robotic Web Speech voices — the thing the XTTS
work is fixing. After audio, the largest gaps are weeks 15–18 content, native
review, and deploy hygiene (§6).

## 2. How the audio pipeline works now

Everything meets at one contract: `public/packs/<pack>/audio/index.json`
mapping exact spoken text → mp3 filename.

- `src/engine/audio.js` — loads the pack's `index.json` at course load; plays
  clips when the text matches, falls back to Web Speech otherwise (builder
  sentences are assembled at runtime, so the fallback stays permanently live).
  Text matching is NFC + collapsed whitespace on both sides. Shadow blocks'
  "slow" intent plays clips at 0.8× (pitch-preserving).
- `tools/audio-manifest.js <pack-dir>` — inventory + coverage report
  (`--missing` lists gaps, `--json` exports text+hash for other tools).
- `tools/xtts/generate_audio.py <pack-dir> --speaker-wav ref.wav` — the
  canonical generator: extracts the same inventory, synthesizes with XTTS-v2,
  encodes 48k mono mp3 via ffmpeg, updates `index.json` after every clip.
  **Resumable and filename-agnostic**: anything already in `index.json` whose
  file exists is skipped, so your in-flight Dutch run stays valid even though
  it predates this script — running the canonical script afterwards just tops
  up whatever it missed (the repo inventory counts 1,146 strings vs the
  ~1,092 your run is producing; the delta is likely later content edits).

## 3. Rollout per language

Inventory as of today (from `npm run audio:manifest -- public/packs/<pack>`):

| Pack | Unique strings | Chars | Est. clips size¹ | Est. batch time² |
|------|---------------|-------|------------------|------------------|
| dutch-nl | 1,146 | 33.8k | ~25 MB | in progress |
| german-de | 1,249 | 41.1k | ~30 MB | ~1 Dutch-run |
| spanish-es | 1,165 | 40.0k | ~29 MB | ~1 Dutch-run |
| italian-it | 1,186 | 38.3k | ~28 MB | ~1 Dutch-run |

¹ 48 kbps mono mp3, avg ~3.5 s/clip. ² Each pack is ±10% of your Dutch run —
whatever wall-clock that takes is the per-language budget.

Suggested order **German → Spanish → Italian** (same rationale as the content
roadmap: German QAs fastest after Dutch, Spanish has the largest audience).

Per-language runbook (after Dutch proves the pipeline):

1. Pick a reference voice (§4 — phone-friendly).
2. Smoke run: `python tools/xtts/generate_audio.py public/packs/german-de
   --speaker-wav ~/refs/german-ref.wav --limit 20`, listen to all 20.
   Numbers, questions and the longest dialogue lines are where XTTS wobbles.
3. Full run (unattended — it's resumable, so interruptions are free).
4. `npm run audio:manifest -- public/packs/german-de` → 100% coverage.
5. Spot-listen ~20 random clips + commit + push; check one iOS and one
   Android device (autoplay policies differ; all playback here is
   tap-triggered, which both allow).

Voice identity per pack matters as much as text identity: Netherlands Dutch,
Hochdeutsch, standard Italian, Castilian — one wrong-accent reference clip
recolors an entire course.

## 4. Who does what

### Needs you at the laptop (GPU + ffmpeg + the reference wavs)
- Finish the Dutch run; commit `public/packs/dutch-nl/audio/` and push.
- Run the canonical script once over the finished Dutch dir (tops up the ~54
  newer strings your extractor didn't see; skips everything else).
- The three remaining generation runs (each: one command, then walk away).
- Final listen-QA before each language ships — taste calls are yours.

### Phone-OK while you're away
- **Pick reference voices**: browse commonvoice.mozilla.org per language in
  the phone browser, listen, and shortlist. Criteria: single native speaker
  matching the pack's dialect identity, clean recording (no clipping/hiss),
  natural pace, 6–15 s with some intonation variety. CC0 licensing makes
  Common Voice the right pool (see §5).
- Approve/adjust the "Learn by watching" picks (they're in the four
  manifests — easy to review on GitHub mobile).
- Decide clip hosting (§5): plain git commit (recommended at ~110 MB total)
  vs Git LFS vs external bucket.
- Merge this branch's PR when you're happy with it.

### Can be done in your absence (agent session, no laptop needed)
- Everything in this branch (engine, tools, media, docs) — **done**.
- If you get me a per-language reference wav (record/download on your phone,
  share a link or drop it in the repo), a cloud session can in principle run
  the generation on CPU — slow (overnight per language) but unattended, and
  the script's resumability tolerates session restarts. Caveats: this
  environment is ephemeral with proxied network, and the ~2 GB model download
  + `coqui-tts` install haven't been verified here — treat as an experiment,
  with your GPU as the reliable path.
- Follow-up automation whenever wanted: clip-duration sanity checker (flags
  <0.5 s or >15 s clips — XTTS's failure mode is trailing hallucination), CI
  step running validator + coverage on every PR, weeks 15–18 content batches.

## 5. Storage & licensing (decide once, applies to all four)

- **Size**: ~110 MB of mp3 across four packs. Recommendation: commit them
  (simplest; Vercel serves static files happily and lesson JSON already ships
  this way). Git LFS only if repo weight starts to hurt; an external bucket
  is over-engineering at this scale.
- **XTTS-v2 license**: the model weights are under the Coqui Public Model
  License — **non-commercial**. A free, donation-supported app is the
  gentle end of that spectrum, but revisit before any paid tier; swapping the
  generator (e.g. a commercially-licensed TTS) later only changes mp3s, not
  the app.
- **Reference voices**: Common Voice clips are CC0 — cloning is
  license-clean, no attribution required. Two soft touches worth doing
  anyway: use a different contributor per language, and add one line to the
  app footer noting the course voices are AI-generated.

## 6. After audio — the next roadmap layers

1. **Weeks 15–18 (days 99–126) content** per language — the biggest content
   gap; agent-batchable with the established style guides, native review after.
2. **Native-speaker review passes** (open item from the multilingual
   roadmap) — now doubly valuable: reviewers can flag both text and clips.
3. **Deploy hygiene before public launch**: exclude authoring `.md` docs from
   `public/packs/*` in the build; OG/share cards; domain + donation link.
4. **Listening-first exercises**: with real voices, dictation stops being a
   punishment — a "listen without text" comprehension block and a slow/fast
   toggle become worth building.
5. **PWA/offline**: clips make offline mode genuinely useful (course + audio
   cached = airplane-mode Dutch).
6. **Real auth/sync** when cross-device progress matters (auth.js is the
   single swap point).

---

*Companion docs: `docs/roadmap-multilingual.md` (expansion strategy),
`docs/plan.md` (schemas, curriculum), per-language `docs/roadmap-<pack>.md`.*
