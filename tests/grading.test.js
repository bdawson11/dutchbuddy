// Tests for the fuzzy grader (src/engine/grading.js).
// Run: npm test  (Node's built-in runner, no dependencies).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grade } from '../src/engine/grading.js';

test('exact match passes', () => {
  assert.equal(grade('maan', ['maan']).correct, true);
});

test('normalizes case, surrounding whitespace, and terminal punctuation', () => {
  assert.equal(grade('  Maan.  ', ['maan']).correct, true);
  assert.equal(grade('Goedemorgen!', ['goedemorgen']).correct, true);
});

test('collapses internal whitespace', () => {
  assert.equal(grade('goede   morgen', ['goede morgen']).correct, true);
});

test('accepts any listed alternate', () => {
  const answers = ['het is', "'t is"];
  assert.equal(grade("'t is", answers).correct, true);
  assert.equal(grade('het is', answers).correct, true);
});

test('diacritic-tolerant match flags a gentle correction with the accented form first', () => {
  const r = grade('een', ['één']);
  assert.equal(r.correct, true);
  assert.equal(r.exact, false);
  assert.match(r.note, /één/); // shows the properly-accented answer
});

test('exact accented answer is an exact match (no correction note)', () => {
  const r = grade('één', ['één']);
  assert.equal(r.correct, true);
  assert.equal(r.exact, true);
});

test('diacritic tolerance can be turned off per pack', () => {
  assert.equal(grade('een', ['één'], { diacriticTolerant: false }).correct, false);
});

test('wrong answer fails', () => {
  assert.equal(grade('man', ['maan']).correct, false);
});

test('empty input does not match a non-empty answer', () => {
  assert.equal(grade('', ['maan']).correct, false);
});
