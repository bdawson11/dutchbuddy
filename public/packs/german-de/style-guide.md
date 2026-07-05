# GermanBuddy — Style Guide

*Authoring-time only. Not shipped. The fixed voice + format + schema contract for
every lesson JSON. Follow it exactly so machine validation (`tools/validate.js`)
passes on the first run and 84 days written in parallel read as one app.*

---

## 1. Voice

- **Germany Standard German (Hochdeutsch), northern-neutral — not Austrian, not Swiss.** Markers to lean on: *doch, mal, halt, genau, na ja, tja, Quatsch, alles klar, Moin, Feierabend, passt, Bock haben*. Never Austrian defaults (*Grüß Gott/Servus* as hello, *Jänner, Sackerl, Semmel, Erdapfel*) and never Swiss forms (*Grüezi*, and Switzerland's *ss* for *ß*). Regional color (Cologne pride, a Bavarian cameo at the finale) is enjoyed as flavor, never taught as the norm.
- **Warm, plain, a little funny.** You're a buddy, not a textbook. English explanations are short, concrete, occasionally wry. Never academic. German learning is famous for drowning people in tables — don't; teach one thing, then use it.
- **No anglicisms in the German.** Real idiomatic German, not English-shaped German. When German genuinely borrows English (it does — *cool, super, das Meeting, chillen*), use what a native actually says.
- **Encourage, never scold.** Wrong answers get a nudge and a retry, never a block. Cases especially: reassure, because the case system is where adults freeze.

## 2. English ↔ German formatting conventions

- **The target-language field is named `nl` in every block** (chips items, dialogue lines, shadow lines) — the engine hardcodes this key across all packs. Put the **German** text in `nl` even though it's German. English gloss goes in `en`. `speak` = the exact German to voice. (This is a fixed engine convention; do not rename it.)
- In `card`/`callout` **body** (markdown): German example words in *italics* (`*Brötchen*`), key rules or the "one new thing" in **bold**. Glosses in parentheses: `*Brötchen* (bread roll)`.
- In `chips`/`shadow`/`dialogue`: German goes in the `nl` field, English gloss in `en`. Do **not** repeat the translation inside `nl`.
- Em dashes for "word — gloss" inside table cells: `"Brötchen — bread roll"`.
- Keep English glosses tight — a word or short phrase, not a sentence.
- Only real markdown supported by the engine is `**bold**` and `*italic*`, plus tables via the `table` field. No headings, lists, links, or code in `body`.
- Always use proper *ä/ö/ü* and *ß* — never the *ae/oe/ue/ss* fallbacks. (Grading is diacritic-tolerant, so a learner may *type* *ss*/*ue* and still pass, but authored text uses the real characters.)

## 3. The "one new thing per block" rule

Each block introduces **one** teachable unit (one rule, one contrast, one drill target). Don't stack two grammar points in a single card. Difficulty ramps **within** a lesson: teach → recognise (mcq/chips) → produce (typed/builder) → use (dialogue/journal). This matters doubly for German cases — introduce a case with *one* article slot at a time.

## 4. Lesson shape by `kind`

Block-count targets (validator warns outside these — stay inside):

| kind | blocks | arc |
|------|--------|-----|
| `lesson` | **8–12** | 1–2 teaching cards → chips/contrast → mcq → typed/dictation → (dialogue or builder) → journal |
| `review` | **6–8** | light recap card → mixed drills pulling the week's targets → **immersion dialogue with the recurring cast** → comprehension → short journal |
| `capstone` | **10–14** | recap card → graded drills across the week → a builder or dialogue that *produces* → **the "Meine Geschichte" self-intro layer for that week** (builder or journal) → celebratory journal |

Every **review** day carries the recurring-cast story arc (see `characters.md`). Every **capstone** ends on the growing self-intro.

A normal `lesson` should include **at least 3 graded blocks** (mcq/typed/dictation/builder/comprehension) so a day is practice, not just reading. Aim for ≥1 `chips` or `shadow` (audio touch) per lesson.

## 5. Block authoring rules (schema + gotchas)

Top-level lesson fields (all required): `schemaVersion` (always `1`), `id` (`"day-NN"`, zero-padded), `day` (int, matches id), `module` (`"MNN"`, matches the manifest week), `unit`, `kind`, `title` (German, evocative), `emoji` (one, topical), `level` (`A1`/`A2`/`B1`), `durationMin` (`[15,25]` typical), `summary` (one English line), `blocks[]`.

`unit` convention: `"U"` + two digits; simplest is one unit per week (e.g. all of M05 = `"U05"`). Keep it consistent within a week.

Per block type — **required fields and the traps:**

- **card** — `title`, `body` (markdown). Optional `table` {`headers[]`, `rows[]`} — **every row array length must equal headers length** (validator fails otherwise). Optional `callout` (one punchy line). No audio.
- **chips** — `items[]`, each `{nl, en, speak?}`. `nl` = the German; set `speak` to the exact German to voice (usually = `nl`). Optional `title`. 4–8 items.
- **contrast** — `pairs[]`, each `{left, right, note?}`. Use for der/die/das, *nicht* vs *kein*, Akkusativ vs Dativ (*wohin* vs *wo*), Perfekt vs Präteritum, blunt vs soft particles. `note` explains the split.
- **mcq** — `prompt`, `options[]` (≥2), `correct` (**0-based index**, in range), `explain`. Exactly one right option. `explain` teaches, doesn't just confirm.
- **typed** — `prompt`, `answers[]` (≥1). List **every** acceptable spelling explicitly: article present/absent (*"Bruder"*, *"ein Bruder"*, *"einen Bruder"*), *ß*/*ss* and *ü*/*ue* variants if you want them shown, spacing. Grading normalizes case/whitespace/terminal punctuation and is diacritic-tolerant, so *ü*/*ue* and *ß*/*ss* both pass — but still put the correct form (real umlaut/ß) **first** in `answers` (it's shown as the gentle correction). Optional `hint`, `explain`.
- **dictation** — `speak` (German to voice), `answers[]`. `prompt` optional (defaults nicely). Keep `speak` short enough to hold in memory (≤6 words early, longer later).
- **builder** — `slots[]`, each `{label, chips[]}` (**chips required and non-empty**). `sample` (a model full sentence). Optional `prompt`, `starters`. Great for V2/word-order and case practice: one slot per sentence position, or one slot per case-marked article.
- **dialogue** — `scene` (English stage-setting line), `lines[]` each `{speaker, nl, en, spotlight?}`. **`speaker` must be `"You"` or a name in the manifest cast** (Lena/Jonas/Aylin/Klaus) — anything else fails validation. `nl` holds the German. `spotlight` flags a teachable moment on that line. 4–10 lines. Honor the arc timeline.
- **shadow** — `lines[]` each `{nl, en}`. Listen→repeat. Optional `title`. 3–6 lines.
- **comprehension** — `questions[]` each `{q, options[], correct}` (`correct` 0-based, in range). Use **after** a dialogue/passage in the same lesson.
- **journal** — `prompt`. Optional `starters[]` (German sentence openers), `minSentences`. Closes most lessons; free text, saved locally.

## 6. Grammar accuracy (non-negotiable)

- **Cases (the spine):** get article and pronoun case right, every time. Nominative for subjects and after *sein/werden/bleiben*; **accusative** for direct objects and after *für/ohne/gegen/um/durch*; **dative** for indirect objects, after *mit/nach/bei/seit/von/zu/aus*, and with dative verbs (*helfen, danken, gefallen, gehören*). The masculine article is the one that visibly moves: *der → den* (acc) *→ dem* (dat); *ein → einen → einem*; *kein → keinen → keinem*; *mein → meinen → meinem*. Feminine (*die/eine*) and neuter (*das/ein*) look the same in nom/acc — say so, don't overclaim. **Wechselpräpositionen** (*in/auf/an/unter/über/vor/hinter/neben/zwischen*): **Akkusativ for motion (wohin?)**, **Dativ for location (wo?)**.
- **V2 word order:** the finite verb is **second** in main clauses. In subclauses (*weil, dass, wenn, obwohl, während…*) the finite verb goes to the **end**. Model this correctly everywhere from W2 on — it's a structural spine. Time-manner-place order for the middle field (*Ich fahre morgen mit dem Zug nach Köln*).
- **Perfekt:** *haben* vs *sein* auxiliary (*sein* with motion/change verbs: *gehen, fahren, kommen, bleiben, sein, werden*). Participles: regular *ge-…-t* (*gemacht, gekauft*), strong *ge-…-en* (*gegangen, gesehen, getrunken*); no *ge-* on verbs in *-ieren* (*studiert, telefoniert*) or with inseparable prefixes (*verstanden, bekommen*). **Separable verbs** split the *ge-* inside: *aufstehen → aufgestanden*, *mitnehmen → mitgenommen*, *ankommen → angekommen*.
- **Präteritum:** the narrative/written past and the *spoken* past for *sein/haben* and modals: *war, hatte, konnte, wollte, musste, durfte, sollte*, plus strong forms *ging, kam, sah, gab*. Everyday spoken past for most other verbs is the Perfekt — teach the split (W7), don't mix them up.
- **Negation:** *kein* negates an indefinite/no-article noun (*ich habe keinen Bruder*, and *kein* itself takes the case — *keinen* here is accusative); *nicht* negates everything else (verbs, adjectives, definite nouns). *nicht* placement: late, but **before** a predicate adjective, a separable prefix, or an infinitive/participle (*Ich komme heute nicht*; *Der Kaffee ist nicht gut*).
- **Adjective endings:** **do not** put attributive endings on adjectives before B1 (W11) — A1/A2 uses **predicate** adjectives only (*der Kaffee ist gut*, never *~~ein guter Kaffee~~* in early weeks). When you do reach endings, get the gender/case/article-type agreement exactly right.
- **du vs Sie:** match the register to the scene — *du* among friends/the cast, *Sie* with strangers, officials, the Bäckerei counter in some contexts, and anyone older/formal. Keep verb forms and possessives consistent within a dialogue (*du hast / dein* vs *Sie haben / Ihr*).
- **Numbers:** reversed units — *einundzwanzig* (one-and-twenty), one word.
- All content **original** — no lifted CEFR wordlists, textbook dialogues, or copyrighted sentences. Invent your own examples in the cast's world (Lena's Berlin Kiez, Klaus's Cologne, Aylin's move to Munich).

## 7. Difficulty ramp across the 84 days

- **A1 (W1–4):** English scaffolding heavy. Short `nl`. Explanations in English. Dialogues 3–5 lines, simple. Cases limited to nom + acc.
- **A2 (W5–8):** glosses shorten; dialogues lengthen; introduce Perfekt then Präteritum; dative arrives; some `explain`/`spotlight` text starts appearing in easy German.
- **B1 (W9–12):** dialogues run 6–10 lines; prompts increasingly in German; comprehension questions in German; journal prompts in German; adjective endings and Konjunktiv II land. By W12 the learner is expected to hold a conversation and to keep their cases together in real time (day 74).

## 9. Difficulty ramp across the season-2 days (Weeks 13–18)

Season 2 raises the register with the learner. The engine is unchanged; only the density and the language of instruction climb. **Block-count targets are UNCHANGED** — stay inside `lesson` 8–12 / `review` 6–8 / `capstone` 10–14, and keep ≥3 graded blocks per lesson and ≥1 chips/shadow audio touch. All season-2 lessons use `level` `"B2"` (W13–16) or `"C1"` (W17–18); the validator does not restrict the value, but keep it accurate to the manifest.

- **The German-first ramp:**
  - **B2 (W13–16) — mixed:** card `body` stays bilingual (German examples, English for the *one hard rule*), but `prompt`, `explain`, `spotlight`, comprehension `q`, and `journal.prompt` are **increasingly German**, with a short English safety net only where a concept genuinely needs it (e.g. the first framing of Konjunktiv I, the *von/durch* split). Glosses stay tight.
  - **C1 gateway (W17–18) — German-first:** prompts, explains, comprehension, and journals run **in German by default**, English kept as a *safety net* — a bracketed gloss on a genuinely new term (a legal/Amt word, an idiom), not a full translation. The learner is being weaned; do not baby them, but never strand them.
  - `chips`/`dialogue`/`shadow` still always carry an English `en` gloss (engine convention) — that stays. "German-first" refers to instructional prose, not the gloss field.
- **durationMin:** `[20, 35]` for season-2 lessons (heavier reading, longer dialogues, denser drills). Capstones may sit at the top of that range.
- **Dialogues:** **8–12 lines** (up from 6–10). Reported-speech, interview, and negotiation scenes run long; keep them inside 12. Honor the season-2 arc timeline and Sie/du register per character (Mareike = Sie until she offers the Du; the cast = du).
- **Comprehension & journal prompts in German.** Comprehension `q` and options in German (a bracketed English gloss allowed on one hard term). `journal.prompt` in German with German `starters[]`; keep `minSentences` honest to a B2/C1 task (4–6).
- **Register-switching as a recurring pattern.** Make **du-Mail vs Sie-Mail** (and du-intro vs Sie-intro) a repeated drill shape across W13–18, not a one-off: use `contrast` pairs (left = du/casual, right = Sie/formal) and `builder` slots that produce the *same* content in both registers. The W17 capstone (day 119) and the day-118 immersion make this explicit; seed it earlier (polite hedging in W13, formal E-Mail in W17). Keep verb forms and possessives internally consistent within each register (*du hast / dein* vs *Sie haben / Ihr*).
- **Grammar accuracy at depth (non-negotiable, extends §6):**
  - **Konjunktiv II:** short forms *wäre/hätte/könnte/müsste/wüsste/käme/ginge/bräuchte* vs the *würde*-periphrasis; past = *hätte/wäre* + Partizip II (*hätte gemacht, wäre gegangen*). Don't invent short forms for verbs that idiomatically take *würde*.
  - **Konjunktiv I:** *er habe/sei/komme/werde/könne*; when Konjunktiv I is identical to the indicative, it **escapes to Konjunktiv II** (*sie sagten, sie hätten*, not *~~sie haben~~*). Model the escape correctly; teach K I for recognition first.
  - **Passiv:** Vorgangspassiv *werden* + Partizip II (perfect = *ist… worden*, with bare *worden*, never *~~geworden~~*); Zustandspassiv *sein* + Partizip II. Agent *von* (doer) vs *durch* (means). *sein + zu* + Infinitiv = passive necessity/possibility.
  - **Participial attributes:** the participle takes the **normal adjective ending** for its gender/case/article-type (*die genannten Zahlen*, *ein zu lösendes Problem*); *zu* + Partizip I carries passive-necessity meaning. Always be able to unpack the attribute to a relative clause.
  - **Word formation:** keep prefix meanings honest (*ver-* often "away/wrong/completion", *zer-* "to pieces", *ent-* "removal/reversal"); nominal compounds take the gender of the **last** element (*die Arbeitszeit* ← *die Zeit*).
  - **Regional cameo:** any Austrian/Bavarian form (Vroni's *Jänner/Sackerl/Servus*) is **flagged as regional every time** and glossed against the Hochdeutsch norm; never the answer key.

## 8. Output & handoff rules

- One file per day: `public/packs/german-de/lessons/day-NN.json`, zero-padded, **strict JSON** (no comments, no trailing commas).
- Emoji: exactly one per lesson, topical (🔊 sounds, 🔢 numbers, 🍞 food, 🚆 travel, 🩺 health, 🕰 past, 💬 opinions, 🧩 grammar/cases, 🎉 finale…). Pick distinct ones across a week.
- After writing a batch, run `node tools/validate.js public/packs/german-de`. **Zero errors** is the merge gate; resolve warnings (block counts, table widths) too.
- Keep each lesson genuinely teachable and fun — you are the target user. Dogfood mentally: could a real beginner do this on a phone in 15–25 minutes without drowning in a case table?
