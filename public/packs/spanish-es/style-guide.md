# SpanishBuddy — Style Guide

*Authoring-time only. Not shipped. The fixed voice + format + schema contract for
every lesson JSON. Follow it exactly so machine validation (`tools/validate.js`)
passes on the first run and 84 days written in parallel read as one app.*

**Schema note that never changes:** the target-language text field is called `nl` in
**every** block (chips items, dialogue lines, shadow lines) even though this pack is
Spanish — the engine hardcodes the key. Put Spanish in `nl`, English gloss in `en`,
and the exact Spanish to voice in `speak`.

---

## 1. Voice

- **Spanish of Spain (Castilian), not Latin American.** Markers to lean on: *vale, tío/tía, guay, venga, pues nada, o sea, en plan, majo/maja, mola, qué va, hombre, hala.* Use **vosotros** for informal plural everywhere (never *ustedes* for a group of friends). Use **distinción** in the sound teaching (c/z = the "th" /θ/). Avoid Latin-Americanisms: no *ustedes*-for-friends, no *ahorita*, no *acá/allá* by default, no *¿mande?*, no *chido/padre* (use *guay/mola*), no *carro* (use *coche*), no *jugo* (use *zumo*), no *manejar* (use *conducir*).
- **Warm, plain, a little funny.** You're a buddy, not a textbook. English explanations are short, concrete, occasionally wry. Never academic.
- **No anglicisms in the Spanish.** Real idiomatic Castilian, not English-shaped Spanish. Where Spain genuinely borrows English (*el móvil* is Spain, *el celular* is not; *flipar, el finde*), use what a native in Madrid actually says.
- **Encourage, never scold.** Wrong answers get a nudge and a retry, never a block.

## 2. English ↔ Spanish formatting conventions

- In `card`/`callout` **body** (markdown): Spanish example words in *italics* (`*hola*`), key rules or the "one new thing" in **bold**. Glosses in parentheses: `*hola* (hello)`.
- In `chips`/`shadow`/`dialogue`: Spanish goes in the `nl` field (yes, `nl` — see the schema note), English gloss in `en`. Do **not** repeat the translation inside `nl`.
- Em dashes for "word — gloss" inside table cells: `"hola — hello"`.
- Keep English glosses tight — a word or short phrase, not a sentence.
- Only real markdown supported by the engine is `**bold**` and `*italic*`, plus tables via the `table` field. No headings, lists, links, or code in `body`.
- **Inverted opening punctuation is mandatory:** every question is `¿…?` and every exclamation `¡…!`. A bare `?`/`!` with no opener is an error a Spanish reader notices instantly.

## 3. The "one new thing per block" rule

Each block introduces **one** teachable unit (one rule, one contrast, one drill target). Don't stack two grammar points in a single card. Difficulty ramps **within** a lesson: teach → recognise (mcq/chips) → produce (typed/builder) → use (dialogue/journal).

## 4. Lesson shape by `kind`

Block-count targets (validator warns outside these — stay inside):

| kind | blocks | arc |
|------|--------|-----|
| `lesson` | **8–12** | 1–2 teaching cards → chips/contrast → mcq → typed/dictation → (dialogue or builder) → journal |
| `review` | **6–8** | light recap card → mixed drills pulling the week's targets → **immersion dialogue with the recurring cast** → comprehension → short journal |
| `capstone` | **10–14** | recap card → graded drills across the week → a builder or dialogue that *produces* → **the "Mi historia" self-intro layer for that week** (builder or journal) → celebratory journal |

Every **review** day carries the recurring-cast story arc (see characters.md). Every **capstone** ends on the growing self-intro ("Mi historia").

A normal `lesson` should include **at least 3 graded blocks** (mcq/typed/dictation/builder/comprehension) so a day is practice, not just reading. Aim for ≥1 `chips` or `shadow` (audio touch) per lesson.

## 5. Block authoring rules (schema + gotchas)

Top-level lesson fields (all required): `schemaVersion` (always `1`), `id` (`"day-NN"`, zero-padded), `day` (int, matches id), `module` (`"MNN"`, matches the manifest week), `unit`, `kind`, `title` (Spanish, evocative), `emoji` (one, topical), `level` (`A1`/`A2`/`B1`), `durationMin` (`[15,25]` typical), `summary` (one English line), `blocks[]`.

`unit` convention: `"U"` + two digits; simplest is one unit per week (e.g. all of M05 = `"U05"`). Keep it consistent within a week.

Per block type — **required fields and the traps:**

