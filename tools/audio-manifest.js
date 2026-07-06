#!/usr/bin/env node
// Speakable-string inventory + audio coverage report for a content pack.
//
//   node tools/audio-manifest.js <pack-dir> [--json <out.json>] [--missing]
//
// Extracts every string the engine can speak from the pack's lessons, then
// (if <pack-dir>/audio/index.json exists) reports how many already have a
// pre-generated clip. Zero deps; safe to run in CI as a coverage gate.
//
// Extraction rules — keep in sync with src/engine/blocks/index.jsx and
// tools/xtts/generate_audio.py:
//   chips      items[].speak   (chips only speak when `speak` is present)
//   dictation  block.speak
//   dialogue   lines[].nl
//   shadow     lines[].nl
// Builder sentences are assembled at runtime and always use the Web Speech
// fallback — they are intentionally not part of this inventory.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const packDir = args.find((a) => !a.startsWith('--'));
const showMissing = args.includes('--missing');
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
if (!packDir) {
  console.error('Usage: node tools/audio-manifest.js <pack-dir> [--json <out.json>] [--missing]');
  process.exit(2);
}

// Same normalization as src/engine/audio.js and the XTTS generator: clip
// lookup happens on NFC + collapsed whitespace, never on raw authoring text.
const normalize = (t) => t.normalize('NFC').replace(/\s+/g, ' ').trim();
const hash = (t) => crypto.createHash('sha256').update(t, 'utf8').digest('hex').slice(0, 16);

const manifest = JSON.parse(fs.readFileSync(path.join(packDir, 'manifest.json'), 'utf8'));
const dayIds = manifest.weeks.flatMap((w) => w.days);

const strings = new Map(); // normalized text → {text, sources: count}
const add = (raw) => {
  if (!raw) return;
  const text = normalize(raw);
  if (!text) return;
  const entry = strings.get(text) || { text, uses: 0 };
  entry.uses++;
  strings.set(text, entry);
};

let lessons = 0;
for (const dayId of dayIds) {
  const file = path.join(packDir, 'lessons', `${dayId}.json`);
  if (!fs.existsSync(file)) continue;
  const lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
  lessons++;
  for (const block of lesson.blocks || []) {
    if (block.type === 'chips') for (const it of block.items || []) add(it.speak);
    else if (block.type === 'dictation') add(block.speak);
    else if (block.type === 'dialogue' || block.type === 'shadow')
      for (const ln of block.lines || []) add(ln.nl);
  }
}

// Coverage against the generated clip index, if one exists.
const indexPath = path.join(packDir, 'audio', 'index.json');
let clipMap = null;
if (fs.existsSync(indexPath)) {
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const map = index.clips && typeof index.clips === 'object' ? index.clips : index;
  clipMap = new Map(Object.entries(map).map(([t, f]) => [normalize(t), f]));
}

const all = [...strings.values()].sort((a, b) => a.text.localeCompare(b.text));
const missing = clipMap ? all.filter((s) => !clipMap.has(s.text)) : all;
const chars = all.reduce((n, s) => n + s.text.length, 0);

console.log(`${manifest.packId}: ${all.length} unique speakable strings (${chars} chars) across ${lessons} lessons`);
if (clipMap) {
  const covered = all.length - missing.length;
  const stale = [...clipMap.keys()].filter((t) => !strings.has(t)).length;
  console.log(`audio/index.json: ${clipMap.size} clips — ${covered}/${all.length} strings covered, ${missing.length} missing${stale ? `, ${stale} stale (clip exists, string no longer in lessons)` : ''}`);
} else {
  console.log('audio/index.json: none — no clips generated yet for this pack');
}
if (showMissing) missing.forEach((s) => console.log(`  MISSING ${JSON.stringify(s.text)}`));

if (jsonOut) {
  const out = all.map((s) => ({
    text: s.text,
    hash: hash(s.text),
    uses: s.uses,
    file: clipMap?.get(s.text) ?? null,
  }));
  fs.writeFileSync(jsonOut, JSON.stringify(out, null, 2));
  console.log(`Wrote ${jsonOut} (${out.length} entries)`);
}
