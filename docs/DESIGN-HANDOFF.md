# YapWorld → Claude Design handoff

> **Status (July 2026): executed.** `base.css` now carries the cozy YapWorld
> theme with per-language accents — the "replace the placeholder" job below is
> done, including the recommended manifest `accent` field. This doc remains the
> canonical **code-side contract** (class hooks, fixtures, constraints) for
> landing any future restyle in the repo. For the next visual round in the
> Claude Design chat, hand over **`docs/DESIGN-BRIEF.md`** instead.

**Read this first in the design chat.** It is the single source of truth for the
visual pass. Everything here is *feel* and *style* — the DOM structure, class
names, and behavior are final. Your job is to replace the placeholder stylesheet
(and, optionally, wire per-language theming) — not to change component logic.

## What YapWorld is

One static SPA. A learner **logs in** (device-local profile — no backend), **picks
a language**, then works through that language's 84→126-day course. Four languages
ship today: 🇳🇱 Dutch, 🇩🇪 German, 🇮🇹 Italian, 🇪🇸 Spanish. Each is a content pack
(pure JSON) rendered by one shared engine.

Run it: `npm install && npm run dev`, then open the app. Flow to click through:
login (type any name) → language picker → pick Dutch → course dashboard → open a
day → do a lesson → use the top bar to switch language / log out.

## The one file you replace

`src/engine/base.css` is a functional placeholder — **this is what your design
system replaces.** Every screen and component already carries stable class-name
hooks (listed below); restyle against them. Keep the class names, or if you rename,
update the JSX in the same pass. Do **not** rewrite component logic.

Theme-aware is welcome: default light, and a dark mode via
`@media (prefers-color-scheme: dark)` if you want it. Mobile-first — content max
width ~720px, lessons are 15–35 min phone sessions.

## What to design (scope), in order of prominence

### 1. YapWorld shell (new — the app frame)
- **Login screen** — `src/LoginScreen.jsx` → `.auth-screen`, `.auth-card`,
  `.auth-brand` (🌍 YapWorld), `.auth-tagline`, `.profile-row`/`.profile-chip`/
  `.profile-avatar` (returning profiles), `.auth-form` (name + optional email),
  `.auth-submit`, `.auth-note` (the "saved on this device only" reassurance).
- **Language picker** — `src/LanguagePicker.jsx` → `.picker`, `.picker-top`,
  `.wordmark`, `.lang-grid`, `.lang-card` (one per language: `.lang-flag`,
  `.lang-name`, `.lang-tagline`, `.lang-meta` = level range + progress). This is
  the front door — make it inviting.
- **Top bar** — `TopBar` in `src/AppShell.jsx` → `.topbar`, `.wordmark`,
  `.topbar-right`, `.topbar-lang`. Persistent while learning; holds YapWorld
  brand + "Switch language" + "Log out".

### 2. Course dashboard — `src/engine/Dashboard.jsx`
Rendered entirely from `manifest.json`: `.brand` (language + tagline), `.hero`
(title/blurb/bullets), `.stats-banner` (days done, steps, time, streak),
`.start-here` (continue/start CTA), level bands (`.level-section`, A1/A2/B1/B2/C1),
week accordions (`.week`, `.week-header`, `.day-grid`), day cards (`.day-card`,
`.is-complete`, `.day-card-missing` = "coming soon"), and the donation `.footer`
with a `.reset-btn`.

### 3. Lesson player chrome — `src/engine/Player.jsx`
`.player`, `.player-header` (sticky), `.back-btn`, `.player-title`
(`.player-emoji` + title), `.player-meta`, `.progress-bar`/`.progress-fill`,
and `.lesson-complete` (the 🎉 done state).

### 4. The 11 block components — `src/engine/blocks/index.jsx`
One per exercise type (discriminated on `block.type`). Class hooks:
`.block` + `.block-<type>`, plus `.prompt`, `.callout`, `.chip`/`.chip-tapped`,
`.mcq-option`/`.is-correct`/`.is-wrong`, `.typed-row`, `.speak-btn` (🔊),
`.contrast-*`, `.dialogue-line`/`.is-revealed`/`.speaker`/`.spotlight`,
`.shadow-line`, `.builder-slot`/`.builder-output`, `.comp-question`,
`.block-journal textarea`, `.feedback` (`.correct`/`.wrong`/`.explain`).

