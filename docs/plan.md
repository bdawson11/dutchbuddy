# LanguageBuddy — Plan Document

Engine + content-pack architecture for a conversational language-learning app. First pack: **DutchBuddy** (Netherlands Dutch, A1 → B1, 84 days). Reference implementation: SpanishBuddy (spanishbuddy.app), used as a structural spec only — its content-in-code architecture is explicitly rejected.

**Audience for this doc:** Claude Design (sections 1, 2, 6) and the build process (all sections). It is also the seed of the future skill (section 5).

---

## 1. Architecture

Hard split between a language-agnostic **engine** and per-language **content packs**.

```
/engine                     # reusable, never contains language content
  /player                   # renders a lesson from JSON
  /components               # one component per exercise block type
  /dashboard                # renders curriculum map from manifest
  /progress                 # localStorage layer
  /audio                    # speech abstraction
/packs
  /dutch-nl                 # DutchBuddy content pack (pure data)
    manifest.json
    /lessons
      day-01.json … day-84.json
    characters.md           # authoring-time character bible (not shipped)
    style-guide.md          # authoring-time style guide (not shipped)
/tools
  validate.js               # schema validator CLI, run in CI on every pack
```

### Engine principles
- **Static SPA**, no backend, no signup. Vanilla JS or lightweight React (final call at build time; React recommended if Claude Design produces component-based output).
- The dashboard, week accordions, day cards, progress stats, and lesson pages are **all generated from data**. Zero hand-written per-lesson markup.
- **Progress in localStorage**, keyed by `packId` so multiple language packs coexist on one device: `progress.<packId>` → `{ days: { "day-01": { status, steps, timeSec, completedAt } }, streak, lastActive }`.
- **Audio abstraction**: a single `speak(text, opts)` interface. v1 implementation = Web Speech API using `manifest.locale` (`nl-NL`) for voice selection. v1.5 quality pass: voices are quality-scored per locale (exact-region identity first, natural engines over robotic ones, `manifest.audio.preferredVoices` hints), with a learner-facing 🎙 voice picker in the player that previews the pack's `manifest.audio.sample` line and persists a pick per language. v2 (studio clips) is implemented: packs that ship `audio/index.json` (rendered offline with per-language neural TTS models — see `docs/tts-pipeline.md`) play pre-generated clips first, with Web Speech as the fallback for uncovered or dynamic lines; no content or component changes involved.
- **Trust touches** (public app): free/no-signup framing, "progress saves on this device only" disclosure, Reset all progress button, donation footer.

### Content pack principles
- Pure JSON conforming to versioned schemas (section 2). No executable content.
- All content original (Claude-generated) — no lifted CEFR wordlists, textbook dialogues, or copyrighted example sentences. Required for public release.
- Character bible and style guide live in the pack repo for authoring consistency but are not shipped.

### Validation (the scalability lynchpin)
`tools/validate.js` checks every lesson against the schema plus pack-level invariants:
- All 84 days present, ids sequential, module/unit codes match manifest
- Every block type is a known type; required fields per type present
- Every drill has ≥1 accepted answer; every MCQ has exactly one correct option
- Audio-bearing blocks have `speak` text (or file URL in v2)
- Character names appear only if defined in manifest cast list (catches drift)

CI gate: no pack deploys without a clean validation run. This validator is also the QA backbone of the skill — generated lesson batches are machine-checked before human review.

---

## 2. Schemas

### 2.1 Manifest schema (`manifest.json`)

```json
{
  "schemaVersion": 1,
  "packId": "dutch-nl-v1",
  "appName": "DutchBuddy",
  "tagline": "Nederlands, echt waar.",
  "language": "Dutch",
  "locale": "nl-NL",
  "dialect": {
    "identity": "Netherlands Dutch",
    "contrast": "Not Flemish",
    "markers": ["lekker", "gezellig", "hoor", "doe maar"]
  },
  "levels": [
    { "code": "A1", "title": "A1 Foundations", "weeks": [1, 4],
      "blurb": "Greet, introduce yourself, order coffee, describe your day." },
    { "code": "A2", "title": "A2 Building", "weeks": [5, 8],
      "blurb": "Tell stories in the past. Travel, health, everyday life." },
    { "code": "B1", "title": "B1 Threshold", "weeks": [9, 12],
      "blurb": "Opinions, hypotheticals, real conversations — and staying in Dutch." }
  ],
  "cast": [
    { "name": "Emma", "role": "Amsterdam marketer, main narrator" },
    { "name": "Daan", "role": "café friend, the learner's chisme partner" },
    { "name": "Sanne", "role": "moves Amsterdam → Utrecht mid-arc (W10)" },
    { "name": "Bram", "role": "Rotterdam architect, routine/immersion voice" }
  ],
  "weeks": [
    { "week": 1, "module": "M01", "days": ["day-01", "…", "day-07"] }
  ],
  "footer": {
    "donation": true,
    "storageDisclosure": "Progress is saved on this device only."
  }
}
```

