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
- In `chips`/`shadow`/`dialogue`: Dutch goes in the `target` field, English gloss in `en`. Do **not** repeat the translation inside `target`. (Schema v1 packs named this field `nl`; the engine reads `target ?? nl`, but new content uses `target`.)
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

Top-level lesson fields (all required): `schemaVersion` (always `2`), `id` (`"day-NN"`, zero-padded), `day` (int, matches id), `module` (`"MNN"`, matches the manifest week), `unit`, `kind`, `title` (Dutch, evocative), `emoji` (one, topical), `level` (`A1`/`A2`/`B1`), `durationMin` (`[15,25]` typical), `summary` (one English line), `blocks[]`.

`unit` convention: `"U"` + two digits, incrementing within a module is fine; simplest is one unit per week (e.g. all of M05 = `"U05"`). Keep it consistent within a week.

Per block type — **required fields and the traps:**

- **card** — `title`, `body` (markdown). Optional `table` {`headers[]`, `rows[]`} — **every row array length must equal headers length** (validator fails otherwise). Optional `callout` (one punchy line). No audio.
- **chips** — `items[]`, each `{target, en, speak?}`. Set `speak` to the exact Dutch to voice (usually = `target`). Optional `title`. 4–8 items.
- **contrast** — `pairs[]`, each `{left, right, note?}`. Use for de/het, ij/ei, perfect vs imperfect, blunt vs soft particles. `note` explains the split.
- **mcq** — `prompt`, `options[]` (≥2), `correct` (**0-based index**, in range), `explain`. Exactly one right option. `explain` teaches, doesn't just confirm.
- **typed** — `prompt`, `answers[]` (≥1). List **every** acceptable spelling explicitly: contractions (`"'t is"` and `"het is"`), with/without article (`"maan"`, `"de maan"`), spacing variants. Optional `hint`, `explain`. Grading normalizes case/whitespace/terminal punctuation and is diacritic-tolerant, so `een`/`één` both pass — but still put the correct accented form **first** in `answers` (it's shown as the gentle correction).
- **dictation** — `speak` (Dutch to voice), `answers[]`. `prompt` optional (defaults nicely). Keep `speak` short enough to hold in memory (≤6 words early, longer later).
- **builder** — `slots[]`, each `{label, chips[]}` (**chips required and non-empty** — the schema needs chips even if you imagine free text). `sample` (a model full sentence). Optional `prompt`, `starters`. Great for V2/word-order practice: one slot per sentence position.
- **dialogue** — `scene` (English stage-setting line), `lines[]` each `{speaker, target, en, spotlight?}`. **`speaker` must be `"You"` or a name in the manifest cast** (Emma/Daan/Sanne/Bram) — anything else fails validation. `spotlight` flags a teachable moment on that line. 4–10 lines. Honor the arc timeline.
- **shadow** — `lines[]` each `{target, en}`. Listen→repeat. Optional `title`. 3–6 lines.
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

- **A1 (W1–4):** English scaffolding heavy. Short `target`. Explanations in English. Dialogues 3–5 lines, simple.
- **A2 (W5–8):** glosses shorten; dialogues lengthen; introduce past tenses; some `explain`/`spotlight` text starts appearing in easy Dutch.
- **B1 (W9–12):** dialogues run 6–10 lines; prompts increasingly in Dutch; comprehension questions in Dutch; journal prompts in Dutch. By W12 the learner is being asked to "blijf in het Nederlands."

## 7b. Difficulty ramp — Weeks 13–18 (season 2: B2 depth → C1 gateway)

Season 2 extends the ramp of §7. The learner is now a real B1: scaffolding thins,
and Dutch becomes the working language of the lesson itself. See
`docs/roadmap-dutch-nl.md` for the week outline.

- **Language of instruction:**
  - **B2 (W13–16):** prompts and explanations **mixed** — lead in Dutch, drop to a
    short English clause only for the genuinely new rule. `spotlight` text mostly in
    Dutch. Glosses still present but tighter.
  - **C1 gateway (W17–18):** **Dutch-first.** Prompts, `explain`, `spotlight` and card
    bodies in Dutch, with a brief **English safety net** only where a nuance would
    otherwise be lost. The learner should feel the language close over their head — on
    purpose, but never abandoned.
- **Dialogues:** **8–12 lines** (up from 6–10). Honor the season-2 arc and continuity
  rules in characters.md.
- **`durationMin`: `[20, 35]`** for all season-2 lessons.
- **Comprehension questions in Dutch** (both `q` and the `options`). **Journal prompts
  in Dutch**, `minSentences` **3 or more** (capstones 4+, the finale higher).
- **Register-switching drill (recurring pattern):** at least once a week, a block that
  takes the **same message and renders it two ways** — informal (*je*, particles) vs
  formal (*u*, nominalized, no contractions). Natural fits: a `contrast` block
  (left = informeel, right = formeel), an `mcq` ("which is the formal version?"), or a
  `builder` with a formal and an informal slot. This is the signature season-2 exercise.
- **Grammar accuracy, season-2 hotspots (get these right or a B2 learner gets corrected):**
  passive *worden* (action) vs *zijn* (state/result) + *door*-agent; pluperfect and the
  irreële word order (*als ik het had geweten, zou ik … hebben gedaan* — participle +
  *hebben/zijn* at the clause end); verb-final holding under **deep embedding**
  (subclause inside subclause); relative *waar* + preposition (*waarover, waarmee*);
  *er* stacking (*er zijn er twee die…*); reported-speech back-shift.
- **Block-count targets UNCHANGED.** The validator still warns outside **lesson 8–12,
  review 6–8, capstone 10–14** — stay inside. Depth comes from harder *content* per
  block, not more blocks.
- **New levels:** the `level` field takes **`B2`** (weeks 13–16) and **`C1`** (weeks
  17–18). Everything else in §5 (required fields, block traps, table-width rule,
  0-based `correct`, `speaker` in cast) is identical.

## 8. Output & handoff rules

- One file per day: `public/packs/dutch-nl/lessons/day-NN.json`, zero-padded, **strict JSON** (no comments, no trailing commas).
- Emoji: exactly one per lesson, topical (🔊 sounds, 🔢 numbers, 🍞 food, 🚂 travel, 🩺 health, 🕰 past, 💬 opinions, 🧩 grammar, 🎉 finale…). Pick distinct ones across a week.
- After writing a batch, it will be run through `node tools/validate.js public/packs/dutch-nl`. **Zero errors** is the merge gate; resolve warnings (block counts, table widths) too.
- Keep each lesson genuinely teachable and fun — you are the target user. Dogfood mentally: could a real beginner do this on a phone in 15–25 minutes?
