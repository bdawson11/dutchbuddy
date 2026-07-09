#!/usr/bin/env node
// Schema v1 → v2 migration for a content pack. Run: node tools/migrate-pack.js <pack-dir>
// Renames the target-language text field `nl` → `target` in every lesson block
// item/line, sets each lesson's schemaVersion to 2, and bumps the pack
// manifest's schemaVersion to 2. Idempotent — re-running is a no-op.
//
// The rename is a text-level substitution (it preserves the file's existing
// formatting rather than reserializing) but is guarded: it only runs if every
// `"nl":` token in the file is a genuine object key, and the result must parse
// back to JSON with no `nl` keys left. Both checks make it safe against ever
// touching a `nl` that lives inside string content.

import fs from 'node:fs';
import path from 'node:path';

const packDir = process.argv[2];
if (!packDir) {
  console.error('Usage: node tools/migrate-pack.js <pack-dir>');
  process.exit(2);
}

// Count object keys literally named "nl", recursing arrays + nested objects.
function countNlKeys(value) {
  let n = 0;
  const stack = [value];
  while (stack.length) {
    const v = stack.pop();
    if (Array.isArray(v)) stack.push(...v);
    else if (v && typeof v === 'object') {
      for (const [k, val] of Object.entries(v)) {
        if (k === 'nl') n++;
        stack.push(val);
      }
    }
  }
  return n;
}

function bumpSchemaVersion(text) {
  return text.replace(/("schemaVersion"\s*:\s*)\d+/, '$12');
}

// Rewrite a lesson: rename nl keys, bump schemaVersion. Returns true if changed.
function migrateLesson(file) {
  const before = fs.readFileSync(file, 'utf8');
  const obj = JSON.parse(before);
  const nlKeys = countNlKeys(obj);
  const rawTokens = (before.match(/"nl"\s*:/g) || []).length;
  if (rawTokens !== nlKeys) {
    throw new Error(`${file}: ${rawTokens} "nl": tokens but ${nlKeys} nl keys — unsafe to rename by text`);
  }
  let after = before.replace(/"nl"(\s*:)/g, '"target"$1');
  after = bumpSchemaVersion(after);
  // Safety: result must parse and carry no leftover nl keys.
  if (countNlKeys(JSON.parse(after)) !== 0) {
    throw new Error(`${file}: nl keys survived migration`);
  }
  if (after !== before) {
    fs.writeFileSync(file, after);
    return true;
  }
  return false;
}

// ---------- manifest ----------
const manifestPath = path.join(packDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error(`No manifest.json in ${packDir}`);
  process.exit(1);
}
const manifestBefore = fs.readFileSync(manifestPath, 'utf8');
const manifestAfter = bumpSchemaVersion(manifestBefore);
const manifestChanged = manifestAfter !== manifestBefore;
if (manifestChanged) fs.writeFileSync(manifestPath, manifestAfter);

// ---------- lessons ----------
const lessonsDir = path.join(packDir, 'lessons');
let changed = 0;
let total = 0;
if (fs.existsSync(lessonsDir)) {
  for (const name of fs.readdirSync(lessonsDir).sort()) {
    if (!name.endsWith('.json')) continue;
    total++;
    if (migrateLesson(path.join(lessonsDir, name))) changed++;
  }
}

console.log(`Migrated ${packDir}: manifest ${manifestChanged ? 'updated' : 'already v2'}, ${changed}/${total} lessons rewritten.`);
