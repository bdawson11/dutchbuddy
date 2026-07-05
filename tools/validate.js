#!/usr/bin/env node
// Content-pack validator. Run: node tools/validate.js <pack-dir> [--strict]
// Default mode: validates the manifest and every lesson file that exists.
// --strict additionally fails if any day listed in the manifest has no
// lesson file (use in CI before a public release).

import fs from 'node:fs';
import path from 'node:path';

const packDir = process.argv[2];
const strict = process.argv.includes('--strict');
if (!packDir) {
  console.error('Usage: node tools/validate.js <pack-dir> [--strict]');
  process.exit(2);
}

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// ---------- manifest ----------
const manifestPath = path.join(packDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error(`No manifest.json in ${packDir}`);
  process.exit(1);
}
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (e) {
  console.error(`manifest.json is not valid JSON: ${e.message}`);
  process.exit(1);
}

for (const f of ['schemaVersion', 'packId', 'appName', 'language', 'locale', 'levels', 'weeks', 'cast', 'hero', 'footer']) {
  if (manifest[f] === undefined) err(`manifest: missing field "${f}"`);
}
if (manifest.schemaVersion !== 1) err(`manifest: unsupported schemaVersion ${manifest.schemaVersion}`);

const allDayIds = (manifest.weeks || []).flatMap((w) => w.days || []);
const seen = new Set();
allDayIds.forEach((d, i) => {
  if (seen.has(d)) err(`manifest: duplicate day id ${d}`);
  seen.add(d);
  const n = parseInt(d.split('-')[1], 10);
  if (n !== i + 1) err(`manifest: day ids not sequential at position ${i + 1} (found ${d})`);
});

const castNames = new Set((manifest.cast || []).map((c) => c.name));

// ---------- lesson block validation ----------
const BLOCK_VALIDATORS = {
  card: (b) => {
    req(b, ['title', 'body']);
    if (b.table) {
      if (!Array.isArray(b.table.headers) || !Array.isArray(b.table.rows)) return 'table needs headers[] and rows[]';
      for (const r of b.table.rows) if (r.length !== b.table.headers.length) return 'table row length ≠ header length';
    }
  },
  chips: (b) => {
    if (!Array.isArray(b.items) || b.items.length === 0) return 'items[] required';
    for (const it of b.items) if (!it.nl || !it.en) return 'each chip needs nl and en';
  },
  contrast: (b) => {
    if (!Array.isArray(b.pairs) || b.pairs.length === 0) return 'pairs[] required';
    for (const p of b.pairs) if (!p.left || !p.right) return 'each pair needs left and right';
  },
  mcq: (b) => {
    req(b, ['prompt', 'options', 'correct']);
    if (!Array.isArray(b.options) || b.options.length < 2) return 'options[] needs ≥2 entries';
    if (!Number.isInteger(b.correct) || b.correct < 0 || b.correct >= b.options.length) return 'correct index out of range';
  },
  typed: (b) => {
    req(b, ['prompt', 'answers']);
    if (!Array.isArray(b.answers) || b.answers.length === 0) return 'answers[] needs ≥1 accepted answer';
  },
  dictation: (b) => {
    req(b, ['speak', 'answers']);
    if (!Array.isArray(b.answers) || b.answers.length === 0) return 'answers[] needs ≥1 accepted answer';
  },
  builder: (b) => {
    if (!Array.isArray(b.slots) || b.slots.length === 0) return 'slots[] required';
    for (const s of b.slots) {
      if (!s.label) return 'each slot needs a label';
      if (!Array.isArray(s.chips) || s.chips.length === 0) return 'each slot needs chips[]';
    }
  },
  dialogue: (b) => {
    req(b, ['scene', 'lines']);
    if (!Array.isArray(b.lines) || b.lines.length === 0) return 'lines[] required';
    for (const l of b.lines) {
      if (!l.speaker || !l.nl || !l.en) return 'each line needs speaker, nl, en';
      if (l.speaker !== 'You' && !castNames.has(l.speaker)) return `speaker "${l.speaker}" not in manifest cast`;
    }
  },
  shadow: (b) => {
    if (!Array.isArray(b.lines) || b.lines.length === 0) return 'lines[] required';
    for (const l of b.lines) if (!l.nl || !l.en) return 'each line needs nl and en';
  },
  comprehension: (b) => {
    if (!Array.isArray(b.questions) || b.questions.length === 0) return 'questions[] required';
    for (const q of b.questions) {
      if (!q.q || !Array.isArray(q.options)) return 'each question needs q and options[]';
      if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.options.length) return 'correct index out of range';
    }
  },
  journal: (b) => req(b, ['prompt']),
};

let missingFields;
function req(obj, fields) {
  missingFields = fields.filter((f) => obj[f] === undefined);
}

