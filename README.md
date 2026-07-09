# YapWorld

One app, many languages. A reusable engine for conversational language-learning
built as a single static SPA: learners log in, pick a language, and work through
a per-language content pack. Full plan: `docs/plan.md`; multilingual expansion
roadmap: `docs/roadmap-multilingual.md`; next languages, pack-factory tooling,
and feature roadmap: `docs/roadmap-expansion.md`.

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
- `src/engine/base.css` — placeholder styling; replaced by the Claude Design pass.

## Commands

```
npm run dev              # local dev server (the unified YapWorld app)
npm run build            # production build (Vercel-ready static output)
npm run validate         # validate every pack in catalog.json (missing days = warnings)
npm run validate:<pack>  # validate one pack (e.g. validate:german-de)
```

`npm run validate` is catalog-driven (`tools/validate-all.js` reads
`public/packs/catalog.json`). A pack whose manifest sets `"released": true` is
validated strictly — missing days become errors (the pre-release gate).

## Content workflow

1. Write lessons in weekly batches per `docs/plan.md` §4, against the curriculum outline (§3), style guide, and character bible.
2. `npm run validate` — fix all errors, review warnings.
3. Days without a lesson file render as "Coming soon" on the dashboard, so partial packs are always shippable during development.

## Adding a language

One command scaffolds a new pack — no manual file copying, no engine changes,
no CI edits:

```
npm run new-pack <pack-id> "<Language>" <locale> <flag-emoji> <accent-hex>
# e.g.
npm run new-pack french-fr "French" fr-FR 🇫🇷 "#2563eb"
```

This creates `public/packs/<pack-id>/` (manifest skeleton + style guide +
character bible templates, schema v2 throughout) and `docs/roadmap-<pack-id>.md`,
appends the pack to `public/packs/catalog.json` (it appears in the language
picker immediately, all days "coming soon"), and adds a `validate:<pack-id>`
script. `tools/new-pack.js` prints an authoring checklist when it's done.

Then invoke the `new-language-pack` skill
(`.claude/skills/new-language-pack/SKILL.md`) — or follow the printed
checklist directly — to answer the design questionnaire (dialect identity,
grammar spine, cast/arc, register tiers, day-74 meta-module) and author the
pack in validated weekly batches.
