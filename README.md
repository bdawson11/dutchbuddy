# LanguageBuddy

Reusable engine for conversational language-learning apps. First content pack: **DutchBuddy** (Netherlands Dutch, A1 → B1, 84 days). Full plan: `docs/plan.md`.

## Architecture

- `src/engine/` — language-agnostic engine: lesson player, 11 block components (`blocks/index.jsx`), dashboard rendered from the pack manifest, localStorage progress layer, audio abstraction (Web Speech API, swappable for pre-generated TTS).
- `public/packs/dutch-nl/` — the content pack: `manifest.json` + `lessons/day-NN.json`. Pure data; the engine never contains language content.
- `tools/validate.js` — pack validator (schema + cross-lesson content invariants). CI gate for content batches.
- `src/engine/base.css` — placeholder styling; replaced by the Claude Design pass.
- `tests/` — engine unit tests (grading + progress) via Node's built-in runner.
- `skill/` — reusable workflow to produce a validated pack for a **new** language against the unchanged engine (see `skill/SKILL.md`).
- `docs/native-review/` — the human-native-speaker review packet (dialogues) and the grammar red-team findings.

## Commands

```
npm run dev              # local dev server
npm test                 # engine unit tests (node --test)
npm run build            # production build (Vercel-ready static output)
npm run validate         # validate the dutch-nl pack (missing days = warnings)
npm run validate:strict  # missing days = errors (pre-release gate)
npm run lint             # oxlint
```

CI (`.github/workflows/ci.yml`) runs strict validation + tests + lint + build on every push/PR.

## Content workflow

1. Write lessons in weekly batches per `docs/plan.md` §4, against the curriculum outline (§3), style guide, and character bible.
2. `npm run validate` — fix all errors, review warnings.
3. Days without a lesson file render as "Coming soon" on the dashboard, so partial packs are always shippable during development.

The validator also enforces per-pack **content invariants** declared in the manifest (`contentInvariants`): the self-intro keyword every capstone must carry, and a story-arc leak check (a character not tied to their destination before a reveal day). Both are optional and language-agnostic.

## Adding a language

Run the `skill/` workflow: answer its 8-point questionnaire, fill the templates, generate 12 validated batches. Mechanically: create `public/packs/<lang>/` with a manifest and lessons conforming to the schemas in `docs/plan.md` §2, then build with `VITE_PACK=<lang>`. No engine changes required.
