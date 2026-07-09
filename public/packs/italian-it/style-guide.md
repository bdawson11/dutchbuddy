# ItalianBuddy — Style Guide

*Authoring-time only. Not shipped. The fixed voice + format + schema contract for every lesson JSON.
Follow it exactly so machine validation (`tools/validate.js`) passes on the first run and 84 days
written in parallel read as one app.*

> **Schema note:** the target-language text field is named **`target`** in ALL blocks
> (chips items, dialogue lines, shadow lines). Put the **Italian** in
> `target` and the English gloss in `en`. `speak` = the exact Italian to voice. (Schema v1 packs
> named this field `nl`; the engine reads `target ?? nl` for back-compat, but v2 content uses `target`.)

---

## 1. Voice

- **Standard Italian, national/TV standard — not a regional dialect.** Neutral, everywhere-understood
  Italian. Markers to lean on: *allora, dai, boh, magari, insomma, va bene / vabbè, guarda, senti,
  cioè, comunque.* Stay **aware of regional variety** (a northern *brioche* vs a southern *cornetto*,
  *anguria/cocomero*) and flag it as colour — never teach a dialect form (*je* [nap.], *mona* [ven.])
  as the target.
- **Warm, plain, a little funny.** You're a buddy, not a textbook. English explanations are short,
  concrete, occasionally wry. Never academic.
- **No anglicisms in the Italian.** Real idiomatic Italian, not English-shaped Italian. When Italian
  genuinely borrows (*computer, weekend, ok*), use what a native actually says (but prefer *fine
  settimana* where a native would).
- **Encourage, never scold.** Wrong answers get a nudge and a retry, never a block.

## 2. English ↔ Italian formatting conventions

- In `card`/`callout` **body** (markdown): Italian example words in *italics* (`*caffè*`), key rules or
  the "one new thing" in **bold**. Glosses in parentheses: `*caffè* (coffee)`.
- In `chips`/`shadow`/`dialogue`: Italian goes in the `target` field (see the note above),
  English gloss in `en`. Do **not** repeat the translation inside `target`.
- Em dashes for "word — gloss" inside table cells: `"caffè — coffee"`.
- Keep English glosses tight — a word or short phrase, not a sentence.
- Only real markdown supported by the engine is `**bold**` and `*italic*`, plus tables via the `table`
  field. No headings, lists, links, or code in `body`.

## 3. The "one new thing per block" rule

Each block introduces **one** teachable unit (one rule, one contrast, one drill target). Don't stack
two grammar points in a single card. Difficulty ramps **within** a lesson: teach → recognise
(mcq/chips) → produce (typed/builder) → use (dialogue/journal).

## 4. Lesson shape by `kind`

Block-count targets (validator warns outside these — stay inside):

| kind | blocks | arc |
|------|--------|-----|
| `lesson` | **8–12** | 1–2 teaching cards → chips/contrast → mcq → typed/dictation → (dialogue or builder) → journal |
| `review` | **6–8** | light recap card → mixed drills pulling the week's targets → **immersion dialogue with the recurring cast** → comprehension → short journal |
| `capstone` | **10–14** | recap card → graded drills across the week → a builder or dialogue that *produces* → **the "il mio racconto" self-intro layer for that week** (builder or journal) → celebratory journal |

Every **review** day carries the recurring-cast story arc (see `characters.md`). Every **capstone**
ends on the growing self-intro.

A normal `lesson` should include **at least 3 graded blocks** (mcq/typed/dictation/builder/comprehension)
so a day is practice, not just reading. Aim for **≥1 `chips` or `shadow` (audio touch)** per lesson.

## 5. Block authoring rules (schema + gotchas)

Top-level lesson fields (all required): `schemaVersion` (always `2`), `id` (`"day-NN"`, zero-padded),
`day` (int, matches id), `module` (`"MNN"`, matches the manifest week), `unit`, `kind`, `title`
(Italian, evocative), `emoji` (one, topical), `level` (`A1`/`A2`/`B1`), `durationMin` (`[15,25]`
typical), `summary` (one English line), `blocks[]`.

`unit` convention: `"U"` + two digits; simplest is one unit per week (all of M05 = `"U05"`). Keep it
consistent within a week.

Per block type — **required fields and the traps:**

- **card** — `title`, `body` (markdown). Optional `table` {`headers[]`, `rows[]`} — **every row array
  length must equal headers length** (validator fails otherwise). Optional `callout` (one punchy line).
  No audio.
- **chips** — `items[]`, each `{target, en, speak?}`. Set `speak` to the exact Italian to voice (usually =
  `target`). Optional `title`. 4–8 items.
- **contrast** — `pairs[]`, each `{left, right, note?}`. Use for il/lo/la, *ci* vs *ne*, passato
  prossimo vs imperfetto, tu vs Lei, blunt vs soft *paroline*. `note` explains the split.
- **mcq** — `prompt`, `options[]` (≥2), `correct` (**0-based index**, in range), `explain`. Exactly one
  right option. `explain` teaches, doesn't just confirm.
