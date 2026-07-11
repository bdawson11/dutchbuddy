#!/usr/bin/env node
// Extract every line a pack can speak, for the pre-generated-TTS pipeline.
//
//   node tools/extract-voiced-lines.mjs public/packs/italian-it > lines.json
//
// Walks the manifest's lessons and collects the exact strings the engine
// passes to speak() (see src/engine/blocks/index.jsx): chips item.speak,
// typed/dictation block.speak, dialogue and shadow line.nl. Builder output is
// assembled by the learner at runtime and is deliberately NOT extracted — it
// keeps the Web Speech fallback. Speaker names are kept so the generator can
// give each cast member their own reference voice.
//
// JSON goes to stdout, a human summary to stderr.

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const packDir = process.argv[2];
if (!packDir) {
  console.error('Usage: node tools/extract-voiced-lines.mjs <packDir>');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(path.join(packDir, 'manifest.json'), 'utf8'));
const clipFile = (text) =>
  createHash('sha1').update(text, 'utf8').digest('hex').slice(0, 16) + '.mp3';

// text → { text, file, speakers:Set, days:Set }
const lines = new Map();
const add = (text, speaker, dayId) => {
  if (!text || typeof text !== 'string') return;
  let entry = lines.get(text);
  if (!entry) {
    entry = { text, file: clipFile(text), speakers: new Set(), days: new Set() };
    lines.set(text, entry);
  }
  if (speaker) entry.speakers.add(speaker);
  entry.days.add(dayId);
};

let lessonsSeen = 0;
for (const dayId of manifest.weeks.flatMap((w) => w.days)) {
  const lessonPath = path.join(packDir, 'lessons', `${dayId}.json`);
  if (!fs.existsSync(lessonPath)) continue;
  const lesson = JSON.parse(fs.readFileSync(lessonPath, 'utf8'));
  lessonsSeen++;
  for (const block of lesson.blocks || []) {
    switch (block.type) {
      case 'chips':
        for (const item of block.items || []) add(item.speak, null, dayId);
        break;
      case 'typed':
      case 'dictation':
        add(block.speak, null, dayId);
        break;
      case 'dialogue':
        for (const line of block.lines || []) add(line.nl, line.speaker, dayId);
        break;
      case 'shadow':
        for (const line of block.lines || []) add(line.nl, null, dayId);
        break;
      // builder: learner-assembled sentences, runtime TTS only
    }
  }
}

const out = {
  pack: manifest.packId,
  language: manifest.language,
  locale: manifest.locale,
  cast: (manifest.cast || []).map((c) => c.name),
  lessons: lessonsSeen,
  count: lines.size,
  lines: [...lines.values()].map((e) => ({
    text: e.text,
    file: e.file,
    speakers: [...e.speakers],
    days: [...e.days],
  })),
};

process.stdout.write(JSON.stringify(out, null, 1) + '\n');
console.error(
  `${manifest.packId}: ${lines.size} unique voiced lines across ${lessonsSeen} lessons`
);
