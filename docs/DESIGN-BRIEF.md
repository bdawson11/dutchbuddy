# YapWorld — Claude Design brief, round 2

**For the design chat that produced "DutchBuddy A — Knus."** This brief continues
that project. Since round 1, the product has outgrown its own name: DutchBuddy is
now one of four language courses inside **YapWorld** (working title — see §8), a
single app where a learner logs in, picks a language, and studies. Round 2 is
about evolving the Knus concept into a **multi-language design system**: keep the
cozy soul, add an umbrella brand and three sibling languages.

This document is self-contained — all copy, colours, and data below are real and
shipping. Nothing here requires repo access.

---

## 1. What changed since the first brief

| Round 1 (DutchBuddy) | Now (YapWorld) |
|---|---|
| One app, one language (Dutch) | One app, four courses — 🇳🇱 Dutch, 🇩🇪 German, 🇮🇹 Italian, 🇪🇸 Spanish — with more languages planned |
| No login UI ("free, no signup") | Login screen with device-local profiles (name + optional email; no password, no server) |
| App opens straight onto the Dutch dashboard | Flow is login → **language picker** → course dashboard → lesson player |
| Dutch-orange identity everywhere | Neutral **YapWorld umbrella brand** on the shell; each language has its own accent that takes over inside its course |
| 12 weeks / 84 days, levels A1→B1 | 18 weeks / 126 days, five level bands A1 / A2 / B1 / B2 / C1; days 99–126 render as "coming soon" |
| Single light theme | Light **and dark** shipped (`prefers-color-scheme`) |

Unchanged: mobile-first (~720px content column, 15–35 min phone sessions), the
lesson player, the 11 exercise-block types, localStorage-only trust messaging,
the donation footer.

## 2. Where the design stands today (your starting point)

A Knus-derived system is already implemented and live in the app, so round 2
starts from a real baseline, not a blank page:

- **Feel** — warm cream paper, rounded and tactile, friendly without being childish.
- **Type** — Baloo 2 (display, extrabold) over Nunito (body).
- **Light palette** — bg `#faf1e4`, ink `#3d2c1e`, cards `#fffdf8`, hairlines `#eedfcc`.
- **Dark palette** — bg `#201812`, ink `#f3e7d7`, cards `#2b211a`; same warmth, dimmed.
- **Signature button** — chunky rounded rect with a solid `0 3px 0` hard shadow in
  a darker accent; pressing translates it down 2px and compresses the shadow.
- **Radii** — 12 / 16 / 22px.
- **Theming mechanics** — every colour on screen derives from a single `--accent`
  custom property via `color-mix()`: tints, borders, accent-ink, press shadows.
  Swap the accent and the whole surface re-themes, in light or dark.

Current accents (a first draft — you may re-pitch any of them):

| Surface | Accent |
|---|---|
| YapWorld shell (login, picker, top bar) | violet `#6644e0` (dark mode `#8b74f0`) |
| 🇳🇱 Dutch | orange `#e8590c` |
| 🇩🇪 German | bronze `#a9690c` |
| 🇮🇹 Italian | green `#1e874b` |
| 🇪🇸 Spanish | crimson `#c21a32` |

## 3. The design problem for round 2

Round 1 had one identity: Dutch, knus, orange. YapWorld needs a **two-layer brand**:

1. **The umbrella** — YapWorld ("Pick a language and start yapping."). The login,
   picker, and top bar are its surface. It must feel like the home of every
   language and none in particular — playful, worldly, warm — and clearly the
   same family as the courses inside it.
2. **The languages** — each course keeps its own personality: accent colour, a
   tagline in its own language, dialect markers, a recurring cast. Entering a
   course should feel like stepping through a doorway into that country's living
   room; the accent takes over the whole surface.

Questions to answer visually:

