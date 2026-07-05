# DutchBuddy — Style Guide

*Authoring-time only. Not shipped. The fixed voice + format + schema contract for
every lesson JSON. Follow it exactly so machine validation (`tools/validate.js`)
passes on the first run and 84 days written in parallel read as one app.*

---

## 1. Voice

- **Netherlands Dutch, not Flemish.** Randstad-standard. Markers to lean on: *lekker, gezellig, hoor, doe maar, even, joh, nou*. Never Belgian forms (*gij, ge, hesp, nen*).
- **Warm, plain, a little funny.** You're a buddy, not a textbook. English explanations are short, concrete, occasionally wry. Never academic.
- **No anglicisms in the Dutch.** Real idiomatic Dutch, not English-shaped Dutch. When Dutch borrows English (it does — *leuk, cool, spannend*), use what a native actually says.
- **Encourage, never scold.** Wrong answers get a nudge and a retry, never a block.

## 2. English ↔ Dutch formatting conventions

- In `card`/`callout` **body** (markdown): Dutch example words in *italics* (`*maan*`), key rules or the "one new thing" in **bold**. Glosses in parentheses: `*maan* (moon)`.
- In `chips`/`shadow`/`dialogue`: Dutch goes in the `nl` field, English gloss in `en`. Do **not** repeat the translation inside `nl`.
- Em dashes for "word — gloss" inside table cells: `"maan — moon"`.
- Keep English glosses tight — a word or short phrase, not a sentence.
- Only real markdown supported by the engine is `**bold**` and `*italic*` (see `blocks/index.jsx` `md()`), plus tables via the `table` field. No headings, lists, links, or code in `body`.

## 3. The "one new thing per block" rule

Each block introduces **one** teachable unit (one rule, one contrast, one drill target). Don't stack two grammar points in a single card. Difficulty ramps **within** a lesson: teach → recognise (mcq/chips) → produce (typed/builder) → use (dialogue/journal).

## 4. Lesson shape by `kind`

Block-count targets (validator warns outside these — stay inside):

| kind | blocks | arc |
|------|--------|-----|
| `lesson` | **8–12** | 1–2 teaching cards → chips/contrast → mcq → typed/dictation → (dialogue or builder) → journal |
| `review` | **6–8** | light recap card → mixed drills pulling the week's targets → **immersion dialogue with the recurring cast** → comprehension → short journal |
| `capstone` | **10–14** | recap card → graded drills across the week → a builder or dialogue that *produces* → **the "mijn verhaal" self-intro layer for that week** (builder or journal) → celebratory journal |

Every **review** day carries the recurring-cast story arc (see characters.md). Every **capstone** ends on the growing self-intro.

A normal `lesson` should include **at least 3 graded blocks** (mcq/typed/dictation/builder/comprehension) so a day is practice, not just reading. Aim for ≥1 `chips` or `shadow` (audio touch) per lesson.

## 5. Block authoring rules (schema + gotchas)

Top-level lesson fields (all required): `schemaVersion` (always `1`), `id` (`"day-NN"`, zero-padded), `day` (int, matches id), `module` (`"MNN"`, matches the manifest week), `unit`, `kind`, `title` (Dutch, evocative), `emoji` (one, topical), `level` (`A1`/`A2`/`B1`), `durationMin` (`[15,25]` typical), `summary` (one English line), `blocks[]`.

`unit` convention: `"U"` + two digits, incrementing within a module is fine; simplest is one unit per week (e.g. all of M05 = `"U05"`). Keep it consistent within a week.

Per block type — **required fields and the traps:**

