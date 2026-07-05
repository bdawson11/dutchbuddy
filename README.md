# LanguageBuddy

Reusable engine for conversational language-learning apps. Full plan: `docs/plan.md`; multilingual expansion roadmap: `docs/roadmap-multilingual.md`.

Content packs:

| Pack | App | Status |
|------|-----|--------|
| `dutch-nl` | DutchBuddy (Netherlands Dutch, A1 → B1) | Complete — 84/84 days |
| `german-de` | GermanBuddy (Hochdeutsch) | Scaffolded — roadmap, manifest, Week 1 (`docs/roadmap-german-de.md`) |
| `italian-it` | ItalianBuddy (standard Italian) | Scaffolded — roadmap, manifest, Week 1 (`docs/roadmap-italian-it.md`) |
| `spanish-es` | SpanishBuddy (Peninsular Castilian, name TBD) | Scaffolded — roadmap, manifest, Week 1 (`docs/roadmap-spanish-es.md`) |

## Architecture

- `src/engine/` — language-agnostic engine: lesson player, 11 block components (`blocks/index.jsx`), dashboard rendered from the pack manifest, localStorage progress layer, audio abstraction (Web Speech API, swappable for pre-generated TTS).
- `public/packs/dutch-nl/` — the content pack: `manifest.json` + `lessons/day-NN.json`. Pure data; the engine never contains language content.
- `tools/validate.js` — pack validator. CI gate for content batches.
- `src/engine/base.css` — placeholder styling; replaced by the Claude Design pass.

## Commands

```
npm run dev              # local dev server (dutch-nl default)
npm run dev:<pack>       # e.g. npm run dev:german-de
npm run build            # production build (Vercel-ready static output)
npm run build:<pack>     # per-pack branded build → dist/<pack>
npm run validate         # validate every pack (missing days = warnings)
npm run validate:<pack>  # validate one pack
npm run validate:strict  # missing days = errors (pre-release gate, dutch-nl)
```

## Content workflow

1. Write lessons in weekly batches per `docs/plan.md` §4, against the curriculum outline (§3), style guide, and character bible.
2. `npm run validate` — fix all errors, review warnings.
3. Days without a lesson file render as "Coming soon" on the dashboard, so partial packs are always shippable during development.

## Adding a language

Create `public/packs/<lang>/` with a manifest and lessons conforming to the schemas in `docs/plan.md` §2, then build with `VITE_PACK=<lang>`. No engine changes required.