- What is the YapWorld brand moment? (Today it's literally `🌍 YapWorld` in Baloo 2.)
- How do four — eventually 8+ — language cards read as siblings yet distinct places?
- How does the handover feel at the moment you pick a language — how much of the
  world turns Dutch-orange, and how instantly?
- Is a single accent hue per language enough identity, or does each language earn
  a second signal (motif, pattern, texture, illustration) *within the system*?
  (If yes, it must be specifiable as per-language data — see constraints.)

## 4. Screens to design (priority order)

All copy below is real. Every key screen needs light and dark.

### 4.1 Login — new

A centered card on the YapWorld brand surface. First impression of the platform,
but a five-second interaction — warm and zero-friction, nothing that smells like
a SaaS signup wall.

- Brand `🌍 YapWorld` + tagline *"Pick a language and start yapping."*
- Returning device: **"Continue as"** + profile chips (avatar = first initial, name).
- *"or create a new profile"* → form: **Your name** (placeholder "e.g. Alex"),
  **Email (optional)**, primary button **Log in** (disabled until a name is typed).
- Reassurance note, verbatim: *"No password needed. Your profile and progress are
  saved on this device only."*

### 4.2 Language picker — new, the heart of round 2

- Header: `🌍 YapWorld` wordmark; right side *"Hi, Alex"* + Log out.
- H1 **"What do you want to learn?"** + the tagline.
- A grid of language cards. Per card: flag, language name, tagline *in its own
  language*, meta line — `A1–C1 · Start from day 1` or `A1–C1 · 23 days done`.
  Each card previews its language's accent (this already works mechanically).
- One column on phones; must scale gracefully from 4 cards to 8+ as packs ship.
- A card with progress should invite *continuing*; a fresh card should make the
  first step feel small. This screen is the shop window — make it irresistible.

### 4.3 Top bar — new

Persistent above the dashboard: `🌍 YapWorld` (tap = back to picker) · current
course chip `🇳🇱 Dutch` · **Switch language** · **Log out (Alex)**. Small and calm —
the umbrella brand's only foothold inside a course.

### 4.4 Course dashboard — evolve the Knus design

The round-1 dashboard, updated for the new shape:

- **Hero** — title, blurb, 3–4 emoji bullets (copy per language in §5).
- **Stats banner** — `23/126 days done · 412 steps done · 380m time logged · 6🔥 day streak`.
- **Start/continue CTA** — `🚀 CONTINUE / 🧭 Klanken van het Nederlands / Day 24 · M04.2`.
- **Five level bands** now (was three): A1 Foundations · A2 Building · B1 Threshold ·
  B2 Depth · C1 Gateway, each with a week range and blurb. The page holds 18 week
  accordions — it must not just feel 50% longer; find the rhythm (band collapse,
  denser weeks, a "you are here" cue…).
- **Week accordion header** — `Week 13 — The full passive system · 3/7 complete ▸`.
- **Day cards** — day number + unit code (`24 · M04.2`), emoji + title, one-line
  summary, status. States: not started / in progress / **✓ complete** / **coming
  soon** (days 99–126 — locked-but-promised; must read as "on the way", inviting,
  never broken).
- **Footer** — donation line verbatim: *"❤️ I built this learning app out of love.
  If you're enjoying it, share it with a friend learning Dutch, send some
  feedback, or chip in below."* + storage disclosure (*"Progress is saved on this
  device only, your dashboard won't sync to other browsers."*) + a quiet
  **Reset all progress**.

### 4.5 Lesson player + the 11 blocks — refine only

Fully styled in the shipped system; touch only where round-2 decisions ripple in
(accent usage, header, the 🎉 completion state). The 11 block types, for
reference: card, chips, contrast, mcq, typed, dictation, builder, dialogue,
shadow, comprehension, journal. In-lesson microcopy is in the target language:
*"Goed zo!"*, *"Dag 24 klaar!"*, *"Type in Dutch…"*.

## 5. The four languages — real data for mockups

| | 🇳🇱 Dutch | 🇩🇪 German | 🇮🇹 Italian | 🇪🇸 Spanish |
|---|---|---|---|---|
| Tagline | Nederlands, echt waar. | Deutsch, aber echt. | Italiano, sul serio. | Español de España, en plan bien. |
| Accent | `#e8590c` | `#a9690c` | `#1e874b` | `#c21a32` |
| Hero title | Dutch, echt waar. | Deutsch, aber echt. | Italiano, sul serio. | Spanish of Spain, de verdad. |
| Personality | lekker, gezellig, hoor | doch, mal, halt, genau | allora, dai, boh, magari | vale, tío, guay, venga |
| Cast | Emma, Daan, Sanne, Bram | Lena, Jonas, Aylin, Klaus | Giulia, Marco, Sofia, Pietro | Lucía, Rafa, Sofía, Nacho |

Sample hero blurb (Dutch): *"Eighteen weeks. Short daily lessons. A buddy who
walks you from total beginner to real fluency — through B1, into B2 depth, up to
the C1 gateway — in real Netherlands Dutch."*

Sample dashboard content (Dutch): Week 1 "Sounds & first words" (Day 1 = 🔊
*Klanken van het Nederlands*, A1); Week 13 "The full passive system" (B2, days
85–91); days 99–126 coming soon.

## 6. Hard constraints

- Mobile-first; content column ~720px; sessions are 15–35 min on a phone.
- **Light + dark are both first-class** (new since round 1).
- Theming must stay derivable from **one accent value per language** — the engine
  computes every tint from it. If you introduce a second per-language signal
  (motif/pattern/texture), spec it as *data a pack supplies* (like the accent),
  not hand-tuned CSS per language — adding language #5 must stay a data change.
- Keep verbatim: the login reassurance note, the storage disclosure, the donation copy.
- Numeric stats in tabular figures. Audio is a 🔊 affordance on blocks.
- Coming-soon days stay visible (the full 126-day journey should feel real), just
  clearly not yet open.
- Accessible contrast in both modes; touch targets ≥ 44px.

## 7. Deliverables for this round

1. The evolved concept — login, language picker, and top bar in the umbrella
   brand, in the Knus language.
2. The dashboard restructured for 5 level bands / 18 weeks / coming-soon states —
   shown in **two languages** (suggest Dutch + Spanish) to prove the accent
   system carries identity.
3. Light and dark for the key screens.
4. A short **brand logic** note: how umbrella vs. language identity works, and
   exactly what a new language pack must supply to get its look (accent + whatever
   else you introduce).

Implementation happens in the repo against a stable class-name/DOM contract
(`docs/DESIGN-HANDOFF.md` there), so you don't need to match class names — but
keep components recognizably mappable: auth card, profile chips, language card,
stat tiles, start CTA, level band, week accordion, day card, footer.

## 8. Naming — open question (input welcome)

"YapWorld" is a **working title under review**. The next name must not belong to
any one language (no more *Dutch*Buddy) and should live in the speech/talk family
— think Babel, except that's effectively taken (Babbel is the incumbent
competitor). Current shortlist, roughly in order:

- **Hubbub** — the happy noise of many voices at once; inherently multi-language.
- **Chinwag** — a friendly chat; maximum personality, matches the casual register.
- **Blether** / **Natter** — dialect words for cozy, unhurried chatting; very knus.
- **Parlour** — the room built for conversation (from *parler*); pairs beautifully
  with the "each language is a doorway" idea, though it echoes "Parler/Parlor" apps.

Design the shell so the wordmark swaps without layout surgery, and treat the
violet umbrella accent as provisional — it may follow the name. If a shortlist
name inspires a stronger brand moment than YapWorld, sketch it — that's exactly
the input the naming decision needs.
