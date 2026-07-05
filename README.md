# LanguageBuddy

Reusable engine for conversational language-learning apps. First content pack: **DutchBuddy** (Netherlands Dutch, A1 → B1, 84 days). Full plan: `docs/plan.md`.

## Architecture

- `src/engine/` — language-agnostic engine: lesson player, 11 block components (`blocks/index.jsx`), dashboard rendered from the pack manifest, localStorage progress layer, audio abstraction (Web Speech API, swappable for pre-generated TTS).
- `public/packs/dutch-nl/` — the content pack: `manifest.json` + `lessons/day-NN.json`. Pure data; the engine never contains language content.
- `tools/validate.js` — pack validator. CI gate for content batches.
- `src/engine/base.css` — placeholder styling; replaced by the Claude Design pass.

## Commands

```
npm run dev              # local dev server
npm run build            # production build (Vercel-ready static output)
npm run validate         # validate the dutch-nl pack (missing days = warnings)
npm run validate:strict  # missing days = errors (pre-release gate)
```

## Content workflow

1. Write lessons in weekly batches per `docs/plan.md` §4, against the curriculum outline (§3), style guide, and character bible.
2. `npm run validate` — fix all errors, review warnings.
3. Days without a lesson file render as "Coming soon" on the dashboard, so partial packs are always shippable during development.

## Adding a language

Create `public/packs/<lang>/` with a manifest and lessons conforming to the schemas in `docs/plan.md` §2, then build with `VITE_PACK=<lang>`. No engine changes required.
