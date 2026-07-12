# Claude Design brief — Practice (palm cards + pronunciation studio)

Companion to `docs/DESIGN-HANDOFF.md` (read that first — same rules apply:
behavior and class names are final, the visual layer is yours). This brief
covers the new **Practice** surfaces and the design intent behind them, so the
visual pass lands a clean, focused experience rather than restyled clutter.

## Why this exists (design intent)

Lessons are 15–35 minute sit-down sessions. Practice is the opposite: the
**five-spare-minutes loop** — pull the phone out, flip ten cards or say six
lines out loud, put it away feeling one notch better. Every design decision
should serve three feelings:

1. **Instant** — zero setup, zero choices beyond one tap from the dashboard.
   Content is auto-built from lessons the learner has already seen.
2. **Focused** — one thing on screen at a time. A card. A line. No dashboard
   chrome, no course tree, no stats competing for attention.
3. **Kind** — this is self-graded practice, not testing. "Again" is a
   friendly loop, not a failure state. The mic verdict encourages; it never
   scores in red ink.

Practice modes are full-screen takeovers (like the lesson player): the top bar
disappears, one sticky header carries you back.

## Flow map

```
Dashboard
 └── 🎯 "Five spare minutes?"  (.practice-banner, two .practice-tile)
      ├── 🎙 Pronunciation studio   (.practice / Pronunciation.jsx)
      │     scope pills → line card → listen / slow / say-it → verdict → next → done screen
      └── 🃏 Palm cards             (.practice / PalmCards.jsx)
            scope pills → flip card → Again | Got it → … → done screen
```

## Screens & class hooks

### 1. Dashboard entry — `.practice-banner` (in `Dashboard.jsx`)
- Sits directly under the `.start-here` CTA. It is the **second-strongest**
  element on the dashboard — clearly a sibling action, never louder than
  "Continue".
- `.practice-grid` → two `.practice-tile` (`.practice-emoji`, `.practice-title`,
  `.practice-sub`). Tiles should feel tactile and inviting — same family as
  `.day-card` but warmer (accent-tinted border in the placeholder).
- Copy stays casual ("Five spare minutes?") — this is a nudge, not a menu.

### 2. Shared practice chrome — `PalmCards.jsx` / `Pronunciation.jsx`
- Reuses the player header hooks: `.player-header` (sticky), `.player-topline`
  (`.back-btn` + `.voice-settings`), `.player-title`, `.player-meta`.
- `.practice-body` — single centered column, max ~560px. Generous whitespace;
  the artifact (card / line) is the hero.
- `.scope-row` → two `.scope-pill` (`.is-active`): **My days** (default —
  content from days the learner opened; falls back to week 1 for newcomers) vs
  **Whole course**. Keep them quiet — a segmented control, not tabs.
- `.practice-progress` reuses `.progress-bar`/`.progress-fill` + a count.
  Progress within a session matters (it promises "this ends soon").
- `.practice-done` — the round-complete card: 🎉 headline, one warm stat line,
  `.rate-row` with "Go again" / "Back to dashboard". Celebrate lightly;
  no confetti walls.

### 3. Palm cards — `PalmCards.jsx`
- `.pcard` — THE element of the screen. A big, obviously-tappable card:
  `.pcard-side-label` (ITALIAN / ENGLISH eyebrow), `.pcard-text` (the word,
  display type, biggest text in the app), `.pcard-hint` ("Tap to flip").
- Flip state: `.pcard.is-flipped` (accent-tinted in the placeholder). A real
  3D flip animation is welcome if it stays fast (<250ms) and respects
  `prefers-reduced-motion` (fall back to a crossfade).
- Audio: flipping speaks the word; `.pcard-actions .speak-btn` ("🔊 Hear it")
  replays. Audio is part of the card ritual — keep the button close to the card.
- `.rate-row` after flip: `.rate-btn.rate-again` (↺ Again, soft red family) and
  `.rate-btn.rate-got` (✓ Got it, soft green family). Equal size — "Again" must
  not look like the loser button.
- Pre-flip helper: `.practice-hint` ("Say it out loud, then flip to check.") —
  this line carries the pronunciation-first philosophy; keep it visible.
- Header meta shows deck health ("12 of 87 solid · your days") — quiet, not a
  gauge.

### 4. Pronunciation studio — `Pronunciation.jsx`
- `.pron-line` — the hero card: optional `.speaker` chip (dialogue lines carry
  the character name — Giulia, Marco…), `.pron-text` (target sentence, big),
  `.pron-en` (gloss, quiet).
- `.pron-controls` — three equal pills: 🔊 Listen, 🐢 Slow, 🎙 Say it.
  The mic button only renders where the browser supports speech recognition;
  the design must look complete with two OR three pills.
- Listening state: `.mic-btn.is-listening` (pulse animation; reduced-motion
  safe). Make it unmistakable that the app is hearing you.
- `.pron-verdict` — the feedback card: `.pron-verdict-note` (emoji + one
  encouraging line), `.pron-heard` ("Heard: …" in italics). Great matches get
  `.is-great` (green family). Never render a percentage or a red ✗ — tiers are
  🌟 great / 👍 close / 💪 keep going.
- Mic-blocked fallback: a `.practice-hint` line, not an error banner.
- `.rate-row`: "↺ Once more" / "Next →". Next is the primary.

## States to design

| State | Where | Treatment |
|---|---|---|
| Empty (no lessons loaded) | both modes | `.voice-empty` prose card, friendly, points to lessons |
| Fresh learner (no progress) | both | works silently — scope falls back to week 1, no warning needed |
| Mic unsupported | pronunciation | mic pill simply absent; layout balanced with 2 pills |
| Mic permission denied | pronunciation | `.practice-hint` reassurance, practice continues by ear |
| Round complete | both | `.practice-done` celebration card |
| Reduced motion | flip + mic pulse | crossfade / static treatment |

## Visual language

- Everything derives from the existing token system in `base.css` (`--accent`
  family, paper palette, `--radius-*`, display/body fonts). Per-language accent
  theming applies automatically — the Italian practice room is green because
  Italy is; don't hardcode colors.
- Type scale: `.pcard-text` is allowed to be the largest text in the product
  (~30px+). Pronunciation `.pron-text` a step below. Everything else stays small.
- Dark mode via the existing `prefers-color-scheme` overrides — check the
  flip-state tint and verdict greens hold contrast in dark.
- Touch targets ≥44px; the whole `.pcard` is one target.

## Copy voice

Short, warm, second-person, zero jargon. "Shaky ones come back sooner", not
"spaced repetition algorithm". "Say it out loud" appears wherever a learner
might silently tap through — speaking aloud IS the feature.

## Out of scope for the design pass

- Component logic, Leitner scheduling, speech-recognition wiring
  (`src/engine/practice.js` — no UI in it).
- The lesson player and blocks (covered by the main handoff).
- Any new practice modes (typing sprints, listening quizzes) — welcome as
  *proposals* in the design chat, but don't build speculative UI.
