#!/usr/bin/env node
// Catalog-driven validation. Run: node tools/validate-all.js
// Reads public/packs/catalog.json and runs tools/validate.js over every listed
// pack. A pack whose manifest declares "released": true is validated with
// --strict (missing days become errors). Exits nonzero if any pack fails, so
// adding a pack to the catalog is all CI ever needs.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packsRoot = path.join(root, 'public', 'packs');
const validator = path.join(root, 'tools', 'validate.js');

const catalog = JSON.parse(fs.readFileSync(path.join(packsRoot, 'catalog.json'), 'utf8'));
const packIds = catalog.packs || [];

const results = [];
for (const id of packIds) {
  const packDir = path.join(packsRoot, id);
  let released = false;
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(packDir, 'manifest.json'), 'utf8'));
    released = manifest.released === true;
  } catch {
    // Missing/broken manifest surfaces as a validator failure below.
  }
  const args = [validator, packDir];
  if (released) args.push('--strict');
  const run = spawnSync(process.execPath, args, { encoding: 'utf8' });
  process.stdout.write(run.stdout || '');
  process.stderr.write(run.stderr || '');
  results.push({ id, released, ok: run.status === 0 });
}

console.log('\n=== Pack validation summary ===');
for (const r of results) {
  console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.id}${r.released ? ' (released, strict)' : ''}`);
}

const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.log(`\n${failed.length} pack(s) failed validation.`);
  process.exit(1);
}
console.log(`\nAll ${results.length} pack(s) passed.`);
