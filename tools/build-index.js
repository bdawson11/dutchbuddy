#!/usr/bin/env node
// Builds public/packs/<pack>/index.json: the lesson metadata the dashboard
// needs (title, emoji, summary…) for every authored day, so the app loads one
// small file per pack instead of fetching every lesson up front. Lessons are
// then fetched lazily when opened.
//
// Run: node tools/build-index.js [pack-dir ...]   (default: every pack in catalog)
// The validator fails if an index is missing or stale, so re-run after any
// content change (npm run index).

import fs from 'node:fs';
import path from 'node:path';

export const INDEX_FIELDS = ['day', 'module', 'unit', 'kind', 'title', 'emoji', 'level', 'durationMin', 'summary'];

export function buildIndex(packDir) {
  const manifest = JSON.parse(fs.readFileSync(path.join(packDir, 'manifest.json'), 'utf8'));
  const days = {};
  for (const dayId of manifest.weeks.flatMap((w) => w.days)) {
    const file = path.join(packDir, 'lessons', `${dayId}.json`);
    if (!fs.existsSync(file)) continue;
    const lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
    const meta = {};
    for (const f of INDEX_FIELDS) if (lesson[f] !== undefined) meta[f] = lesson[f];
    meta.steps = Array.isArray(lesson.blocks) ? lesson.blocks.length : 0;
    days[dayId] = meta;
  }
  return { schemaVersion: 1, packId: manifest.packId, days };
}

export function serializeIndex(index) {
  return JSON.stringify(index, null, 2) + '\n';
}

export function writeIndex(packDir) {
  const out = path.join(packDir, 'index.json');
  const text = serializeIndex(buildIndex(packDir));
  const changed = !fs.existsSync(out) || fs.readFileSync(out, 'utf8') !== text;
  if (changed) fs.writeFileSync(out, text);
  return { file: out, days: Object.keys(JSON.parse(text).days).length, changed };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname;
if (isMain) {
  let dirs = process.argv.slice(2);
  if (dirs.length === 0) {
    const catalog = JSON.parse(fs.readFileSync('public/packs/catalog.json', 'utf8'));
    dirs = catalog.packs.map((id) => path.join('public/packs', id));
  }
  for (const d of dirs) {
    const r = writeIndex(d);
    console.log(`${r.changed ? 'wrote' : 'up to date'} ${r.file} (${r.days} days)`);
  }
}
