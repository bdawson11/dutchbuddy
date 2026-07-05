---
name: languagebuddy-pack
description: >
  Produce a validated, drop-in content pack for a new target language against the
  unchanged LanguageBuddy engine (the DutchBuddy build, generalized). Use when
  someone wants to author a full A1→B1 course pack for language X — an 84-day
  curriculum, manifest, cast bible, style guide, and 12 weekly lesson batches that
  pass `tools/validate.js` with zero errors and drop into `public/packs/`. Triggers
  on "new language pack", "build <language>Buddy", "author a course pack",
  "port DutchBuddy to <language>", or work under `skill/` and `public/packs/`.
---

# LanguageBuddy — new-language pack skill

Turn the DutchBuddy build process into a repeatable pipeline for any language. You
answer a questionnaire, the skill drives you through curriculum → manifest → cast →
style guide → 12 validated lesson batches → a pack folder ready to drop into
`public/packs/`. The **engine never changes**; you only ever produce data.

Read `../docs/plan.md` §5 (the spec this skill implements) and §1–4 (the fixed
engine/schema/validator/rhythm). The Dutch pack in `public/packs/dutch-nl/` is the
worked reference — imitate its shape, not its content.

---

## What is FIXED — never regenerate, never fork

These are the engine and its contracts. The skill treats them as read-only. A pack
succeeds by conforming to them, not by touching them.

- **Engine** — player, block components, dashboard, progress/localStorage, audio
  abstraction. Zero per-language code. (`../docs/plan.md` §1)
- **Schemas** — manifest schema and the lesson schema, both `schemaVersion: 1`.
  (`../docs/plan.md` §2)
- **Validator** — `tools/validate.js`. The machine gate. You reuse it as-is; you do
  not copy or reimplement it. Every batch must pass it with **zero errors**.
- **Block taxonomy** — the 11 block types (`card`, `chips`, `contrast`, `mcq`,
  `typed`, `builder`, `dialogue`, `dictation`, `shadow`, `comprehension`, `journal`).
  No new block types (that would need an engine component).
- **Weekly rhythm** — 12 weeks / 84 days. Weeks 1–2 = 6 teaching days + capstone;
  weeks 3–12 = 5 teaching + 1 review/immersion + 1 capstone.
- **Lesson-kind block-count targets** — `lesson` 8–12, `review` 6–8, `capstone`
  10–14 (validator warns outside these).
- **Dashboard / stats mechanics** — days started, steps done, time logged, streak.
  Generated from data; nothing to author.
- **Trust touches** — free/no-signup framing, "progress saves on this device only",
  Reset-all-progress, donation footer. Wording lives in the manifest `footer`; the
  behavior is fixed.

### One fixed engine key + two manifest-driven content invariants (read these)

1. **The field key `nl` is the target-language slot for ALL packs.** In `chips`,
   `shadow`, and `dialogue` blocks the validator requires the keys `nl` and `en`
   literally. Put the **target language** text in `nl` and the English gloss in
   `en`, even for Portuguese/Japanese/etc. Do **not** rename `nl` → `pt`. It's a
   historical field name, now a fixed engine key. (Neutral blocks — `typed`,
   `dictation`, `contrast`, `mcq`, `comprehension`, `builder` — use neutral keys
   like `answers`/`left`/`right` and are unaffected.)
2. **The self-intro invariant is configured per-pack in the manifest.** The
   validator greps every `capstone` for the token named in
   `manifest.contentInvariants.selfIntroTag` (Dutch pack: `"verhaal"`). Set it to
   YOUR self-intro keyword and carry that token in every capstone's self-intro
   block `title`. Omit `selfIntroTag` and the check is skipped. (No Dutch string
   lives in the engine — the validator is language-agnostic.)
3. **The arc-leak check is configured per-pack in the manifest.** Set
   `manifest.contentInvariants.arc` to `{ character, place, revealDay }` for YOUR
   mid-arc mover and destination; the validator warns if they co-occur before
   `revealDay`. Omit `arc` and the check is skipped. Your `prompts/review-rubric.md`
   pass still re-checks the arc by reading as well.

---

## What is PARAMETERIZED — the 8-point questionnaire (ask up front)

Before generating anything, collect these eight answers. They are the entire
language-specific surface. Fill them into the templates; everything else is fixed.

1. **Dialect identity** — which variant, contrasted against what.
   *Dutch: "Netherlands Dutch, not Flemish."* → manifest `dialect` +
   style-guide voice section. Ask: which region's standard? What's the "not-this"?
   What are 3–5 identity markers (words/particles a native leans on)?
2. **Grammar spine** — the **2–4 structural hard parts** that anchor sequencing.
   *Dutch: V2 word order, perfect-as-everyday-past, verb-final subclauses, `er`.*
   These drive the curriculum order (teach the spine early, revisit relentlessly,
   gate A2→B1 on the hardest one). Ask: what are this language's 2–4 things that
   trip every learner? Which is the A2→B1 gate?
