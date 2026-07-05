# {{APP_NAME}} — Style Guide (template)

*Authoring-time only. Not shipped. The fixed voice + format + schema contract for
every lesson JSON. Follow it exactly so machine validation (`tools/validate.js`)
passes on the first run and 84 days written in parallel read as one app.*

> **How to use this template:** replace every `{{PLACEHOLDER}}` from the
> questionnaire, and every *illustration in italics* is a Dutch example showing the
> pattern — swap it for a target-language example or delete it. The **rules** (block
> counts, the "one new thing" rule, ramp, schema traps) are FIXED — keep them
> verbatim.

---

## 1. Voice

- **{{DIALECT_IDENTITY}}, not {{WHAT_IT_IS_NOT}}.** Lean on these identity markers:
  *{{MARKER_1}}, {{MARKER_2}}, {{MARKER_3}}, {{MARKER_4}}*. Never use the
  not-this-dialect forms (list the giveaway ones so authors avoid them):
  {{FORMS_TO_AVOID}}.
- **Warm, plain, a little funny.** You're a buddy, not a textbook. English
  explanations are short, concrete, occasionally wry. Never academic.
- **No anglicisms in the target language.** Real idiomatic {{LANGUAGE_NAME}}, not
  English-shaped {{LANGUAGE_NAME}}. Where the language borrows English words
  natively, use what a native actually says — not a calque.
- **Encourage, never scold.** Wrong answers get a nudge and a retry, never a block.

## 2. English ↔ target-language formatting conventions

> **Fixed engine key:** in `chips`, `shadow`, and `dialogue` blocks the
> target-language text goes in the JSON field named **`nl`** and the English gloss
> in **`en`** — for *every* language. `nl` is a historical field name that is now
> the fixed engine key for "target language." Do **not** rename it.

- In `card`/`callout` **body** (markdown): target-language example words in
  *italics*, key rules or the "one new thing" in **bold**. Glosses in parentheses:
  *word* (gloss).
- In `chips`/`shadow`/`dialogue`: target text in `nl`, English gloss in `en`. Do
  **not** repeat the translation inside `nl`.
- Em dashes for "word — gloss" inside table cells: `"word — gloss"`.
- Keep English glosses tight — a word or short phrase, not a sentence.
- Only markdown the engine renders is `**bold**` and `*italic*`, plus tables via the
  `table` field. No headings, lists, links, or code in `body`.

## 3. The "one new thing per block" rule (FIXED)

Each block introduces **one** teachable unit (one rule, one contrast, one drill
target). Don't stack two grammar points in a single card. Difficulty ramps **within**
a lesson: teach → recognise (mcq/chips) → produce (typed/builder) → use
(dialogue/journal).

## 4. Lesson shape by `kind` (FIXED — validator warns outside these)

| kind | blocks | arc |
|------|--------|-----|
| `lesson` | **8–12** | 1–2 teaching cards → chips/contrast → mcq → typed/dictation → (dialogue or builder) → journal |
| `review` | **6–8** | light recap card → mixed drills pulling the week's targets → **immersion dialogue with the recurring cast** → comprehension → short journal |
| `capstone` | **10–14** | recap card → graded drills across the week → a builder or dialogue that *produces* → **the self-intro layer for that week** (builder or journal) → celebratory journal |

Every **review** day carries the recurring-cast story arc (see `characters.md`).
Every **capstone** ends on the growing self-intro — and (engine constraint) its
self-intro block **must carry the literal token `verhaal`** so the validator's
capstone check passes; see `characters.md` for placement.

A normal `lesson` should include **at least 3 graded blocks** (mcq/typed/dictation/
builder/comprehension) so a day is practice, not just reading. Aim for ≥1 `chips` or
`shadow` (audio touch) per lesson.

## 5. Block authoring rules (schema + traps — FIXED)

Top-level lesson fields (all required): `schemaVersion` (always `1`), `id`
(`"day-NN"`, zero-padded), `day` (int, matches id), `module` (`"MNN"`, matches the
manifest week), `unit`, `kind`, `title` (in the target language, evocative), `emoji`
(one, topical), `level` (`A1`/`A2`/`B1`), `durationMin` (`[15,25]` typical),
`summary` (one English line), `blocks[]`.

`unit` convention: `"U"` + two digits; simplest is one unit per week (all of M05 =
`"U05"`). Keep it consistent within a week.

Per block type — **required fields and the traps:**