| type | what it is | fixture that exercises it (dutch-nl) |
|---|---|---|
| `card` | teaching content: rule/table/callout | day-01 (table), day-06 |
| `chips` | tappable vocab chips w/ audio | day-01, day-08 |
| `contrast` | side-by-side pairs | day-02, day-72 |
| `mcq` | multiple choice | day-01 |
| `typed` | typed drill, fuzzy-graded | day-01 |
| `dictation` | listen → type | day-01 |
| `builder` | slot-fill sentence builder | day-14, day-84 |
| `dialogue` | scripted scene, tap-to-reveal + audio | day-02, day-83 (multi-voice) |
| `shadow` | listen → repeat | day-01 |
| `comprehension` | questions on a scene | day-20 |
| `journal` | free-text, saved locally | every capstone |

## Design against these fixtures (dutch-nl is the reference pack)

- **New screens** — the login and language picker have no per-language data; design
  them as the YapWorld brand surface.
- **`day-01.json`** — clean A1 teaching lesson. Baseline density.
- **`day-20.json`** — a review day: recap → cast immersion dialogue → comprehension → journal.
- **`day-65.json`** — worst-case density (the *er* module, ~12 blocks). If the layout survives this, it survives anything.
- **`day-83.json`** — multi-voice dialogue (3+ speakers). Stress-tests `.dialogue-line`.
- **`day-84.json`** — the finale capstone: recap → self-intro builder → farewells → celebratory journal.

## Theming — drive it from the manifest

Each pack's `manifest.json` carries the brand inputs the components read:
`flag`, `language`, `tagline`, `hero{title,blurb,bullets}`, `dialect.markers`
(the personality to echo), `levels[]`, `weeks[]`, `cast[]`, `footer`, and `ui`
(localized chrome strings — already wired through `src/engine/ui.js`).

**Per-language accent is the one theming hook to add.** Today `--accent` is a single
value in `base.css`. Recommended: add an `accent` (or `theme`) field to each
manifest and set it as a CSS custom property on `:root` in `AppShell.jsx` when a
pack loads (there's already a spot right after `configureUi(...)`). Suggested
directions — Dutch warm orange, German a deep slate/gold, Italian green/terracotta,
Spanish crimson/saffron — but that's your call. YapWorld itself (login, picker, top
bar) should have its own neutral brand accent that reads as the umbrella app.

## Hard constraints

- **Mobile-first.** Phone sessions, 15–35 min.
- **Login is part of the app now** (device-local profiles). Keep the reassurance
  copy: no password, no server — "your profile and progress are saved on this
  device only." (This supersedes the old DutchBuddy handoff's "no login UI.")
- **localStorage-only messaging** — surface the on-device disclosure (`footer` copy
  is in each manifest).
- **Donation footer** present on the course dashboard.
- Numeric stats read well as tabular figures; per-block audio is a 🔊 affordance
  (Web Speech API today, pre-generated TTS later — same UI).
- Don't break the class-name/DOM contract the components rely on (or update both
  sides together).

## Repo pointers

- Engine + screens: `src/AppShell.jsx`, `src/LoginScreen.jsx`,
  `src/LanguagePicker.jsx`, `src/engine/{Dashboard,Player}.jsx`,
  `src/engine/blocks/index.jsx`, `src/engine/base.css` (replace this).
- Content: `public/packs/<lang>/manifest.json` + `lessons/day-NN.json`;
  `public/packs/catalog.json` lists the languages.
- Authoring context (tone, not shipped): each pack's `characters.md` +
  `style-guide.md`. Product architecture: `docs/plan.md`,
  `docs/roadmap-multilingual.md`.
- After styling: `npm run dev` to eyeball, `npm run build` must still pass.
