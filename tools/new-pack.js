#!/usr/bin/env node
// Content-pack scaffolder. Run:
//   node tools/new-pack.js <pack-id> "<Language>" <locale> <flag-emoji> <accent-hex>
//   node tools/new-pack.js french-fr "French" fr-FR 🇫🇷 "#2563eb"
//
// Creates public/packs/<pack-id>/{manifest.json,style-guide.md,characters.md},
// docs/roadmap-<pack-id>.md, appends <pack-id> to public/packs/catalog.json, and
// adds a validate:<pack-id> script to package.json. Everything is born on
// schema v2 (the `target` field — see docs/roadmap-expansion.md §2.1).
//
// Refuses to run (no partial writes) if the pack dir already exists, if it's
// already in the catalog, or if the package.json script already exists.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function usage() {
  console.error('Usage: node tools/new-pack.js <pack-id> "<Language>" <locale> <flag-emoji> <accent-hex>');
  console.error('Example: node tools/new-pack.js french-fr "French" fr-FR 🇫🇷 "#2563eb"');
}

const [, , packId, language, locale, flag, accent] = process.argv;

if (!packId || !language || !locale || !flag || !accent) {
  usage();
  process.exit(2);
}

if (!/^[a-z0-9]+(-[a-z0-9]+)+$/.test(packId)) {
  console.error(`Refusing: pack-id "${packId}" should be lowercase and hyphenated, e.g. "french-fr".`);
  process.exit(1);
}

const packDir = path.join(root, 'public', 'packs', packId);
const catalogPath = path.join(root, 'public', 'packs', 'catalog.json');
const packageJsonPath = path.join(root, 'package.json');
const roadmapPath = path.join(root, 'docs', `roadmap-${packId}.md`);
const validateScript = `validate:${packId}`;

// ---------- pre-flight: refuse cleanly, no partial writes ----------
if (fs.existsSync(packDir)) {
  console.error(`Refusing: public/packs/${packId}/ already exists.`);
  process.exit(1);
}

const catalogRaw = fs.readFileSync(catalogPath, 'utf8');
const catalog = JSON.parse(catalogRaw);
if ((catalog.packs || []).includes(packId)) {
  console.error(`Refusing: "${packId}" is already in public/packs/catalog.json.`);
  process.exit(1);
}

const pkgRaw = fs.readFileSync(packageJsonPath, 'utf8');
const pkg = JSON.parse(pkgRaw);
if (pkg.scripts && pkg.scripts[validateScript]) {
  console.error(`Refusing: package.json already has a "${validateScript}" script.`);
  process.exit(1);
}

if (fs.existsSync(roadmapPath)) {
  console.error(`Refusing: docs/roadmap-${packId}.md already exists.`);
  process.exit(1);
}

// ---------- helpers ----------
const pad2 = (n) => String(n).padStart(2, '0');
const appName = `${language.replace(/\s+/g, '')}Buddy`;

function buildWeeksBlock() {
  const lines = [];
  for (let w = 1; w <= 18; w++) {
    const startDay = (w - 1) * 7 + 1;
    const days = Array.from({ length: 7 }, (_, i) => `"day-${pad2(startDay + i)}"`).join(', ');
    lines.push(`    { "week": ${w}, "module": "M${pad2(w)}", "title": "TODO: week ${w} theme", "days": [${days}] }`);
  }
  return lines.join(',\n');
}