- **card** — `title`, `body` (markdown). Optional `table` {`headers[]`, `rows[]`} — **every row array length must equal headers length** (validator fails otherwise). Optional `callout` (one punchy line). No audio.
- **chips** — `items[]`, each `{nl, en, speak?}`. `nl` = the Spanish, `en` = gloss, `speak` = exact Spanish to voice (usually = `nl`). Optional `title`. 4–8 items.
- **contrast** — `pairs[]`, each `{left, right, note?}`. Use for ser/estar, c/z vs s, perfecto vs indefinido, tú vs usted. `note` explains the split.
- **mcq** — `prompt`, `options[]` (≥2), `correct` (**0-based index**, in range), `explain`. Exactly one right option. `explain` teaches, doesn't just confirm.
- **typed** — `prompt`, `answers[]` (≥1). List **every** acceptable spelling explicitly: with/without article (`"casa"`, `"la casa"`), contractions, spacing variants. Grading normalizes case/whitespace/terminal punctuation and is diacritic-tolerant, so a missing accent still passes — but **put the correctly accented form first** in `answers` (it's shown as the gentle correction). Accents are meaningful: always author them right.
- **dictation** — `speak` (Spanish to voice), `answers[]`. `prompt` optional. Keep `speak` short enough to hold in memory (≤6 words early, longer later). Author the answer with correct `¿?`/`¡!` and accents.
- **builder** — `slots[]`, each `{label, chips[]}` (**chips required and non-empty**). `sample` (a model full sentence). Optional `prompt`, `starters`. Great for word-order / clitic / ser-vs-estar practice: one slot per sentence position.
- **dialogue** — `scene` (English stage-setting line), `lines[]` each `{speaker, nl, en, spotlight?}`. **`speaker` must be `"You"` or a name in the manifest cast** (Lucía/Rafa/Sofía/Nacho) — anything else fails validation. `spotlight` flags a teachable moment. 4–10 lines. Honor the arc timeline.
- **shadow** — `lines[]` each `{nl, en}`. Listen→repeat. Optional `title`. 3–6 lines.
- **comprehension** — `questions[]` each `{q, options[], correct}` (`correct` 0-based, in range). Use **after** a dialogue/passage in the same lesson.
- **journal** — `prompt`. Optional `starters[]` (Spanish sentence openers), `minSentences`. Closes most lessons; free text, saved locally.

## 6. Grammar accuracy (non-negotiable)

- **ser vs estar:** *ser* = identity, origin, defining traits, time/events, material, possession (*soy de Madrid, es profesor, es alto, son las tres*). *estar* = location, temporary states, results, feelings, the progressive (*está en casa, estoy cansado, está roto, estoy contento*). Get every one right — this is the pack's first conceptual wall. Watch the meaning-shifters: *es aburrido* (is boring) vs *está aburrido* (is bored); *es listo* (is clever) vs *está listo* (is ready).
- **Past-tense choice (the Spain rule):**
  - **pretérito perfecto compuesto** (*he comido*) for recent past tied to the present time-frame: **hoy, esta mañana, esta semana, este mes/año, ya, todavía no, alguna vez, nunca** (in "up to now" sense). This is Spain's everyday recent past — use it, don't reach for the indefinido.
  - **pretérito indefinido** (*comí*) for completed events with a finished time frame: **ayer, anteayer, el lunes, la semana pasada, en 2019, hace dos años**.
  - **imperfecto** (*comía*) for description, habit, background, ongoing past, age/time/weather in the past (*cuando era pequeño, llovía, eran las tres*).
  - Never write *comí hoy* — in Spain that's *he comido hoy*. Never write *he comido ayer* — that's *comí ayer*.
- **Gender & number agreement:** every article, adjective, and participle agrees with its noun in gender and number (*una casa blanca, los coches rojos, las manos frías*). Watch the traps: *el problema, el día, el mapa, el idioma* (masculine despite -a); *la mano, la foto, la radio* (feminine despite -o).
- **gustar-type constructions:** the thing liked is the subject, the person is an indirect object: *me gusta el café* (sing.), *me gustan los libros* (plur.), *me gustas tú*. Same frame for *encantar, doler, parecer, interesar, quedar* (*me duele la cabeza, me duelen los pies*). Never *yo gusto el café*.
- **vosotros everywhere plurals go informal:** conjugation tables and any informal plural address use *vosotros/vosotras* (*¿vosotros tenéis hambre?, venid, sois*). Reserve *ustedes* for genuinely formal plural (rare in Spain). Imperative plural informal is *-ad/-ed/-id* (*hablad, comed, venid*).
- **Inverted punctuation:** open every question with `¿` and every exclamation with `¡`. Mid-sentence too (*Hola, ¿qué tal?*).
- **Accents are meaningful — author them:** *está* (is) vs *esta* (this); *sí* (yes) vs *si* (if); *tú* (you) vs *tu* (your); *él* (he) vs *el* (the); *más* (more) vs *mas* (but); *sé* (I know) vs *se*; *qué/quién/dónde/cómo* (interrogative) carry accents. Stress rules: words ending in vowel/n/s stress the second-to-last syllable, else the last, and the *tilde* marks every exception.
- All content **original** — no lifted CEFR wordlists, textbook dialogues, or copyrighted sentences. Invent your own examples in the cast's world.

## 7. Difficulty ramp across the 84 days

- **A1 (W1–4):** English scaffolding heavy. Short `nl`. Explanations in English. Dialogues 3–5 lines, simple present, ser/estar/tener/gustar.
- **A2 (W5–8):** glosses shorten; dialogues lengthen; introduce the perfecto then indefinido/imperfecto; some `explain`/`spotlight` text starts appearing in easy Spanish.
- **B1 (W9–12):** dialogues run 6–10 lines; the subjunctive saturates; prompts increasingly in Spanish; comprehension questions in Spanish; journal prompts in Spanish. By W11 the learner calibrates tú/usted/vosotros consciously.

## 8. Output & handoff rules

- One file per day: `public/packs/spanish-es/lessons/day-NN.json`, zero-padded, **strict JSON** (no comments, no trailing commas).
- Emoji: exactly one per lesson, topical (🔊 sounds, 🔢 numbers, 🍽 food, 🍷 bar/tapas, 🚆 travel, 🩺 health, 🕰 past, 💬 opinions, 🧩 grammar, 🎉 finale…). Pick distinct ones across a week.
- After writing a batch, run `node tools/validate.js public/packs/spanish-es`. **Zero errors** is the merge gate; resolve warnings (block counts, table widths) too.
- Keep each lesson genuinely teachable and fun — you are the target user. Dogfood mentally: could a real beginner do this on a phone in 15–25 minutes?
