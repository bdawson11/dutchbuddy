# YapWorld — Expansion Roadmap (languages 5+, tooling, features)

Written 2026-07-06. Companion to `docs/roadmap-multilingual.md` (which covered
growing DutchBuddy into the four-pack YapWorld — now shipped). This doc covers
what comes next: **which languages to add**, **how to make each addition as
close to zero engine work as possible**, **what features to add to the app**,
and a **run-it-today execution plan** (§5) broken into Claude Code sessions.

Current state for reference: four packs (`dutch-nl`, `german-de`, `italian-it`,
`spanish-es`), each 98/126 days authored (A1–B1 core + B2 weeks 13–14 complete;
weeks 15–18 pending). Engine is fully data-driven — a new pack needs no engine
changes today, except for the debt items in §2.

---

## 1. Language roadmap

Languages are tiered by **engine readiness**, not just audience size. Tier 1
works on today's engine unchanged. Tier 2 needs one-line grading/normalization
tweaks. Tier 3 needs real engine features (reading aids, tokenization, script
modules, RTL) — build those once and the whole tier unlocks.

### Tier 1 — engine-ready today (Latin script, spaced, good TTS)

| Pack | Identity (house style: one specific dialect) | Grammar spine sketch | Notes |
|------|---------------------------------------------|----------------------|-------|
| `french-fr` | France French, not Québécois | gender + agreement · passé composé vs imparfait · object/y/en pronouns · subjunctive | **Largest learner audience of any candidate.** Day-74 meta-module: tu/vous + register. Grading: elision/apostrophe tolerance (`l'` / `l'`, curly vs straight) alongside diacritics. |
| `portuguese-br` | Brazilian Portuguese, not European | ser/estar · pretérito perfeito vs imperfeito · verb conjugation + subject flexibility · subjunctive | Recommend **pt-BR over pt-PT**: far larger audience and much better TTS voices. The house pattern is "one specific dialect identity," not "European" — Brazilian is that identity here. Huge transfer from the Spanish pack's curriculum. |
| `swedish-se` | Sweden Swedish | V2 word order · en/ett gender · definite suffix (-en/-et) · verb (no person conjugation!) | Cheapest to author: V2 curriculum logic ports straight from Dutch/German. Good "fast fifth pack" to prove the scaffolder. |

### Tier 2 — minor engine tweaks (one grading/normalization flag each)