// ---------- manifest.json ----------
const manifest = `{
  "schemaVersion": 2,
  "packId": ${JSON.stringify(`${packId}-v1`)},
  "appName": ${JSON.stringify(appName)},
  "tagline": "TODO: one-line ${language} tagline",
  "language": ${JSON.stringify(language)},
  "locale": ${JSON.stringify(locale)},
  "flag": ${JSON.stringify(flag)},
  "accent": ${JSON.stringify(accent)},
  "ui": {
    "dayComplete": "Day {day} done!",
    "typedPlaceholder": ${JSON.stringify(`Type in ${language}…`)},
    "correctFeedback": "Nice!",
    "journalPlaceholder": "Write here…"
  },
  "grading": { "diacriticTolerant": true },
  "dialect": {
    "identity": "TODO: e.g. \\"France French\\" — the one specific variant this pack teaches",
    "contrast": "TODO: e.g. \\"Not Québécois\\" — what it deliberately is NOT",
    "markers": ["TODO", "TODO", "TODO", "TODO"]
  },
  "hero": {
    "title": "TODO: hero title (usually matches tagline)",
    "blurb": "TODO: one-paragraph pitch — mention the 18-week A1 → C1-gateway structure and the free/no-signup angle.",
    "bullets": [
      { "emoji": "TODO", "strong": "TODO: dialect-flavor bullet", "text": "TODO" },
      { "emoji": "📅", "strong": "A1 → C1 gateway in 18 weeks", "text": "structured so you actually finish." },
      { "emoji": "⏱", "strong": "Short daily sessions", "text": "15 to 35 minutes, sized to fit your day." },
      { "emoji": "❤️", "strong": "Free, no signup", "text": "your progress saves to this device." }
    ]
  },
  "levels": [
    { "code": "A1", "title": "A1 Foundations", "weeks": [1, 4], "blurb": "TODO: A1 scope blurb" },
    { "code": "A2", "title": "A2 Building", "weeks": [5, 8], "blurb": "TODO: A2 scope blurb" },
    { "code": "B1", "title": "B1 Threshold", "weeks": [9, 12], "blurb": "TODO: B1 scope blurb" },
    { "code": "B2", "title": "B2 Depth", "weeks": [13, 16], "blurb": "TODO: B2 scope blurb" },
    { "code": "C1", "title": "C1 Gateway", "weeks": [17, 18], "blurb": "TODO: C1 scope blurb" }
  ],
  "cast": [],
  "weeks": [
${buildWeeksBlock()}
  ],
  "footer": {
    "donation": true,
    "donationText": ${JSON.stringify(`TODO: donation blurb for ${language} learners`)},
    "storageDisclosure": "Progress is saved on this device only, your dashboard won't sync to other browsers."
  }
}
`;