### 2.2 Lesson schema (`day-NN.json`)

Top level:

```json
{
  "schemaVersion": 1,
  "id": "day-01",
  "day": 1,
  "module": "M01",
  "unit": "U01",
  "kind": "lesson",            // lesson | review | capstone
  "title": "Klanken van het Nederlands",
  "emoji": "🔊",
  "level": "A1",
  "durationMin": [15, 25],
  "summary": "The g, ui, ij and the long/short vowel system",
  "blocks": [ /* ordered array of typed blocks */ ]
}
```

`blocks[]` is a discriminated union on `type`. The **exercise taxonomy** — one engine component per type:

| type | Purpose | Key fields |
|---|---|---|
| `card` | Teaching content: rule, table, culture note | `title`, `body` (markdown), `table?`, `callout?` |
| `chips` | Tappable vocab/phrase chips with audio | `items[{nl, en, speak?}]` |
| `contrast` | Side-by-side pairs (e.g. de/het, perfect vs imperfect) | `pairs[{left, right, note}]` |
| `mcq` | Multiple choice | `prompt`, `options[]`, `correct`, `explain` |
| `typed` | Typed drill with fuzzy grading | `prompt`, `answers[]`, `hint?`, `explain?` |
| `builder` | Slot-fill sentence builder | `slots[{label, chips[]|freeText}]`, `sample`, `starters?` |
| `dialogue` | Scripted scene, line-by-line, tap-to-reveal + audio | `scene`, `lines[{speaker, nl, en, spotlight?}]` |
| `dictation` | Listen (TTS) → type what you hear | `speak`, `answers[]` |
| `shadow` | Listen → repeat, self-scored | `lines[{nl, en}]` |
| `comprehension` | Questions on a preceding dialogue/passage | `questions[{q, options[], correct}]` |
| `journal` | Free-text prompt, saved locally | `prompt`, `starters[]`, `minSentences?` |

**Grading rules for `typed`/`dictation`** (engine-level, configurable per pack):
- Normalize: trim, lowercase, collapse whitespace, strip terminal punctuation
- Accept any string in `answers[]` (write alternates explicitly: `"'t is"` vs `"het is"`)
- Diacritic-tolerant toggle (default **on** for Dutch: `een` vs `één` accepted, with a gentle correction note)
- Wrong answer → show `explain`, allow retry; never hard-block progress

Progress model: a "step" = one completed block; day completion = all blocks done; these feed the dashboard stats (days started, steps done, time logged, streak) exactly as the reference app displays.

---

## 3. DutchBuddy curriculum (12 weeks / 84 days)

Weekly rhythm mirrors the reference: **Weeks 1–2** = 6 teaching days + capstone; **Weeks 3–12** = 5 teaching days + 1 review/immersion day + 1 capstone. Every capstone ends with the growing self-intro ("mijn verhaal") that gains new grammar layers weekly. Immersion days carry the recurring-cast story arc.