3. **84-day curriculum** — the day-by-day map **designed from the spine**, not
   translated from Dutch. `templates/curriculum.template.md` is the fill-in.
4. **Cultural scene anchors** — the **6–8 recurring settings** that drive vocab
   modules (café, GP/huisarts, transit, market, snackbar…). Ask for the target
   culture's equivalents; these become dialogue scenes and module themes.
5. **Cast + arc** — **4 characters**, one mid-arc life event landing **~day 69**.
   *Dutch: Sanne moves Amsterdam→Utrecht on day 69.* `templates/characters.template.md`.
   Ask: 4 names + roles (narrator, gossip/convo partner, the one whose life moves,
   the routine/outside-the-capital voice) and what the ~day-69 life event is.
6. **Register / slang system** — traffic-light tiers (green everyday / yellow casual
   / red use-with-care) with **language-appropriate caution notes**. *Dutch red tier
   = disease-based cursing.* Ask: what's green, yellow, and what's the culturally
   loaded red tier here?
7. **Meta-module slot** — **one** language-specific challenge module.
   *Dutch: "blijf in het Nederlands" (the switch-to-English problem, day 74).*
   Other languages: tones, formality/keigo systems, script/writing system, gendered
   agreement, aspect… Ask: what's the one thing uniquely hard about *staying in* or
   *producing* this language that deserves its own day?
8. **Locale / audio config** — TTS `locale` code (e.g. `pt-PT`, `ja-JP`) and a
   Web Speech voice-availability sanity check. Ask: which locale? Does a voice exist
   for it in the target browsers (if not, flag v2 pre-generated TTS as a dependency)?

If the requester hasn't decided the app name / `packId`, ask — it sets `appName`,
`packId` (`<lang>-<locale-region>-v1`), branding, and the pack folder name.

---

## The end-to-end workflow

Run these in order. Each step has a template or prompt; each batch is machine-gated.

**0. Questionnaire.** Collect the 8 answers above (+ app name / packId). Don't
generate content until every slot is filled — a missing grammar spine or arc anchor
poisons the whole curriculum.

**1. Curriculum doc.** Fill `templates/curriculum.template.md` into
`public/packs/<pack-id>/curriculum.md`. Sequence the 84 days from the **grammar
spine** (Q2): introduce each spine element early, gate the hardest at A2→B1, land
the meta-module (Q7) in weeks 11–12, and place the cast arc beats — especially the
~day-69 life event (Q5) — on the review/immersion days. This locks scope per day
before any lesson is written.

**2. Manifest.** Fill `templates/manifest.template.json` into
`public/packs/<pack-id>/manifest.json`. Every `{{PLACEHOLDER}}` maps to a
questionnaire answer or the curriculum's week/module list. The `cast` list here is
authoritative — `dialogue` speakers are validated against it.

**3. Cast bible + style guide.** Fill `templates/characters.template.md` and
`templates/style-guide.template.md` into the pack folder (authoring-time, not
shipped). The style guide is where the **grammar-accuracy** section (Q2) and the
en↔target formatting live; the cast bible is where the arc timeline and the
"self-intro layering" table live.

**4. Lesson batches — one week at a time.** For each week 1–12, run
`prompts/batch-generation.md` with three inputs: that week's curriculum scope, the
style guide, and the cast bible. It writes 7 lesson files
(`public/packs/<pack-id>/lessons/day-NN.json`) and self-validates.

**5. Validate every batch.** After each week:
```
node tools/validate.js public/packs/<pack-id>
```
Zero errors is the merge gate. Resolve warnings too (block counts, table widths,
emoji-repeat-within-week). Partial packs validate fine — the validator only checks
days whose files exist — so you can gate week-by-week. Run
`node tools/validate.js public/packs/<pack-id> --strict` only once all 84 exist.

**6. Correctness pass.** Run `prompts/review-rubric.md` over each batch (or the
whole pack): grammar red-team on the spine, register, no-anglicisms, MCQ/answer
correctness, arc consistency. The validator catches *shape*; this catches *truth*.
Native-speaker review of at least the dialogues before public launch remains an
open dependency — flag it.

**7. Ship.** The finished `public/packs/<pack-id>/` folder (manifest + 84 lessons)
is drop-in. `curriculum.md`, `characters.md`, `style-guide.md` stay in the folder
for authoring consistency but are not served.

---

## Ponytail notes

- No code here duplicates the engine or the validator — the skill is templates and
  prompts that produce data the existing tools already check.
- No new block types, no schema changes, no validator edits. If a language seems to
  "need" a new block type, express it with the existing 11 first (it almost always
  fits: a tone drill is `contrast` + `mcq`; a script drill is `card` + `typed`).
- The three engine couplings above are load-bearing constraints, not bugs to route
  around. Honor them and the unchanged validator passes.
