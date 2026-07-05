# Prompt — weekly lesson-batch generation

Use this once per week (12 times total) to author the 7 lesson JSON files for one
module. This is how the DutchBuddy weeks were written, generalized. Each run is
self-contained and machine-gated: the batch is not "done" until
`node tools/validate.js public/packs/<pack-id>` returns **zero errors**.

---

## Inputs (all three are required — do not generate without them)

1. **Curriculum scope for this week** — the 7 day topics from
   `public/packs/<pack-id>/curriculum.md` (locked; do not invent or drift scope).
2. **Style guide** — `public/packs/<pack-id>/style-guide.md` (voice, en↔target
   formatting, block-count targets, schema traps, difficulty ramp).
3. **Cast bible** — `public/packs/<pack-id>/characters.md` (voices, arc timeline,
   the self-intro layering table).

Also load `../docs/plan.md` §2 for the schema, and skim `public/packs/dutch-nl/
lessons/day-01.json` (simple lesson) and `day-65.json` (dense B1 lesson) as shape
fixtures — copy the *structure*, never the Dutch content.

## Prompt body

> You are authoring **week {{N}} (module M{{NN}})** of {{APP_NAME}}, a
> {{DIALECT_IDENTITY}} course, against the fixed LanguageBuddy engine. Write all 7
> lesson files: `day-{{first}}.json` … `day-{{last}}.json` in
> `public/packs/{{PACK_ID}}/lessons/`.
>
> **Scope (locked):** for each day, teach exactly the topic given in the curriculum
> for that day — no more, no less.
>
> **Rules (from the style guide — obey exactly):**
> - Target-language text goes in the `nl` field, English gloss in `en` (fixed engine
>   keys — never rename `nl`).
> - **Block counts:** `lesson` 8–12 · `review` 6–8 · `capstone` 10–14.
> - **One new thing per block.** Each block teaches a single unit. Ramp within the
>   lesson: teach (card) → recognise (chips/mcq) → produce (typed/builder) → use
>   (dialogue/journal).
> - Each `lesson` has **≥3 graded blocks** (mcq/typed/dictation/builder/comprehension)
>   and **≥1 audio touch** (chips or shadow).
> - **Difficulty ramp by level:** A1 (W1–4) heavy English scaffolding, short `nl`,
>   3–5-line dialogues; A2 (W5–8) shorter glosses, longer dialogues, past tense in;
>   B1 (W9–12) 6–10-line dialogues, prompts/comprehension/journal increasingly in
>   the target language.
> - **Emoji:** one per lesson, topical, **distinct within this week**.
> - **`module`** on every lesson = `M{{NN}}`; **`id`/`day`** match the filename;
>   `unit` = `U{{NN}}`.
>
> **The review/immersion day** (if this week has one) is a `review`: it must include
> a **dialogue with the recurring cast** honoring the arc timeline in
> `characters.md`, followed by a `comprehension` on that dialogue.
>
> **The capstone day** is a `capstone`: recap → graded drills across the week → a
> producing block → **the self-intro block for this week**. That self-intro
> `builder`/`journal` block's `title` **must contain the literal token `verhaal`**
> (engine invariant — e.g. `"Mijn verhaal → {{label}}"`) and must layer in this
> week's cumulative self-intro move from the `characters.md` table.
>
> **Grammar accuracy:** honor the spine rules in the style guide §6. No anglicisms.
> All examples original — invent them in the cast's world; never lift wordlists,
> textbook dialogues, or copyrighted sentences.
>
> Output **strict JSON** per file (no comments, no trailing commas).

## Self-validation step (mandatory before declaring the batch done)

```
node tools/validate.js public/packs/{{PACK_ID}}
```

- **Zero errors** is the gate. Fix every error and re-run until clean. (Partial
  packs are fine — the validator only checks days whose files exist, so week-by-week
  gating works.)
- **Resolve warnings too:** block-count out of target, `table` row width ≠ headers,
  emoji repeated within a week, missing-file warnings for days you meant to write.
- Common failures and fixes:
  - *"speaker X not in manifest cast"* → the name must be in manifest `cast` or be
    `"You"`. Check spelling / add to cast before using.
  - *"capstone has no self-intro"* → the `verhaal` token is missing from the
    capstone; add it to the self-intro block title.
  - *"correct index out of range"* → `mcq`/`comprehension` `correct` is 0-based.
  - *"table row length ≠ header length"* → pad/trim the row arrays.
- Only after zero errors, hand the batch to `review-rubric.md` for the correctness
  pass.