The sequence below is designed from Dutch pedagogy, not mapped from Spanish. The three structural spines are: **V2 word order** (early, revisited constantly), **perfect tense as the everyday past** (mid, much earlier than Spanish's preterite), and **subordinate-clause verb-final order** (the A2→B1 gate).

### A1 Foundations — Weeks 1–4
*Greet, introduce yourself, order coffee, describe your day.*

**Week 1 — Sounds & first words**
1. Klanken I — long/short vowel system, the hard *g/ch*, *sch*
2. Klanken II — diphthongs (*ui, ij/ei, eu, oe, au/ou*), linking, first tongue-twisters
3. Greetings & the café — hoi/hallo/goedemorgen, first café scene, *alsjeblieft/dankjewel*
4. Pronouns + *zijn* — ik/jij/u/hij/zij/wij/jullie/zij; je vs u register intro
5. *hebben* + negation — niet vs geen (the placement rule)
6. de/het + plurals — article gender, -en/-s plural rules, why it matters for everything later
7. **Capstone** — first real self-intro + journal entry

**Week 2 — Numbers, time, and the V2 engine**
8. Numbers 0–100 — incl. the reversed tens (*vierentwintig*)
9. Big numbers, prices, euro amounts
10. Time, days, months — *half zes* = 5:30, the classic trap
11. Present tense + **V2 word order** — regular conjugation, verb-second as law
12. Questions & inversion — yes/no inversion, question words, talking about your day
13. *er is / er zijn* + deze/die/dit/dat — pointing at the world
14. **Capstone** — daily-routine production day

**Week 3 — People & places**
15. Family vocab + diminutive first contact (*-je* as warmth)
16. Adjectives + the *-e* inflection rule (tied back to de/het)
17. Possessives + showing photos
18. Your *buurt* — neighborhood vocab, Dutch address/city talk
19. Describing people — looks, personality, *aardig/gezellig/druk*
20. **Review + immersion** — meet **Emma** narrating her Amsterdam buurt
21. **Capstone** — family + buurt portrait

**Week 4 — Food & the modal politeness system**
22. Food vocab — broodje culture, avondeten structure, Dutch meal times
23. Ordering at the café & snackbar — *mag ik…, doe maar…, lekker*
24. **Modal verbs** — kunnen/willen/moeten/mogen (the politeness engine of Dutch)
25. Likes — *houden van, vinden, graag*; *lekker* as universal approval
26. Albert Heijn & the market — quantities, *hoeveelheden*, paying
27. **Review + immersion** — **Bram**'s routine and his favorite snackbar
28. **Capstone** — full-A1 production day: order, describe, introduce

### A2 Building — Weeks 5–8
*Tell stories in the past. Travel, health, everyday life.*

**Week 5 — The perfect tense (Dutch's everyday past)**
29. Perfect with *hebben* — ge-…-d/t participles, 't kofschip rule
30. Perfect with *zijn* — motion/change verbs, the hebben/zijn choice
31. Irregular participles — the top 15 (*gedaan, gezegd, geweest, gegaan…*)
32. **Separable verbs** — *opstaan, meenemen, aankomen* in present and perfect
33. Travel & OV — train, OV-pas, *overstappen*, platform announcements
34. **Review + immersion** — Emma's weekend trip to Texel (perfect-tense narrative)
35. **Capstone** — "wat heb je gedaan?" storytelling with Daan

**Week 6 — Health, feelings, advice**
36. Het lichaam — body vocab, *pijn* patterns (*ik heb hoofdpijn*)
37. Bij de huisarts — the Dutch GP system, appointment dialogue, *paracetamol* culture
38. Emergencies — key phrases, *help/bel 112*, pharmacy scene
39. Emotions — *blij/boos/moe/zenuwachtig*, *zich voelen* intro
40. Giving advice — *je moet, je kunt beter, zou moeten* (preview of zou)
41. **Review + immersion** — **Sanne**'s rough week (bike stolen, sick, huisarts)
42. **Capstone** — "wat is er gebeurd?" production day

**Week 7 — The other past: imperfectum & memories**
43. Imperfectum — -de/-te endings, 't kofschip again; *was/had/ging/kwam*
44. Perfect vs imperfectum — the usage split (events vs description/habit)
45. *Toen ik klein was* — childhood vocab, school memories
46. Describing places & weather in the past
47. *Vroeger vs nu* — habitual past, frequency adverbs (*altijd … nooit*)
48. **Review + immersion** — Bram's childhood in Rotterdam
49. **Capstone** — childhood portrait woven into the growing self-intro

**Week 8 — Future, opinions, and the subclause gate**
50. Future with *gaan* + infinitive — plans, time markers
51. *Zullen* — offers, promises, predictions; *zullen we…?*
52. Opinions — *ik vind dat, volgens mij, ik denk dat* + agreement ladder
53. **Subordinate clauses I** — *omdat, als, dat* and **verb-final order** (the A2→B1 gate module)
54. Comparatives & superlatives — *groter dan, het grootst*, irregulars
55. **Review + immersion** — Emma & Daan debate: must expats learn Dutch?
56. **Capstone** — "mijn komend jaar" production day

### B1 Threshold — Weeks 9–12
*Opinions, hypotheticals, real conversations — and staying in Dutch.*

**Week 9 — Complex sentences**
57. Subordinate clauses II — full conjunction set (*hoewel, terwijl, zodat, voordat*)
58. Relative clauses — *die/dat*, *waar + prep* (*waarover, waarmee*)
59. Indirect speech — *ze zei dat…*, question reporting with *of*
60. Conditional *zou* — polite requests, hypotheticals, advice
61. *Als*-sentences — real and hypothetical conditions
62. **Review + immersion** — Sanne's news: a job offer in Utrecht (reported speech arc)
63. **Capstone** — "het nieuws" chisme production day with Daan

**Week 10 — The er module & verb clusters**
64. **er I** — locative and existential (*er is, er staat*)
65. **er II** — quantitative (*ik heb er twee*) and prepositional (*erover, ervan*) — the module every Dutch learner fears; given two full days deliberately
66. Passive with *worden* — signs and news language (*hier wordt gewerkt*)
67. Reflexives — *zich voelen, zich vergissen*; *om … te* constructions
68. Two-verb word order — *ik wil morgen naar huis gaan*; verb clusters in subclauses
69. **Review + immersion** — Sanne took the job; moving-day conversation braiding all M10 grammar
70. **Capstone** — "mijn grote beslissing" letter + portrait

**Week 11 — Sounding Dutch**
71. Fixed verb-preposition pairs — *wachten op, denken aan, houden van* (15 core pairs)
72. **Particles** — *maar, even, toch, wel, eens, hoor* — the soul of spoken Dutch; blunt-vs-soft contrast pairs
73. Diminutives deep dive — *-je/-tje/-pje* formation + register shades (*biertje, momentje, kopje*)
74. **Blijf in het Nederlands** — the switch-to-English problem: phrases to hold the line (*mag ik het in het Nederlands proberen?*), strategy, confidence scripts. *No Spanish equivalent — a language-specific meta-module slot.*
75. u vs je mastery + politeness calibration by context
76. **Review + immersion** — Emma visits Sanne in Utrecht (Saturday catch-up braiding M11)
77. **Capstone** — "mijn catch-up" production day

**Week 12 — Street Dutch & the finale**
78. Imperatives — commands, *doe maar, kom op, let op*, softeners
79. Slang traffic-light — green (*lekker, gezellig, leuk, hoor*), yellow (*chill, vet, echt niet, balen*), red (disease-based cursing — flagged, explained, use-with-care)
80. Snackbar & borrel culture — ordering flow (*patatje oorlog, bittergarnituur*), rounds, *proost*
81. Bij de kapper / winkel — service scenes, small talk scripts
82. Idioms & spreekwoorden — 12 that don't translate (*nu komt de aap uit de mouw…*)
83. **Final immersion** — Emma, Daan & Sanne at a borrel, one year on: every M12 move braided
84. **Final capstone — Mijn verhaal** — 12-week recap, letter to your past self (one tense move per slot), definitive B1 self-intro, Dutch farewells, celebratory stats banner

---

## 4. Content generation & QA process

Content is authored in **weekly batches** (7 lessons per generation pass) against three fixed inputs:
1. **This curriculum outline** (scope per day is locked before writing)
2. **`style-guide.md`** — voice, en↔nl formatting, block-count targets per lesson kind (lesson ≈ 8–12 blocks, review ≈ 6–8, capstone ≈ 10–14), drill difficulty ramp, "one new thing per block" rule
3. **`characters.md`** — cast bios, arc timeline (Sanne's move = day 69), voice notes per character

Pipeline per batch: generate → `validate.js` (machine gate) → human spot-check (grammar accuracy, register, no anglicisms) → merge. Native-speaker review of at least the dialogues before public launch is strongly recommended — flagging this as an open dependency you'll need to source.

---

## 5. The skill (future-language workflow)

What gets extracted once DutchBuddy ships. The skill's job: produce a validated content pack for language X against the unchanged engine.

**Fixed by the skill (never regenerated):** engine, schemas, validator, weekly rhythm, session-type taxonomy, dashboard/stat mechanics, trust touches.

**Parameterized per language (the skill's questionnaire + generation steps):**
1. **Dialect identity** — which variant, contrasted against what ("Netherlands Dutch, not Flemish")
2. **Grammar spine** — the 2–4 structural hard parts that anchor sequencing (Dutch: V2, perfect-as-past, verb-final subclauses, er)
3. **Curriculum outline** — 84-day map designed from that spine (section 3 is the worked example and template)
4. **Cultural scene anchors** — the 6–8 recurring settings that drive vocab modules
5. **Cast + arc** — 4 characters, one mid-arc life event landing ~day 69
6. **Register/slang system** — traffic-light tiers with language-appropriate caution notes
7. **Meta-module slot** — one language-specific challenge module (Dutch: switch-to-English; other languages: tones, formality systems, script…)
8. **Locale/audio config** — TTS locale, voice availability check

Skill deliverables per run: curriculum doc → manifest → lesson batches (validated) → pack folder ready to drop into `/packs`.

---

## 6. Claude Design handoff

Inputs to provide:
- This doc (sections 1–2 especially)
- The lesson schema + **2–3 fully written sample lessons as fixtures** — including day-65 (er module) as the worst-case density fixture, and a review-day dialogue lesson
- Reference-app PDF for structural feel (dashboard grid, week accordions, day cards, stats banner) — *feel*, not clone

Design scope: dashboard, lesson player chrome, and the 11 block components. Constraints: mobile-first (lessons are 15–30 min phone sessions), no login UI, localStorage-only messaging, donation footer, light default theme with strong per-pack accent theming driven by manifest branding fields.

---

## 7. Build phases

1. **Engine core** — schemas finalized, validator, lesson player with all 11 block types (ugly but functional), dashboard from manifest, progress layer
2. **Content: Weeks 1–2** — first two batches through the full pipeline; dogfood daily (you're the target user)
3. **Design pass** — Claude Design against fixtures; integrate
4. **Content: Weeks 3–12** — remaining batches; native-speaker review of dialogues
5. **Public polish** — domain, donation link, share/OG cards, Vercel deploy
6. **Skill extraction** — package section 5 as a formal skill with templates and prompts

Open items you'll need to resolve along the way:
- Native-speaker reviewer for Dutch dialogues (before public launch)
- App name/domain (DutchBuddy assumed; naming affects manifest + branding)
- React vs vanilla decision at Phase 1 kickoff

---

## 8. Sample fixture — `day-01.json` (abridged)

```json
{
  "schemaVersion": 1,
  "id": "day-01",
  "day": 1,
  "module": "M01",
  "unit": "U01",
  "kind": "lesson",
  "title": "Klanken van het Nederlands",
  "emoji": "🔊",
  "level": "A1",
  "durationMin": [15, 25],
  "summary": "Long vs short vowels, the hard g, and sch",
  "blocks": [
    {
      "type": "card",
      "title": "The vowel length system",
      "body": "Dutch vowels come in **short** and **long** pairs — and the difference changes the word. *man* (man) vs *maan* (moon). *bos* (forest) vs *boos* (angry). Double letter (or open syllable) = long.",
      "table": {
        "headers": ["Short", "Long"],
        "rows": [["man — man", "maan — moon"], ["bos — forest", "boos — angry"], ["zit — sits", "ziet — sees"]]
      }
    },
    {
      "type": "chips",
      "items": [
        { "nl": "maan", "en": "moon", "speak": "maan" },
        { "nl": "man", "en": "man", "speak": "man" },
        { "nl": "boos", "en": "angry", "speak": "boos" },
        { "nl": "bos", "en": "forest", "speak": "bos" }
      ]
    },
    {
      "type": "card",
      "title": "The famous g",
      "body": "The Dutch *g* (and *ch*) is a scrape at the back of the throat — like clearing your throat gently. *goed*, *gracht*, *gezellig*. In the Randstad it's hard; in the south it's softer. We learn the hard one.",
      "callout": "Same sound for g and ch: *acht* (eight) and *ag* rhyme."
    },
    {
      "type": "shadow",
      "lines": [
        { "nl": "goedemorgen", "en": "good morning" },
        { "nl": "gezellig", "en": "cozy/fun (untranslatable, you'll see)" },
        { "nl": "de gracht", "en": "the canal" }
      ]
    },
    {
      "type": "mcq",
      "prompt": "Which word means 'moon'?",
      "options": ["man", "maan", "men"],
      "correct": 1,
      "explain": "Double *aa* = long vowel. *maan* is moon; *man* is man."
    },
    {
      "type": "dictation",
      "speak": "goedemorgen",
      "answers": ["goedemorgen", "goede morgen"]
    },
    {
      "type": "journal",
      "prompt": "Which sound felt hardest today? Type the three Dutch words you most want to nail this week.",
      "starters": ["De g is…", "Ik wil … zeggen"]
    }
  ]
}
```

---

*Schema versions are frozen at 1 for the DutchBuddy build; any breaking change bumps the version and the validator enforces compatibility.*