// ---------- style-guide.md ----------
const styleGuide = `# ${appName} — Style Guide

*Authoring-time only. Not shipped (stripped from the production build). The fixed
voice + format + schema contract for every lesson JSON. Follow it exactly so machine
validation (\`tools/validate.js\`) passes on the first run and 126 days written in
parallel batches read as one app.*

---

## 1. Voice

- **TODO — dialect identity, one specific variant, contrasted against what it is NOT.**
  (e.g. "Germany Standard German (Hochdeutsch), northern-neutral — not Austrian, not
  Swiss.") Answer this from the new-language-pack skill questionnaire and mirror it
  into \`manifest.json\` → \`dialect\`.
- **TODO — markers to lean on:** 4–8 native filler words/phrases that make the target
  language sound native, not textbook (Dutch: \`lekker, gezellig, hoor\`; German:
  \`doch, mal, halt\`).
- **Warm, plain, a little funny.** You're a buddy, not a textbook. English
  explanations are short, concrete, occasionally wry. Never academic.
- **No anglicisms in ${language}** unless the language genuinely borrows the word —
  use what a native actually says.
- **Encourage, never scold.** Wrong answers get a nudge and a retry, never a block.

## 2. English ↔ ${language} formatting conventions (schema v2)

- **The target-language field is named \`target\` in every block** (chips items,
  dialogue lines, shadow lines) — this pack is born on \`schemaVersion: 2\`. Put the
  ${language} text in \`target\`. English gloss goes in \`en\`. \`speak\` = the exact
  ${language} to voice (usually equal to \`target\`). (Schema v1 packs named this field
  \`nl\`; the engine reads \`item.target ?? item.nl\` for back-compat, but this pack
  never writes \`nl\`.)
- In \`card\`/\`callout\` **body** (markdown): ${language} example words in *italics*, the
  key rule or "one new thing" in **bold**. Glosses in parentheses.
- In \`chips\`/\`shadow\`/\`dialogue\`: ${language} goes in \`target\`, English gloss in \`en\`.
  Do **not** repeat the translation inside \`target\`.
- Em dashes for "word — gloss" inside table cells: \`"word — gloss"\`.
- Keep English glosses tight — a word or short phrase, not a sentence.
- Only real markdown supported by the engine is \`**bold**\` and \`*italic*\`, plus
  tables via the \`table\` field. No headings, lists, links, or code in \`body\`.
- TODO — special-character convention: always use the real target-language
  characters (never ASCII fallbacks). Grading defaults to diacritic-tolerant
  (\`manifest.grading.diacriticTolerant\`) — confirm that's right for this language,
  or add a language-specific grading tweak (e.g. elision/apostrophe tolerance,
  locale-aware lowercasing) and document it here.

## 3. The "one new thing per block" rule

Each block introduces **one** teachable unit (one rule, one contrast, one drill
target). Don't stack two grammar points in a single card. Difficulty ramps *within*
a lesson: teach → recognise (mcq/chips) → produce (typed/builder) → use
(dialogue/journal).

## 4. Lesson shape by \`kind\`

Block-count targets (validator warns outside these — stay inside):

| kind | blocks | arc |
|------|--------|-----|
| \`lesson\` | **8–12** | 1–2 teaching cards → chips/contrast → mcq → typed/dictation → (dialogue or builder) → journal |
| \`review\` | **6–8** | light recap card → mixed drills pulling the week's targets → **immersion dialogue with the recurring cast** → comprehension → short journal |
| \`capstone\` | **10–14** | recap card → graded drills across the week → a builder or dialogue that *produces* → **the growing self-intro layer for that week** (builder or journal) → celebratory journal |

Every **review** day carries the recurring-cast story arc (see \`characters.md\`).
Every **capstone** ends on the growing self-intro.

A normal \`lesson\` should include **at least 3 graded blocks** (mcq/typed/dictation/
builder/comprehension). Aim for ≥1 \`chips\` or \`shadow\` (audio touch) per lesson.

## 5. Block authoring rules (schema + gotchas)

Top-level lesson fields (all required): \`schemaVersion\` (always \`2\`), \`id\`
(\`"day-NN"\`, zero-padded), \`day\` (int, matches id), \`module\` (\`"MNN"\`, matches the
manifest week), \`unit\`, \`kind\`, \`title\` (${language}, evocative), \`emoji\` (one,
topical), \`level\` (\`A1\`–\`C1\`), \`durationMin\` (\`[15,25]\` typical, \`[20,35]\` for B2/C1),
\`summary\` (one English line), \`blocks[]\`.

\`unit\` convention: \`"U"\` + two digits; simplest is one unit per week.

Per block type — required fields:

- **card** — \`title\`, \`body\` (markdown). Optional \`table\` {\`headers[]\`, \`rows[]\`} —
  every row length must equal headers length. Optional \`callout\`.
- **chips** — \`items[]\`, each \`{target, en, speak?}\`. 4–8 items.
- **contrast** — \`pairs[]\`, each \`{left, right, note?}\`.
- **mcq** — \`prompt\`, \`options[]\` (≥2), \`correct\` (0-based index), \`explain\`.
- **typed** — \`prompt\`, \`answers[]\` (≥1). List every acceptable spelling explicitly;
  put the canonical form first (shown as the gentle correction). Optional \`hint\`,
  \`explain\`.
- **dictation** — \`speak\`, \`answers[]\` (≥1). Optional \`prompt\`.
- **builder** — \`slots[]\`, each \`{label, chips[]}\` (chips required, non-empty).
  Optional \`sample\`, \`prompt\`, \`starters\`.
- **dialogue** — \`scene\`, \`lines[]\` each \`{speaker, target, en, spotlight?}\`.
  **\`speaker\` must be \`"You"\` or a name in the manifest \`cast\` list** — anything
  else fails validation. 4–10 lines (8–12 for B2/C1).
- **shadow** — \`lines[]\` each \`{target, en}\`. 3–6 lines.
- **comprehension** — \`questions[]\` each \`{q, options[], correct}\` (0-based, in
  range). Use after a dialogue/passage in the same lesson.
- **journal** — \`prompt\`. Optional \`starters[]\`, \`minSentences\`.

## 6. Grammar accuracy (non-negotiable)

TODO — this section is entirely pack-specific. Once the new-language-pack skill
questionnaire is answered, write the non-negotiable grammar rules here (one
paragraph per grammar-spine item), mirroring \`docs/roadmap-${packId}.md\` §2 and an
existing pack's style guide §6 (e.g. \`public/packs/german-de/style-guide.md\`) for
the level of detail expected.

## 7. Difficulty ramp across the 126 days

TODO — describe the A1 → C1-gateway ramp in target-language density per level
(how much English scaffolding at A1 vs how German-first/${language}-first B2/C1
prompts get), mirroring an existing pack's style guide §7/§9.

## 8. Output & handoff rules

- One file per day: \`public/packs/${packId}/lessons/day-NN.json\`, zero-padded,
  **strict JSON** (no comments, no trailing commas).
- Emoji: exactly one per lesson, topical. Pick distinct ones across a week.
- After writing a batch, run \`npm run validate:${packId}\`. **Zero errors** is the
  merge gate; resolve warnings (block counts, table widths) too.
- Keep each lesson genuinely teachable and fun. Dogfood mentally: could a real
  beginner do this on a phone in 15–25 minutes?
`;

