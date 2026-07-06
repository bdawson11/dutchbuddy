# YapWorld

One app, many languages. A reusable engine for conversational language-learning
built as a single static SPA: learners log in, pick a language, and work through
a per-language content pack. Full plan: `docs/plan.md`; multilingual expansion
roadmap: `docs/roadmap-multilingual.md`.

Content packs (each a language "course" inside YapWorld):

| Pack | Language | Content |
|------|----------|---------|
| `dutch-nl` | 🇳🇱 Dutch (Netherlands, not Flemish) | Days 1–98 (A1 → B1 core + B2 weeks 13–14); `docs/roadmap-dutch-nl.md` |
| `german-de` | 🇩🇪 German (Hochdeutsch) | Days 1–98 (A1 → B1 core + B2 weeks 13–14); `docs/roadmap-german-de.md` |
| `italian-it` | 🇮🇹 Italian (standard) | Days 1–98 (A1 → B1 core + B2 weeks 13–14); `docs/roadmap-italian-it.md` |
| `spanish-es` | 🇪🇸 Spanish (Peninsular Castilian) | Days 1–98 (A1 → B1 core + B2 weeks 13–14); `docs/roadmap-spanish-es.md` |

Each pack's manifest defines an 18-week (126-day) A1 → C1-gateway structure;
days 99–126 (weeks 15–18) are scoped in the roadmaps and render as "coming soon".

## Architecture

Single unified app; the language is chosen at runtime, not at build time.

- `src/AppShell.jsx` — the YapWorld shell: a login → language-picker → course
  state machine. Loads `public/packs/catalog.json`, then each pack's manifest.
- `src/LoginScreen.jsx` + `src/engine/auth.js` — device-local profiles ("login").
  No backend: a profile is a name (+ optional email) in localStorage, and
  progress is namespaced per profile so several learners can share a device.
  `auth.js` is backend-shaped so a real auth provider can replace it.
- `src/LanguagePicker.jsx` — the language grid, one card per catalog pack.
- `src/engine/` — language-agnostic engine: lesson player, 11 block components
  (`blocks/index.jsx`), dashboard rendered from the pack manifest, localStorage
  progress layer (per-profile), audio (Web Speech API), grading, UI strings.
- `public/packs/<lang>/` — a content pack: `manifest.json` + `lessons/day-NN.json`.
  Pure data; the engine never contains language content. `catalog.json` lists
  the packs YapWorld offers.
- `tools/validate.js` — pack validator. CI gate for content batches.
- `src/engine/base.css` — the shipped cozy theme; every colour derives from the
  single `--accent` hook (per-language accents come from each pack manifest).
  Next design round: `docs/DESIGN-BRIEF.md`.

## Commands

```
npm run dev              # local dev server (the unified YapWorld app)
npm run build            # production build (Vercel-ready static output)
npm run validate         # validate every pack (missing days = warnings)
npm run validate:<pack>  # validate one pack (e.g. validate:german-de)
npm run validate:strict  # missing days = errors (pre-release gate, dutch-nl)
```

## Content workflow

1. Write lessons in weekly batches per `docs/plan.md` §4, against the curriculum outline (§3), style guide, and character bible.
2. `npm run validate` — fix all errors, review warnings.
3. Days without a lesson file render as "Coming soon" on the dashboard, so partial packs are always shippable during development.

## Adding a language

Create `public/packs/<lang>/` with a manifest and lessons conforming to the
schemas in `docs/plan.md` §2, then add `<lang>` to the `packs` array in
`public/packs/catalog.json`. It appears in the language picker automatically —
no engine changes required. For a polished picker card, give the manifest a
`flag`, `language`, and `tagline`; add `ui` (localized chrome strings) and
`grading` config as needed (see the existing packs).
