#!/usr/bin/env node
// Map lesson lines to their generated clip files, so you can find and play the
// audio for specific days. Clip filenames are content hashes (not readable),
// and this resolves each line's day + speaker + text to its actual file path.
//
//   node tools/list-clips.mjs public/packs/italian-it --days day-03,day-83
//   node tools/list-clips.mjs public/packs/italian-it                (all days)
//
// Reads audio/index.json to show which lines were generated (✓) and which fell
// through to the Web Speech fallback (– e.g. single-letter drill items). Prints
// a ready-to-run macOS command to play a day's clips in order.

import fs from 'node:fs';
import path from 'node:path';

const packDir = process.argv[2];
const daysIdx = process.argv.indexOf('--days');
const days = daysIdx >= 0 ? new Set(process.argv[daysIdx + 1].split(',')) : null;
if (!packDir) {
  console.error('Usage: node tools/list-clips.mjs <packDir> [--days day-03,day-12]');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(path.join(packDir, 'manifest.json'), 'utf8'));
const audioDir = path.join(packDir, 'audio');
const indexPath = path.join(audioDir, 'index.json');
if (!fs.existsSync(indexPath)) {
  console.error(`No ${indexPath} yet — run tools/generate-audio.py first.`);
  process.exit(1);
}
const clips = (JSON.parse(fs.readFileSync(indexPath, 'utf8')).clips) || {};

// Collect (day, speaker, text) in lesson order, matching what the engine speaks.
const rows = [];
for (const w of manifest.weeks) for (const dayId of w.days) {
  if (days && !days.has(dayId)) continue;
  const p = path.join(packDir, 'lessons', `${dayId}.json`);
  if (!fs.existsSync(p)) continue;
  for (const b of JSON.parse(fs.readFileSync(p, 'utf8')).blocks || []) {
    if (b.type === 'chips') for (const it of b.items || []) it.speak && rows.push([dayId, '(narrator)', it.speak]);
    else if (b.type === 'typed' || b.type === 'dictation') b.speak && rows.push([dayId, '(narrator)', b.speak]);
    else if (b.type === 'dialogue') for (const l of b.lines || []) rows.push([dayId, l.speaker, l.nl]);
    else if (b.type === 'shadow') for (const l of b.lines || []) rows.push([dayId, '(narrator)', l.nl]);
  }
}

let cur = null, gen = 0, fallback = 0;
const genByDay = {};
for (const [dayId, speaker, text] of rows) {
  if (dayId !== cur) { cur = dayId; console.log(`\n=== ${dayId} ===`); }
  const file = clips[text];
  if (file) { gen++; (genByDay[dayId] ||= []).push(path.join(audioDir, file)); }
  else fallback++;
  const tag = file ? '✓' : '– fallback';
  const loc = file ? path.join(audioDir, file) : '(Web Speech)';
  console.log(`  [${tag}] ${speaker.padEnd(10)} ${loc}  ${JSON.stringify(text).slice(0, 64)}`);
}

console.log(`\n${gen} generated clip(s), ${fallback} on the Web Speech fallback.`);
console.log(`Open the folder:  open ${audioDir}`);
for (const [dayId, files] of Object.entries(genByDay)) {
  // de-dupe (shared lines) while preserving order
  const uniq = [...new Set(files)];
  console.log(`Play ${dayId} in order:  afplay ${uniq.join(' ; afplay ')}`);
}