- **card** — `title`, `body` (markdown). Optional `table` {`headers[]`, `rows[]`} — **every row array length must equal headers length** (validator fails otherwise). Optional `callout` (one punchy line). No audio.
- **chips** — `items[]`, each `{nl, en, speak?}`. Set `speak` to the exact Dutch to voice (usually = `nl`). Optional `title`. 4–8 items.
- **contrast** — `pairs[]`, each `{left, right, note?}`. Use for de/het, ij/ei, perfect vs imperfect, blunt vs soft particles. `note` explains the split.
- **mcq** — `prompt`, `options[]` (≥2), `correct` (**0-based index**, in range), `explain`. Exactly one right option. `explain` teaches, doesn't just confirm.
- **typed** — `prompt`, `answers[]` (≥1). List **every** acceptable spelling explicitly: contractions (`"'t is"` and `"het is"`), with/without article (`"maan"`, `"de maan"`), spacing variants. Optional `hint`, `explain`. Grading normalizes case/whitespace/terminal punctuation and is diacritic-tolerant, so `een`/`één` both pass — but still put the correct accented form **first** in `answers` (it's shown as the gentle correction).
- **dictation** — `speak` (Dutch to voice), `answers[]`. `prompt` optional (defaults nicely). Keep `speak` short enough to hold in memory (≤6 words early, longer later).
- **builder** — `slots[]`, each `{label, chips[]}` (**chips required and non-empty** — the schema needs chips even if you imagine free text). `sample` (a model full sentence). Optional `prompt`, `starters`. Great for V2/word-order practice: one slot per sentence position.
- **dialogue** — `scene` (English stage-setting line), `lines[]` each `{speaker, nl, en, spotlight?}`. **`speaker` must be `"You"` or a name in the manifest cast** (Emma/Daan/Sanne/Bram) — anything else fails validation. `spotlight` flags a teachable moment on that line. 4–10 lines. Honor the arc timeline.
- **shadow** — `lines[]` each `{nl, en}`. Listen→repeat. Optional `title`. 3–6 lines.
- **comprehension** — `questions[]` each `{q, options[], correct}` (`correct` 0-based, in range). Use **after** a dialogue/passage in the same lesson.
- **journal** — `prompt`. Optional `starters[]` (Dutch sentence openers), `minSentences`. Closes most lessons; free text, saved locally.

## 6. Grammar accuracy (non-negotiable)

- **V2 word order:** the finite verb is second in main clauses. In subclauses (*omdat, dat, als, terwijl…*) the verb goes to the **end**. Model this correctly everywhere from W2 on — it's a structural spine.
- **de/het:** get articles right. Diminutives (*-je*) are always *het*. When unsure, prefer common, checkable words.
- **Perfect tense:** *hebben* vs *zijn* auxiliary; *ge-…-d/t* participles; 't kofschip for the -t/-d choice; the top irregulars (*geweest, gegaan, gedaan, gezegd, gehad, gezien, gekomen*). Separable verbs split the *ge-* inside (*opgestaan, meegenomen, aangekomen*).
- **Negation:** *geen* before an indefinite/no-article noun, *niet* otherwise; *niet* placement (end, but before predicate adjectives/prepositional phrases).
- **Numbers:** reversed tens — *vierentwintig* (four-and-twenty), one word.
- All content **original** — no lifted CEFR wordlists, textbook dialogues, or copyrighted sentences. Invent your own examples in the cast's world.

## 7. Difficulty ramp across the 84 days

- **A1 (W1–4):** English scaffolding heavy. Short `nl`. Explanations in English. Dialogues 3–5 lines, simple.
- **A2 (W5–8):** glosses shorten; dialogues lengthen; introduce past tenses; some `explain`/`spotlight` text starts appearing in easy Dutch.
- **B1 (W9–12):** dialogues run 6–10 lines; prompts increasingly in Dutch; comprehension questions in Dutch; journal prompts in Dutch. By W12 the learner is being asked to "blijf in het Nederlands."

## 8. Output & handoff rules

- One file per day: `public/packs/dutch-nl/lessons/day-NN.json`, zero-padded, **strict JSON** (no comments, no trailing commas).
- Emoji: exactly one per lesson, topical (🔊 sounds, 🔢 numbers, 🍞 food, 🚂 travel, 🩺 health, 🕰 past, 💬 opinions, 🧩 grammar, 🎉 finale…). Pick distinct ones across a week.
- After writing a batch, it will be run through `node tools/validate.js public/packs/dutch-nl`. **Zero errors** is the merge gate; resolve warnings (block counts, table widths) too.
- Keep each lesson genuinely teachable and fun — you are the target user. Dogfood mentally: could a real beginner do this on a phone in 15–25 minutes?