// ---------- characters.md ----------
const characters = `# ${appName} — Character Bible

*Authoring-time only. Not shipped. Consulted by every lesson-generation pass so
recurring-cast voices and the story arc stay coherent across 126 days written in
parallel batches. If a dialogue names a character, that character must be in the
manifest \`cast\` list (the validator enforces this) and must behave as written here.*

---

## TODO — the cast concept

Fill in from the new-language-pack skill questionnaire: 4 original characters +
**You**, a recurring home city/setting, one mid-arc life event landing ~day 69
(season 1, weeks 1–12) and a second life event ~day 111 (season 2, weeks 13–18,
mirrors day 69). See \`public/packs/german-de/characters.md\` for a fully worked
example.

### TODO — Character 1 (main narrator)
- **Who:**
- **Voice:**
- **Role in the arc:**
- **Speech markers:**

### TODO — Character 2 (gossip / debate partner)
- **Who:**
- **Voice:**
- **Role in the arc:**
- **Speech markers:**

### TODO — Character 3 (the friend whose life moves — THE SPINE)
- **Who:**
- **Voice:**
- **Role in the arc — keep these day anchors exact:**
  - **W6 / ~day 41:** TODO — a rough-week beat (mirrors the health module)
  - **W9 / ~day 62:** TODO — news lands (a decision in progress, told via reported speech if the grammar spine supports it)
  - **W10 / day 69:** TODO — **THE mid-arc life event.** (validator/consistency-critical day)
  - **W11 / ~day 76:** TODO — settling in, happier
  - **W12 / day 83:** TODO — back for the finale, one year on
- **Continuity rule:** TODO — state the before/during/after ordering explicitly and never break it.

### TODO — Character 4 (routine & immersion voice)
- **Who:**
- **Voice:**
- **Role in the arc:**
- **Speech markers:**

### You (the learner)
- Speaker id **\`You\`** — always allowed by the validator, never needs to be in the
  cast list.
- TODO — one line describing the learner's implied situation, tied to the day-74
  meta-module challenge.

---

## The growing self-intro

Every capstone ends with the learner producing/extending a personal
self-introduction that gains **exactly one new grammar layer per week**. Capstone
authors MUST append the correct cumulative layer via a \`builder\` or \`journal\` block.
Fill in this table once \`docs/roadmap-${packId}.md\` §4 is written:

| Wk | Capstone day | New self-intro layer (cumulative) |
|----|------|------|
| 1  | 7    | TODO |
| 2  | 14   | TODO |
| 3  | 21   | TODO |
| 4  | 28   | TODO |
| 5  | 35   | TODO |
| 6  | 42   | TODO |
| 7  | 49   | TODO |
| 8  | 56   | TODO |
| 9  | 63   | TODO |
| 10 | 70   | TODO |
| 11 | 77   | TODO |
| 12 | 84   | TODO — the whole thing, one grammar-move per slot, a letter to your past self, ${language} farewells |

---

## Season 2 (Weeks 13–18) — TODO

TODO — two new cast members (one professional-register anchor, one exposure-only
regional-color cameo — mirroring German's Mareike/Vroni pattern, if the dialect
identity supports a regional contrast), a second life event ~day 111 mirroring day
69, and a season-2 growing self-intro table (rows 13–18). See
\`public/packs/german-de/characters.md\` §"Season 2" for the fully worked example.
`;