- **card** — `title`, `body` (markdown). Optional `table` {`headers[]`, `rows[]`} —
  **every row array length must equal headers length** (validator fails otherwise).
  Optional `callout` (one punchy line). No audio.
- **chips** — `items[]`, each `{nl, en, speak?}`. `nl` = target text, `en` = gloss.
  Set `speak` to the exact target text to voice (usually = `nl`). Optional `title`.
  4–8 items.
- **contrast** — `pairs[]`, each `{left, right, note?}`. Use for any A-vs-B split
  (gender, tense pairs, formal vs casual, tone pairs). `note` explains the split.
- **mcq** — `prompt`, `options[]` (≥2), `correct` (**0-based index**, in range),
  `explain`. Exactly one right option. `explain` teaches, doesn't just confirm.
- **typed** — `prompt`, `answers[]` (≥1). List **every** acceptable spelling
  explicitly: contractions, with/without article, spacing variants. Grading
  normalizes case/whitespace/terminal punctuation and is diacritic-tolerant — but
  still put the correctly accented form **first** in `answers` (it's shown as the
  gentle correction).
- **dictation** — `speak` (target text to voice), `answers[]`. `prompt` optional.
  Keep `speak` short enough to hold in memory (≤6 words early, longer later).
- **builder** — `slots[]`, each `{label, chips[]}` (**chips required and
  non-empty**). `sample` (a model full sentence). Optional `prompt`, `starters`.
  Great for word-order practice: one slot per sentence position.
- **dialogue** — `scene` (English stage-setting line), `lines[]` each
  `{speaker, nl, en, spotlight?}`. **`speaker` must be `"You"` or a name in the
  manifest `cast`** — anything else fails validation. `spotlight` flags a teachable
  moment on that line. 4–10 lines. Honor the arc timeline in `characters.md`.
- **shadow** — `lines[]` each `{nl, en}`. Listen→repeat. Optional `title`. 3–6 lines.
- **comprehension** — `questions[]` each `{q, options[], correct}` (`correct`
  0-based, in range). Use **after** a dialogue/passage in the same lesson.
- **journal** — `prompt`. Optional `starters[]` (target-language sentence openers),
  `minSentences`. Closes most lessons; free text, saved locally.

## 6. Grammar accuracy (non-negotiable) — the {{LANGUAGE_NAME}} spine

Fill this section from the **grammar spine** (questionnaire Q2). One bullet per
spine element; be specific enough that an author can self-check. Template rows to
replace:

- **{{SPINE_1}}** (e.g. word order): {{how it works + the trap; when to model it}}.
  *Dutch example of this row: V2 — the finite verb is second in main clauses; in
  subclauses it goes to the end. Model correctly from W2 on.*
- **{{SPINE_2}}** (e.g. the everyday past tense): {{formation rule + irregulars}}.
- **{{SPINE_3}}** (the A2→B1 gate): {{the structure that separates A2 from B1}}.
- **{{SPINE_4}}** (optional 4th): {{the feared module — Dutch: `er`}}.
- **Register:** get the formal/casual distinction right ({{FORMAL_PRONOUN}} vs
  {{CASUAL_PRONOUN}} / honorifics / tone), and model it consistently.
- All content **original** — no lifted CEFR wordlists, textbook dialogues, or
  copyrighted sentences. Invent your own examples in the cast's world.

## 7. Difficulty ramp across the 84 days (FIXED shape)

- **A1 (W1–4):** English scaffolding heavy. Short `nl`. Explanations in English.
  Dialogues 3–5 lines, simple.
- **A2 (W5–8):** glosses shorten; dialogues lengthen; introduce past tense(s); some
  `explain`/`spotlight` text starts appearing in easy target language.
- **B1 (W9–12):** dialogues run 6–10 lines; prompts increasingly in the target
  language; comprehension questions in the target language; journal prompts in the
  target language. By W12 the meta-module (Q7) is pushing the learner to *stay in*
  the language.

## 8. Output & handoff rules (FIXED)

- One file per day: `public/packs/{{PACK_ID}}/lessons/day-NN.json`, zero-padded,
  **strict JSON** (no comments, no trailing commas).
- Emoji: exactly one per lesson, topical. **Distinct within a week** (validator
  errors on a repeat inside one week).
- After writing a batch, run `node tools/validate.js public/packs/{{PACK_ID}}`.
  **Zero errors** is the merge gate; resolve warnings (block counts, table widths,
  emoji repeats) too.
- Keep each lesson genuinely teachable and fun. Dogfood mentally: could a real
  beginner do this on a phone in 15–25 minutes?