| Pack | Tweak needed | Spine sketch |
|------|--------------|--------------|
| `polish-pl` | none beyond diacritic tolerance (ł ą ę ż ź ć ś) | case system (7 cases, sequenced like German's) · verbal aspect pairs · motion verbs |
| `turkish-tr` | locale-aware lowercasing — dotless `ı` vs `i` breaks naive `.toLowerCase()`; grading must use `toLocaleLowerCase('tr')` | agglutination · vowel harmony · evidential past (-miş) |
| `norwegian-no` / `danish-dk` | none | as Swedish |
| `indonesian-id` | none | easiest content in the catalog: no conjugation, no gender, no cases, no diacritics — a "your first foreign language" flagship |

### Tier 2.5 — new script, but LTR + spaced (needs only a `reading` field)

Russian (`ru-RU`), Greek (`el-GR`), Ukrainian (`uk-UA`). The engine works
as-is; learners need an optional **transliteration line** during weeks 1–3 and
a **script-intro module** (a week-0 concept: teach the alphabet with the
existing `card`/`chips`/`dictation` blocks before day 1). Both are schema
additions, not engine rewrites — see §2.5.

### Tier 3 — needs engine features (build once, unlocks the tier)

| Pack | What the engine is missing | Sizing |
|------|---------------------------|--------|
| `korean-kr` | Hangul script-intro module; `reading` (romanization) field; politeness levels map beautifully onto the existing register traffic-light | Smallest tier-3 lift — Korean spaces its words, so the builder block works. **Recommended first non-Latin pack.** |
| `japanese-jp` | `reading` field rendered as furigana/romaji; builder block needs pre-tokenized word arrays (no spaces to split on); kana-tolerant grading (accept かな for 漢字 answers); kana script weeks before day 1 | The biggest prize by demand; do after Korean proves the script-module pattern. |
| `mandarin-cn` | everything Japanese needs, plus tone-first audio blocks and a simplified/traditional decision | After Japanese. |
| `arabic` | RTL layout across every component + `dir="rtl"` audit; MSA-vs-dialect identity decision (thorny — the house style demands one identity) | Park until there's real demand; RTL is the only item touching every component. |

**Shared tier-3 prerequisite (one engine work item):** optional `reading`
string on any target-language item (rendered small above/below the text, with
a learner toggle), `tokens` array on builder items, and a manifest-declared
script-intro module slot. Build these once — Korean, Japanese, Mandarin,
Russian, Greek all consume them.

### Recommended order

1. **French** (audience) → 2. **Portuguese-BR** (audience + Spanish transfer)
→ 3. **Swedish or Indonesian** (cheap wins to stress-test the pack factory)
→ 4. **`reading`-field engine work + Korean** (first non-Latin flagship)
→ 5. **Japanese**.

Each new pack gets its own `docs/roadmap-<pack>.md` (same shape as
`roadmap-german-de.md`) at bootstrap time.

---

## 2. Making additions as simple as possible (the pack factory)

Goal: adding language N+1 is **content work only** — no engine edits, no CI
edits, no schema surprises, no manual file copying. Ordered by leverage; items
1–2 should land **before** pack #5 is created.

### 2.1 Schema v2: rename the `nl` field to `target` (do this first)

The target-language text field in every lesson item is literally named `nl`
in all four packs (Italian day-01: `{ "nl": "casa", "en": "house" }`). This
was accepted debt at pack #2; at pack #5+ it compounds — every style guide,
every authoring prompt, every validator rule carries the wart, and it's the #1
source of confusion for pack authoring.

Migration plan (backward-compatible, one session):

- Engine reads `item.target ?? item.nl` (and same for dialogue/shadow lines)
  in `src/engine/blocks/index.jsx` — both schemas play forever.
- `tools/migrate-pack.js`: rewrites a pack's lessons `nl` → `target`, bumps
  lesson + manifest `schemaVersion` to 2.
- Validator accepts `nl` at schemaVersion 1 and requires `target` at 2.
- Run the migration over all four packs; update the four style guides.
- New packs are born on v2 and never see `nl`.

### 2.2 `npm run new-pack` — the scaffolder

`tools/new-pack.js <pack-id> <Language> <locale> <flag> <accent-hex>`:

- Creates `public/packs/<pack-id>/` with a **manifest skeleton**: the standard
  18-week / 126-day structure with TODO week titles, empty cast, `ui` strings
  defaulting to English, `grading` defaults, level definitions copied from the
  template.
- Drops `style-guide.md` + `characters.md` templates (extracted from the
  Dutch pack's, with blanks for dialect identity, slang tiers, cast).
- Creates `docs/roadmap-<pack-id>.md` from a template.
- Appends the pack to `public/packs/catalog.json` → **it appears in the
  language picker immediately** (all days "coming soon").
- Adds `validate:<pack-id>` to `package.json`.
- Prints the authoring checklist (questionnaire → manifest → bible → week 1).

Target: bootstrapping pack #5 is one command + one authoring session.

### 2.3 Catalog-driven validation and CI

`validate:all` currently hardcodes four pack names in `package.json`, and
`.github/workflows/validate-packs.yml` hardcodes a four-entry matrix. Both
should derive from `catalog.json`:

- `tools/validate-all.js` reads the catalog and validates every listed pack.
- The workflow becomes a single job running `validate-all` (or generates its
  matrix from the catalog). Adding a pack never touches CI again.
- Strictness from data, not flags: a `"released": true` field in a pack's
  manifest makes the validator treat missing days as errors for that pack.

### 2.4 The pack-generation skill

`docs/plan.md` §5 designed this; four packs later the process is proven, so
extract it: `.claude/skills/new-language-pack/SKILL.md` encoding

1. the questionnaire (dialect identity + contrast, grammar spine, cultural
   anchors, cast concept, slang tiers, day-74 meta-module),
2. the bootstrap steps (run scaffolder → fill manifest → bible → style guide),
3. the weekly-batch authoring workflow with `validate` gating (from
   `docs/plan.md` §4), including per-block-type prompt templates.

After this, "add Swahili" is: invoke the skill, answer the questionnaire,
approve weekly batches.

### 2.5 Tier-3 enablers (only when a tier-3 language is scheduled)

- Optional `reading` field on items/lines + learner toggle in the player.
- Optional `tokens: []` on builder items (fallback: split on spaces).
- Manifest-declared script-intro module (weeks addressable before week 1).
- RTL audit behind a manifest `dir: "rtl"` flag (Arabic only; last).

### 2.6 Build hygiene (small, pre-launch)

- Exclude `public/packs/*/*.md` (style guides, character bibles, handoffs)
  from the production build — authoring docs currently ship in `dist/`.
- `tools/status.js`: print an authored-days-per-pack table (the number the
  content sweeps track by hand today).

---

## 3. Feature brainstorm (the app itself)

Grouped by theme. Effort: S (< 1 session) / M (1 session) / L (multi-session).
"Static-safe" = works with the current no-backend architecture.

### Learning science (highest leverage — the app teaches but never *reviews*)

- **Spaced-repetition review deck (SRS)** — M/L, static-safe. Harvest every
  `chips`/`typed`/`dictation` item the learner has completed into a per-item
  queue with SM-2-lite scheduling in localStorage; a "Review" tab on the
  dashboard surfaces due cards daily. The single biggest pedagogical gap:
  content is linear day-by-day with no systematic recall. Feeds on existing
  data — zero content authoring needed.
- **Mistake replay** — S/M, static-safe. Wrong answers from graded blocks go
  into a queue; replay at day end and as the next day's warm-up.
- **Checkpoint tests / placement** — M, static-safe. A test-out quiz per week
  (assembled from that week's graded blocks) so returning or advanced
  learners can skip ahead; unlocks "place me" onboarding.
- **Personal word bank** — M, static-safe. Searchable list of every vocab item
  encountered, star-to-boost into the SRS deck.
- **Grammar reference** — S/M, static-safe. Auto-compile an appendix per pack
  from existing `card`/`contrast` blocks; searchable from the dashboard.

### Audio & speech

- **TTS voice audit + pre-generated audio** — M, static-safe (build-time
  tool). Web Speech quality varies by locale/browser; a `tools/gen-audio.js`
  pipeline (any TTS API) shipping mp3s per lesson was already anticipated by
  the schema. Per-pack cost, big polish win.
- **Speech input on shadow blocks** — M, static-safe (Web Speech
  `SpeechRecognition`, Chromium only). "Say it back" self-check with the
  existing grading normalizer scoring the transcript.
- **Podcast mode** — S/M, static-safe. Autoplay a day's dialogues/shadow lines
  hands-free (commute mode); mostly a player loop over existing blocks.

### Engagement

- **Daily goal, XP, badges, streak freeze** — S/M, static-safe. Streaks
  already exist in the progress layer; layer light gamification on top.
- **Share cards** — S, static-safe. Canvas-render "Day 42 · 🇫🇷 · 12-day
  streak" images for the share sheet.
- **Yap mode: chat with the cast** — L, **needs an API key** (first feature to
  break the static model; BYO-key keeps it backend-less). LLM chat in a cast
  character's persona, constrained to vocab from the learner's completed
  weeks. The cast bibles make the personas free.

### Platform

- **PWA / offline** — M, static-safe. Service worker precaching the chosen
  pack; the all-static architecture makes this nearly free, and offline is a
  killer feature for a commute app.
- **Special-character keyboard row** — S, static-safe. Tap-to-insert ü ß ñ é
  buttons on `typed`/`dictation` blocks (driven by a manifest `chars` list).
  Small, immediately felt on mobile.
- **Real auth + cross-device sync** — L, needs a backend (Supabase/Clerk).
  `src/engine/auth.js` is the designed swap point; progress-merge strategy is
  the real work.
- **Source-language parameterization** — L, horizon item. Today the app
  assumes an English-speaking learner (`en` field, English chrome). Making the
  *source* language a parameter (learn German *from* Dutch) doubles the
  catalog surface; note it so schema decisions (e.g. renaming `en` → `base`)
  keep it possible.

---

## 4. Prioritization at a glance

```
Now (tooling debt, before pack #5):   §2.1 schema v2 · §2.2 scaffolder · §2.3 catalog CI
Next (growth):                        French → Portuguese-BR bootstrap + A1 sweeps
Then (product):                       SRS review deck · weeks 15–18 backfill · PWA
Later (unlocks):                      §2.4 skill · reading-field work → Korean/Japanese
Horizon:                              auth+sync · Yap mode · source-language param
```

---

## 5. Today's execution plan (Fable-credit session sequence)

Each item below is one Claude Code session with a paste-able prompt. Sizes are
relative token spend (S < M < L); history suggests one "content sweep" session
covers ~2–3 weeks of lessons across packs. **Run in order** — sessions 1–2 are
cheap and make every later session cheaper; cut from the bottom if credits run
low. Every session ends with `npm run validate` clean, a commit, and a push.

### Session 1 — engine debt sprint (S/M) — do first

> Implement schema v2 per docs/roadmap-expansion.md §2.1 and §2.3: rename the
> lesson-item target-language field `nl` → `target` with back-compat
> (`item.target ?? item.nl`) in src/engine/blocks/index.jsx; write
> tools/migrate-pack.js and migrate all four packs to schemaVersion 2; update
> tools/validate.js to accept v1 `nl` / require v2 `target`; make validation
> catalog-driven (tools/validate-all.js reading catalog.json, package.json
> scripts, and the CI workflow) with strictness from a `released` manifest
> field; exclude `public/packs/*/*.md` from the production build; update the
> four pack style guides to describe the `target` field. Validate everything,
> run the app to smoke-test one lesson per pack, commit, push.

### Session 2 — pack factory (S)

> Build tools/new-pack.js per docs/roadmap-expansion.md §2.2 (manifest
> skeleton, style-guide/characters/roadmap templates, catalog.json append,
> package.json validate script, printed authoring checklist) with an
> `npm run new-pack` script. Then extract the pack-generation skill per §2.4
> into .claude/skills/new-language-pack/ using docs/plan.md §5 as the source.
> Update README "Adding a language" to the new one-command flow. Commit, push.

### Session 3 — French bootstrap (M)

> Using npm run new-pack and the new-language-pack skill, bootstrap
> `french-fr` (France French, not Québécois; locale fr-FR; 🇫🇷) per
> docs/roadmap-expansion.md §1 Tier 1: write docs/roadmap-french-fr.md
> (grammar spine: gender/agreement, passé composé vs imparfait, object/y/en
> pronouns, subjunctive; day-74 meta-module: tu/vous register), the manifest
> with 18-week structure, character bible, style guide, and author week 1
> (days 1–7) on schema v2. Add elision/apostrophe tolerance to grading config.
> Validate, commit, push.

### Session 4 — French A1 sweep (L)

> Content sweep: author french-fr weeks 2–4 (days 8–28) per
> docs/roadmap-french-fr.md and the pack's style guide/character bible,
> following the weekly rhythm in docs/plan.md §4, validating each week before
> moving on. Goal: a shippable French A1. Commit per week, push.

### Session 5 — Portuguese-BR bootstrap (M)

> Same as the French bootstrap but for `portuguese-br` (Brazilian Portuguese,
> not European; locale pt-BR; 🇧🇷) per docs/roadmap-expansion.md §1 —
> roadmap doc (spine: ser/estar, pretérito perfeito vs imperfeito,
> conjugation, subjunctive), manifest, bible, style guide, week 1. Lean on the
> Spanish pack's curriculum for structural transfer where it genuinely maps.
> Validate, commit, push.

### Session 6 — SRS review deck (M/L)

> Implement the spaced-repetition review deck per docs/roadmap-expansion.md §3:
> harvest completed chips/typed/dictation items into a per-profile,
> per-pack review queue in localStorage with SM-2-lite scheduling; add a
> Review entry point on the dashboard showing due-card count; reuse the
> existing block components for the review UI and the grading module for
> scoring. Include the mistake-replay queue if budget allows. Smoke-test,
> commit, push.

### Session 7 — weeks 15–18 backfill (L, repeatable)

> Content sweep: author weeks 15–16 (days 99–112) for dutch-nl and german-de
> per their roadmaps (then italian-it/spanish-es, then weeks 17–18, in
> follow-up sweeps). Validate each week, commit per pack, push.

### Stretch sessions (any order, S/M each)

- **PWA/offline** + special-character keyboard row (§3 Platform).
- **TTS voice audit** across the six locales; graceful-fallback fixes in
  `src/engine/audio.js`; scope `tools/gen-audio.js`.
- **Swedish or Indonesian bootstrap** — cheapest possible pack, proves the
  factory end-to-end.

After sessions 1–5 land, adding a language is: one command, one questionnaire,
weekly authoring sweeps — which is the "as simple as possible" bar this
roadmap is aiming at.