// ---------- docs/roadmap-<pack-id>.md ----------
const roadmap = `# ${appName} — 126-Day Curriculum Roadmap (\`${packId}\`)

*The per-language worked example for ${language}, built against the unchanged
YapWorld engine. Mirrors the structure of \`docs/roadmap-german-de.md\` but must be
**designed from ${language}'s own grammar spine**, not translated from another pack.
This doc is the locked scope input for the weekly lesson-generation batches (see
\`docs/plan.md\` §4 and the \`new-language-pack\` skill).*

---

## 1. Dialect identity

- **Identity:** TODO — the one specific variant this pack teaches.
- **Contrast — this is NOT:** TODO — the variant(s) explicitly excluded, and why.
- **Markers to lean on:** TODO — 4–8 native filler words/phrases.
- **Register anchor:** TODO — what register a motivated adult actually hears in the
  pack's default setting.

## 2. The grammar spine

TODO — 2–4 structural hard parts that anchor the entire sequence (the thing that
makes ${language} *${language}*, not a translation of another pack's spine). For each:
name it, say which week it opens in, and say which week it's revisited/mastered.
See \`docs/roadmap-german-de.md\` §2 for the level of detail expected.

## 3. Weekly rhythm

Mirrors the engine's fixed rhythm (same for every pack — do not change):
- **Weeks 1–2:** 6 teaching days + 1 capstone.
- **Weeks 3–12:** 5 teaching days + 1 review/immersion day + 1 capstone.
- **Weeks 13–18 (season 2):** same rhythm, B2 → C1-gateway depth.
- Every **capstone** ends with the growing self-intro (see \`characters.md\`).
- Every **review/immersion** day carries the recurring-cast story arc.

## 4. The 126 days

TODO — one heading + day list per week, mirroring \`docs/roadmap-german-de.md\` §4.
Manifest week titles below are placeholders; update \`manifest.json\` → \`weeks[].title\`
to match once each week is scoped.

| Week | Module | Theme (fill in, then update manifest.json) |
|------|--------|------|
${Array.from({ length: 18 }, (_, i) => `| ${i + 1} | M${pad2(i + 1)} | TODO |`).join('\n')}

Reminders baked into the engine's story-arc convention:
- **Day 69** — season-1 mid-arc life event slot.
- **Day 74** — the language-specific meta-module slot (§8).
- **Day 111** — season-2 life event slot (mirrors day 69).

## 5. Cultural scene anchors

TODO — the 6–8 recurring settings that drive the vocab modules and ground every
dialogue (e.g. German's Bäckerei, WG-Leben, Pfand & Supermarkt).

## 6. Cast & story arc

TODO — summary of the 4-character cast + arc; full bios live in \`characters.md\`.
State the day-41/62/69/76/83 (season 1) and day-90/97/111/118/125 (season 2)
anchors once decided.

## 7. Register / slang traffic-light

TODO — 🟢 green (use freely), 🟡 yellow (casual, mind the room), 🔴 red (flagged,
explained, use-with-care) tiers, language-appropriate. See
\`docs/roadmap-german-de.md\` §7 for the pattern.

## 8. The day-74 meta-module

TODO — one language-specific challenge module (Dutch: "blijf in het Nederlands";
German: "Fälle in Echtzeit" — cases under time pressure). Name it, describe the
contents, and say what problem it solves for a ${language} learner specifically.

## 9. Locale & audio config

- **\`locale\`: \`${locale}\`** — drives Web Speech API voice selection (v1) and any v2
  pre-generated TTS.
- **Voice availability:** TODO — check \`${locale}\` Web Speech coverage; note any
  fallback locale.
- **Grading:** TODO — confirm \`diacriticTolerant\` is the right default, and add any
  language-specific grading tweak here (e.g. elision/apostrophe tolerance for
  French, locale-aware lowercasing for Turkish) plus where it needs an engine hook.
- **\`speak\` text:** always the exact spoken ${language} (real diacritics/special
  characters, never ASCII fallbacks).

## 10. The growing self-intro

See \`characters.md\` for the per-week layer table (weeks 1–18, cumulative).

## 11. Season 2 — Weeks 13–18: B2 Depth → C1 Gateway

TODO — ${language}'s upper-level pain points (the season-2 design inputs), the
season-2 life event (~day 111), new cast members, and the 42-day list (85–126).
Honest framing (non-negotiable, same for every pack): weeks 13–16 are B2, weeks
17–18 are the C1 *gateway* — they prepare the leap, they do not certify C1.
`;

