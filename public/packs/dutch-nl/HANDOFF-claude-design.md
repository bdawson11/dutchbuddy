# DutchBuddy → Claude Design handoff

> **⚠️ SUPERSEDED.** The app is now the unified multi-language **YapWorld** (login
> → language picker → course), not the single DutchBuddy build this doc assumes.
> Use **`docs/DESIGN-HANDOFF.md`** as the canonical handoff. In particular the
> "No login UI" constraint below is no longer true. This file remains only as
> per-pack fixture notes for the Dutch course.

The **content deck is complete**: `manifest.json` + `lessons/day-01.json … day-84.json`
(84 lessons), all passing `tools/validate.js --strict` with zero errors/warnings.
This is the data your components render. Everything below is *feel*, not a clone.

## What to design (scope)

1. **Dashboard** — rendered from `manifest.json`: hero (title/blurb/bullets), three level bands (A1/A2/B1), 12 week accordions each holding 7 day cards, a progress/stats banner (days started, steps done, time logged, streak), and a donation footer. Days with no lesson file show "Coming soon" (not relevant now — all 84 exist).
2. **Lesson player chrome** — the frame around a running lesson: progress-through-blocks indicator, day title/emoji/level/duration, and completion state.
3. **The 11 block components** — one per exercise type (the discriminated union on `block.type`). Current ugly-but-functional versions live in `src/engine/blocks/index.jsx`; behavior is final, visuals are yours.

## The 11 block types (with a fixture that exercises each)

| type | what it is | see it in |
|---|---|---|
| `card` | teaching content: rule/table/callout | day-01 (table), day-06 |
| `chips` | tappable vocab chips w/ audio | day-01, day-08 |
| `contrast` | side-by-side pairs | day-02 (ij/ei), day-72 (particles) |
| `mcq` | multiple choice | day-01 |
| `typed` | typed drill, fuzzy-graded | day-01 |
| `dictation` | listen → type | day-01 |
| `builder` | slot-fill sentence builder | day-02, day-14 (mijn verhaal), day-84 |
| `dialogue` | scripted scene, tap-to-reveal + audio | day-02, day-83 (multi-voice) |
| `shadow` | listen → repeat, self-scored | day-01 |
| `comprehension` | questions on a preceding scene | day-02, day-20 |
| `journal` | free-text, saved locally | every capstone |

## Recommended fixtures (design against these)

- **`day-01.json`** — a clean, simple A1 teaching lesson. The baseline density.
- **`day-20.json`** — a **review day**: recap drills → cast **immersion dialogue** (Emma narrating her Amsterdam buurt) → comprehension → journal. Shows the review rhythm.
- **`day-65.json`** — the **worst-case density fixture** (the *er* module, 12 blocks). If the layout survives this, it survives anything.
- **`day-83.json`** — a **multi-voice dialogue** review (Emma, Daan & Sanne at a borrel). Stress-tests the dialogue component with 3+ speakers.
- **`day-84.json`** — the **final capstone**: recap → letter-to-past-self builder → the definitive "mijn verhaal" self-intro → farewells → celebratory journal. Shows the capstone shape and the signature self-intro builder.

## Branding inputs (drive theming from the manifest)

Per-pack accent theming should read from `manifest.json`:
- `appName` = "DutchBuddy", `tagline` = "Nederlands, echt waar."
- `hero` = { title, blurb, bullets[{emoji, strong, text}] } — the landing copy.
- `dialect.markers` (*lekker, gezellig, hoor, doe maar*) — the personality to echo.
- `levels[]` (A1/A2/B1 titles + blurbs), `weeks[]` (titles), `cast[]` (the four recurring characters), `footer` (donation copy + storage disclosure).

Light default theme with a strong Dutch/orange-leaning per-pack accent. The engine
is designed so a second language pack swaps only these manifest fields.

## Hard constraints

- **Mobile-first** — lessons are 15–30 min phone sessions.
- **No login UI.** Free, no signup.
- **localStorage-only messaging** — surface "progress saves on this device only" (footer copy is in the manifest).
- **Donation footer** present.
- Numeric display uses tabular figures; per-block audio is a 🔊 affordance (Web Speech API today, pre-generated TTS later — same UI).

## Authoring context (optional, for tone)

`characters.md` (cast voices + story arc) and `style-guide.md` (voice + formatting)
are authoring-time docs — not shipped, but useful for understanding the content's
personality if you're writing empty/edge-state or celebratory copy.
