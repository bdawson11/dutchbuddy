#!/usr/bin/env node
// Extract every spoken line from a content pack and write a TTS job list.
//
//   node tools/tts/extract.mjs <pack-dir>            # write <pack>/audio/jobs.json
//   node tools/tts/extract.mjs <pack-dir> --check    # report clips still missing
//
// This is the single source of truth for *what* the app speaks. It mirrors the
// speak() calls in src/engine/blocks/index.jsx exactly:
//
//   chips     -> items[].speak
//   dictation -> speak
//   dialogue  -> lines[].nl
//   shadow    -> lines[].nl
//
// The sentence builder is intentionally excluded: its text is composed live
// from the learner's picks, so it can't be pre-rendered and always falls back
// to the Web Speech voice.
//
// generate.py consumes jobs.json and never re-derives this logic, so the audio
// the app plays can never drift from the audio that gets generated.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { normalizeSpoken } from '../../src/engine/ttsKey.js';

const packDir = process.argv[2];
const check = process.argv.includes('--check');
if (!packDir) {
  console.error('Usage: node tools/tts/extract.mjs <pack-dir> [--check]');
  process.exit(2);
}

// Pull the spoken strings out of a single lesson's block list.
function spokenFromLesson(lesson) {
  const out = [];
  for (const block of lesson.blocks || []) {
    switch (block.type) {
      case 'chips':
        for (const item of block.items || []) if (item.speak) out.push(item.speak);
        break;
      case 'dictation':
        if (block.speak) out.push(block.speak);
        break;
      case 'dialogue':
      case 'shadow':
        for (const line of block.lines || []) if (line.nl) out.push(line.nl);
        break;
      default:
        break;
    }
  }
  return out;
}

const manifestPath = path.join(packDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error(`No manifest.json in ${packDir}`);
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const dayIds = (manifest.weeks || []).flatMap((w) => w.days || []);

// Dedupe by lookup key, but keep the first-seen ORIGINAL text: Tortoise should
// synthesise "Scheveningen", not the lower-cased lookup key.
const byKey = new Map();
for (const id of dayIds) {
  const file = path.join(packDir, 'lessons', `${id}.json`);
  if (!fs.existsSync(file)) continue;
  let lesson;
  try {
    lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.error(`Skipping ${id}: invalid JSON (${e.message})`);
    continue;
  }
  for (const text of spokenFromLesson(lesson)) {
    const key = normalizeSpoken(text);
    if (!key || byKey.has(key)) continue;
    const hash = crypto.createHash('sha1').update(key).digest('hex').slice(0, 16);
    byKey.set(key, { key, text, file: `${hash}.wav` });
  }
}

const jobs = [...byKey.values()];
const audioDir = path.join(packDir, 'audio');

if (check) {
  const indexPath = path.join(audioDir, 'index.json');
  const index = fs.existsSync(indexPath)
    ? JSON.parse(fs.readFileSync(indexPath, 'utf8'))
    : { clips: {} };
  const have = new Set(Object.keys(index.clips || {}).map(normalizeSpoken));
  const missing = jobs.filter((j) => !have.has(j.key));
  console.log(`${manifest.locale}: ${jobs.length} spoken lines, ${jobs.length - missing.length} with audio, ${missing.length} missing.`);
  if (missing.length) {
    for (const j of missing.slice(0, 20)) console.log(`  missing: ${JSON.stringify(j.text)}`);
    if (missing.length > 20) console.log(`  … and ${missing.length - 20} more`);
    process.exit(1);
  }
  process.exit(0);
}

fs.mkdirSync(audioDir, { recursive: true });
const jobsPath = path.join(audioDir, 'jobs.json');
fs.writeFileSync(
  jobsPath,
  JSON.stringify({ locale: manifest.locale, count: jobs.length, jobs }, null, 2) + '\n'
);
console.log(`Wrote ${jobs.length} jobs to ${jobsPath}`);