// ---------- write pack files ----------
fs.mkdirSync(path.join(packDir, 'lessons'), { recursive: true });
fs.writeFileSync(path.join(packDir, 'manifest.json'), manifest);
fs.writeFileSync(path.join(packDir, 'style-guide.md'), styleGuide);
fs.writeFileSync(path.join(packDir, 'characters.md'), characters);
fs.writeFileSync(roadmapPath, roadmap);

// ---------- catalog.json (text-level edit, preserves formatting) ----------
const packsArrayPattern = /"packs":\s*\[[^\]]*\]/;
const currentIds = catalog.packs || [];
const newIds = [...currentIds, packId];
const newPacksLine = `"packs": [${newIds.map((id) => JSON.stringify(id)).join(', ')}]`;
if (!packsArrayPattern.test(catalogRaw)) {
  console.error('Could not find a "packs": [...] array in catalog.json — aborting before any writes were made to it.');
  process.exit(1);
}
fs.writeFileSync(catalogPath, catalogRaw.replace(packsArrayPattern, newPacksLine));

// ---------- package.json (JSON round-trip; verified byte-identical style) ----------
pkg.scripts[validateScript] = `node tools/validate.js public/packs/${packId}`;
fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);

// ---------- authoring checklist ----------
console.log(`Scaffolded ${packId}:`);
console.log(`  public/packs/${packId}/manifest.json`);
console.log(`  public/packs/${packId}/style-guide.md`);
console.log(`  public/packs/${packId}/characters.md`);
console.log(`  public/packs/${packId}/lessons/  (empty — days render "coming soon")`);
console.log(`  docs/roadmap-${packId}.md`);
console.log(`  public/packs/catalog.json  (+${packId})`);
console.log(`  package.json  (+${validateScript})`);
console.log('');
console.log(`Verify: node tools/validate.js public/packs/${packId}  (expect missing-day warnings only, zero errors)`);
console.log('');
console.log('Next — authoring checklist:');
console.log('  1. Answer the questionnaire (dialect identity + contrast, 2-4 item grammar');
console.log('     spine, cultural scene anchors, cast concept + mid-arc life event, slang');
console.log('     tiers, day-74 meta-module, locale/TTS + grading needs). See the');
console.log('     new-language-pack skill (.claude/skills/new-language-pack/SKILL.md).');
console.log(`  2. Fill manifest.json: dialect, hero, level blurbs, week titles, cast[],`);
console.log(`     and (once week 1 is authored) donationText/tagline.`);
console.log(`  3. Write characters.md: the 4-character cast + arc anchors (day 69/111),`);
console.log(`     and the growing self-intro table.`);
console.log(`  4. Write style-guide.md §6/§7: grammar accuracy rules and the difficulty ramp.`);
console.log(`  5. Write docs/roadmap-${packId}.md: grammar spine, weekly themes, scene`);
console.log(`     anchors, register tiers, day-74 meta-module.`);
console.log(`  6. Author week 1 (days 1-7) against the style guide + character bible.`);
console.log(`     Gate every batch on: npm run ${validateScript}`);
console.log('  7. Continue in weekly batches per docs/plan.md §4, validating each week.');