- **typed** — `prompt`, `answers[]` (≥1). List **every** acceptable spelling explicitly: with/without
  subject pronoun (`"sono di Boston"`, `"io sono di Boston"`), with/without article, elision variants
  (`"un po'"`, `"un po"`), apostrophe forms (`"c'è"`). Grading normalizes case/whitespace/terminal
  punctuation and is accent-tolerant, so `e`/`è` and `caffe`/`caffè` both pass — but still put the
  correct accented form **first** in `answers` (it's shown as the gentle correction).
- **dictation** — `speak` (Italian to voice), `answers[]`. `prompt` optional. Keep `speak` short enough
  to hold in memory (≤6 words early, longer later). Avoid stress-minimal pairs in dictation (TTS can't
  disambiguate *àncora/ancòra*, *pèsca/pésca*) — drill those in a `card`/`contrast` instead.
- **builder** — `slots[]`, each `{label, chips[]}` (**chips required and non-empty**). `sample` (a model
  full sentence). Optional `prompt`, `starters`. Great for agreement and clitic-placement practice: one
  slot per sentence position.
- **dialogue** — `scene` (English stage-setting line), `lines[]` each `{speaker, target, en, spotlight?}`.
  **`speaker` must be `"You"` or a name in the manifest cast** (Giulia / Marco / Sofia / Pietro) —
  anything else fails validation. `spotlight` flags a teachable moment on that line. 4–10 lines. Honor
  the arc timeline in `characters.md`.
- **shadow** — `lines[]` each `{target, en}`. Listen→repeat. Optional `title`. 3–6 lines.
- **comprehension** — `questions[]` each `{q, options[], correct}` (`correct` 0-based, in range). Use
  **after** a dialogue/passage in the same lesson.
- **journal** — `prompt`. Optional `starters[]` (Italian sentence openers), `minSentences`. Closes most
  lessons; free text, saved locally.

## 6. Grammar accuracy (non-negotiable)

Italian's spine is agreement + auxiliary choice + the past-tense split + clitics/register. Get these
right everywhere:

- **Gender & number agreement.** Nouns are m/f; **articles and adjectives must agree** in gender and
  number: *il libro rosso / i libri rossi*, *la casa bianca / le case bianche*. Adjectives in **-o**
  have four forms (-o/-a/-i/-e); adjectives in **-e** have two (-e/-i). Nouns in **-e** can be either
  gender — learn the gender with the noun.
- **The article system.** *il* (default masc.), **`lo`** before *s+consonant, z, gn, ps, x, y* and
  *sc/sci* (*lo studente, lo zaino, lo gnomo*), *la* (fem.); plurals *i / gli / le* (*gli studenti, gli
  amici*). Elision: *l'amico, l'amica, un'amica* (feminine indefinite takes the apostrophe; masculine
  *un amico* does not). Get *lo/gli* right — it's the commonest beginner error.
- **`essere` vs `avere` in the passato prossimo.** Motion/change-of-state and reflexive verbs take
  **`essere`** (*sono andato, si è alzata*); most transitives take **`avere`** (*ho mangiato*). Some
  verbs take both with a meaning shift (*ho finito il libro* vs *il film è finito*).