// ---------- lessons ----------
const lessonsDir = path.join(packDir, 'lessons');
let validated = 0;
const lessons = [];
for (const dayId of allDayIds) {
  const file = path.join(lessonsDir, `${dayId}.json`);
  if (!fs.existsSync(file)) {
    (strict ? err : warn)(`${dayId}: lesson file missing`);
    continue;
  }
  let lesson;
  try {
    lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    err(`${dayId}: invalid JSON — ${e.message}`);
    continue;
  }
  validated++;

  for (const f of ['schemaVersion', 'id', 'day', 'module', 'unit', 'kind', 'title', 'emoji', 'level', 'durationMin', 'summary', 'blocks']) {
    if (lesson[f] === undefined) err(`${dayId}: missing field "${f}"`);
  }
  if (lesson.id !== dayId) err(`${dayId}: id "${lesson.id}" ≠ filename`);
  if (lesson.day !== parseInt(dayId.split('-')[1], 10)) err(`${dayId}: day number ≠ id`);
  if (!['lesson', 'review', 'capstone'].includes(lesson.kind)) err(`${dayId}: unknown kind "${lesson.kind}"`);

  const week = manifest.weeks.find((w) => w.days.includes(dayId));
  if (week && lesson.module !== week.module) err(`${dayId}: module ${lesson.module} ≠ manifest week module ${week.module}`);

  if (!Array.isArray(lesson.blocks) || lesson.blocks.length === 0) {
    err(`${dayId}: blocks[] empty`);
    continue;
  }
  lesson.blocks.forEach((b, i) => {
    const v = BLOCK_VALIDATORS[b.type];
    if (!v) return err(`${dayId} block ${i}: unknown type "${b.type}"`);
    missingFields = [];
    const msg = v(b);
    if (missingFields.length) err(`${dayId} block ${i} (${b.type}): missing ${missingFields.join(', ')}`);
    if (msg) err(`${dayId} block ${i} (${b.type}): ${msg}`);
  });

  const n = lesson.blocks.length;
  const target = { lesson: [8, 12], review: [6, 8], capstone: [10, 14] }[lesson.kind];
  if (target && (n < target[0] || n > target[1])) warn(`${dayId}: ${n} blocks, style guide target for ${lesson.kind} is ${target[0]}–${target[1]}`);

  lessons.push({ dayId, day: lesson.day, kind: lesson.kind, emoji: lesson.emoji, week: week ? week.week : null, raw: JSON.stringify(lesson) });
}

// ---------- pack-level content invariants ----------
// Cross-lesson drift that per-file checks can't see. Each check only inspects
// lessons that are present, so partial packs never trip a false error.
if (lessons.length) {
  // Emoji distinct within a week (style guide: distinct emoji across a week).
  const weekEmoji = {};
  for (const l of lessons) {
    if (l.week == null || !l.emoji) continue;
    weekEmoji[l.week] = weekEmoji[l.week] || {};
    if (weekEmoji[l.week][l.emoji]) err(`emoji ${l.emoji} repeats within week ${l.week} (${weekEmoji[l.week][l.emoji]} and ${l.dayId})`);
    else weekEmoji[l.week][l.emoji] = l.dayId;
  }

  // The following two checks are pack-specific and therefore CONFIGURED IN THE
  // MANIFEST, not hardcoded here — the validator stays language-agnostic (a
  // Dutch word or character name must never live in engine code). Absent config
  // = check skipped, so any pack validates without opting in.
  const ci = manifest.contentInvariants || {};

  // Every capstone carries the growing self-intro. The manifest names the token
  // that self-intro block is tagged with (Dutch pack: "verhaal").
  if (ci.selfIntroTag) {
    const tag = new RegExp(ci.selfIntroTag, 'i');
    for (const l of lessons) {
      if (l.kind === 'capstone' && !tag.test(l.raw)) {
        err(`${l.dayId}: capstone missing self-intro tag "${ci.selfIntroTag}" (product invariant)`);
      }
    }
  }

  // Story-arc continuity: the mid-arc character must not be tied to their
  // destination before the reveal day. Manifest supplies character/place/revealDay.
  if (ci.arc && ci.arc.character && ci.arc.place && ci.arc.revealDay) {
    const { character, place, revealDay } = ci.arc;
    const nameRe = new RegExp(character), placeRe = new RegExp(place);
    for (const l of lessons) {
      if (l.day < revealDay && nameRe.test(l.raw) && placeRe.test(l.raw)) {
        warn(`${l.dayId}: mentions ${character} and ${place} before reveal day ${revealDay} — check the arc`);
      }
    }
  }
}

// ---------- report ----------
console.log(`Validated ${validated}/${allDayIds.length} lessons in ${manifest.packId}${strict ? ' (strict)' : ''}`);
warnings.forEach((w) => console.log(`  WARN  ${w}`));
errors.forEach((e) => console.log(`  ERROR ${e}`));
if (errors.length) {
  console.log(`\n${errors.length} error(s).`);
  process.exit(1);
}
console.log(`OK — ${warnings.length} warning(s).`);