- **Participle agreement.** With **`essere`**, the participle agrees with the **subject** (*Sofia è
  andat**a***, *loro sono partit**i***). With **`avere`** it normally does **not** agree — **except**
  with a preceding direct-object clitic *lo/la/li/le* (*le mele? Le ho comprat**e***; *l'ho vist**a***).
  Never write *sono andato* for a woman or *le ho comprato*.
- **Passato prossimo vs imperfetto.** Passato prossimo = a completed event, something that *happened*
  (*ieri ho visto Marco*). Imperfetto = description, habit, background, ongoing state (*da bambino
  giocavo…*, *faceva freddo*, *mentre mangiavo…*). Model the split correctly from W5 on; W7 is the hinge.
- **Clitic placement.** Object clitics go **before a finite verb** (*lo vedo*, *ti chiamo*, *ci penso*,
  *ne ho due*) but **attach to the end** of an infinitive, gerund, or informal imperative (*voglio
  vederlo*, *chiamandolo*, *dammi!*). Combined clitics: indirect + direct, with *mi/ti/ci/vi → me/te/ce/ve*
  and *gli/le/Le → glie-* fused (*me lo dai?*, *glielo dico*). *ci + ne → ce ne* (*ce n'è uno*).
- **The `piacere` trap.** *piacere* agrees with the **thing liked**, not the liker: *mi piac**e** il
  caffè* / *mi piacci**ono** i libri*. The person is the indirect object (*a me / mi*, *a Marco / gli*).
- **Formal `Lei` vs informal `tu`.** *tu* = friends, peers, kids. **`Lei`** (3rd-person singular,
  capitalised in careful writing) = strangers, shopkeepers you don't know, formal/older/professional
  contexts (*Lei come sta?* vs *tu come stai?*). *voi* is the normal plural for both. Match the register
  to the scene and never mix *tu* and *Lei* to the same person in one exchange.
- **Subject-drop (pro-drop).** The verb ending carries the person, so drop the subject pronoun by
  default (*parlo italiano*, not *io parlo italiano*) — use the pronoun only for **contrast/emphasis**
  (*io lavoro, tu dormi!*).
- **Numbers.** Written as one word, with vowel-drop at the tens join: *ventuno, ventotto, trentatré*
  (note the accent on *-tré*).
- All content **original** — no lifted CEFR wordlists, textbook dialogues, or copyrighted sentences.
  Invent your own examples in the cast's world (Bologna, Naples, Milano, il bar, l'aperitivo).

## 7. Difficulty ramp across the 84 days

- **A1 (W1–4):** English scaffolding heavy. Short `target`. Explanations in English. Dialogues 3–5 lines,
  simple present.
- **A2 (W5–8):** glosses shorten; dialogues lengthen; past tenses come in; some `explain`/`spotlight`
  text starts appearing in easy Italian.
- **B1 (W9–12):** dialogues run 6–10 lines; prompts increasingly in Italian; comprehension questions in
  Italian; journal prompts in Italian. By W12 the learner is producing the congiuntivo without flinching.

## 9. Difficulty ramp — Weeks 13–18 (Season 2: B2 Depth → C1 Gateway)

The Season-2 arc keeps every schema and count rule from §§4–8 unchanged — it only **raises the water
level of Italian** in the framing. Nothing here overrides the block-count targets or the `target`-key rule.

- **B2 (W13–16) — mixed, tilting Italian.** `explain`, `spotlight`, `prompt`, and `hint` are written in
  **easy Italian first with a short English safety net** where a rule is genuinely new; comprehension
  questions (`q`) and **journal `prompt`s in Italian**. Keep `en` glosses on every `target`/dialogue line as
  always (the target text lives in `target`, English gloss in `en` — never drop it). English never disappears;
  it just stops carrying the explanation.
- **C1 Gateway (W17–18) — Italian-first with an English safety net.** Instructions and explanations lead
  in Italian; keep **one short English clause** as a net on anything load-bearing (a new nuance, an ironic
  reading, a regional note). Still gloss every dialogue/`chips` line in `en`. Be honest in tone: this is
  *preparing the leap to C1*, not certifying it — say so where the finale invites it.
- **Dialogues run 8–12 lines** in Season 2 (up from 6–10). Still ≤ the schema's practical ceiling; keep
  each line short enough to reveal-and-repeat on a phone. Honor the arc timeline in `characters.md`
  (Sofia in Milano; Elena only from W15; the day-111 pivot).
- **`durationMin` moves to `[20, 35]`** for Season-2 days (denser reading, longer dialogues).
- **Register-switching as a recurring pattern.** Make "the same message, *tu* vs *Lei*" a repeated device
  — best as a `contrast` block (left = *tu*/casual, right = *Lei*/formal, `note` explains the shift) or as
  a two-slot `builder` producing both versions. Use it in W15 (formal email, sportello), W17 (tone/register
  capstone), and sprinkle it into review days. It's the season's signature drill.
- **Block-count targets are UNCHANGED.** Stay inside lesson **8–12**, review **6–8**, capstone **10–14**.
  Density rises *within* blocks (longer dialogues, Italian-first prompts, layered-tense builders), not by
  adding blocks. A B2/C1 `lesson` should still carry **≥3 graded blocks** and **≥1 audio touch**
  (`chips`/`shadow`).
- **Grammar still non-negotiable (§6 applies harder).** Concordanza dei tempi must be correct in every
  congiuntivo subordinate; periodo ipotetico type III is *cong. trapassato + condizionale passato*
  (*se avessi saputo, sarei venuto*) — never mix the types; participle agreement holds under clitics and
  *essere*; the **passato remoto is recognition-only** (present it in `card`/`comprehension`/`dialogue`
  reading, never ask the learner to *produce* it in a `typed`/`builder`).
- **TTS caution still holds.** Keep the §5/§8 rule: no stress-minimal pairs in `dictation` (TTS can't
  disambiguate *àncora/ancòra*, *pèsca/pésca*, or *capìta/càpita*) — drill those in a `card`/`contrast`.
  Also avoid dictating a bare *passato remoto* form the learner isn't meant to produce.

## 8. Output & handoff rules

- One file per day: `public/packs/italian-it/lessons/day-NN.json`, zero-padded, **strict JSON** (no
  comments, no trailing commas).
- Emoji: exactly one per lesson, topical (🔊 sounds, 🔢 numbers, ☕ bar, 🍝 food, 🚆 travel, 🩺 health,
  🕰 past, 💬 opinions, 🧩 grammar, 🎉 finale…). Pick distinct ones across a week.
- After writing a batch, run `node tools/validate.js public/packs/italian-it`. **Zero errors** is the
  merge gate; resolve warnings (block counts, table widths) too.
- Keep each lesson genuinely teachable and fun — dogfood mentally: could a real beginner do this on a
  phone in 15–25 minutes?
