import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grade, configureGrading, _internal } from '../src/engine/grading.js';

const { normalize, editDistance } = _internal;

test('normalize: case, whitespace, terminal punctuation, quotes', () => {
  assert.equal(normalize('  Goedemorgen!  '), 'goedemorgen');
  assert.equal(normalize('Ik   ben  hier.'), 'ik ben hier');
  assert.equal(normalize('“Hoi.”'), 'hoi');
  assert.equal(normalize('’t is koud'), "'t is koud");
  assert.equal(normalize('vrĳ'), 'vrij');
  assert.equal(normalize('een maan'), 'een maan');
});

test('exact match', () => {
  assert.deepEqual(grade('maan', ['maan', 'de maan']), { correct: true, exact: true });
  assert.deepEqual(grade('De maan.', ['maan', 'de maan']), { correct: true, exact: true });
});

test('diacritic-tolerant match flags the spelling', () => {
  const r = grade('een', ['één']);
  assert.equal(r.correct, true);
  assert.equal(r.exact, false);
  assert.match(r.note, /één/);
});

test('diacritic tolerance can be turned off per pack', () => {
  configureGrading({ diacriticTolerant: false });
  assert.equal(grade('een', ['één']).correct, false);
  configureGrading({});
  assert.equal(grade('een', ['één']).correct, true);
});

test('ñ is never an optional accent', () => {
  assert.equal(grade('ano', ['año']).correct, false);
});

test('ß accepts ss', () => {
  assert.equal(grade('strasse', ['Straße']).correct, true);
});

test('near miss is not correct but is reported', () => {
  const r = grade('gezelig', ['gezellig']);
  assert.equal(r.correct, false);
  assert.equal(r.near, true);
  assert.equal(r.closest, 'gezellig');
  // adjacent swap
  assert.equal(grade('geozd', ['goed']).near, undefined);
  assert.equal(grade('geod', ['goed']).near, true);
  // short words get no slack
  assert.equal(grade('dat', ['dag']).near, undefined);
  // sentences allow two slips
  assert.equal(grade('om negen uur ga ik naar mijn wrk', ['Om negen uur ga ik naar mijn werk']).near, true);
  // but not three
  assert.equal(grade('om negen ur ga ik nar mijn wrk', ['Om negen uur ga ik naar mijn werk']).near, undefined);
});

test('empty input is simply wrong', () => {
  assert.deepEqual(grade('   ', ['maan']), { correct: false });
});

test('editDistance', () => {
  assert.equal(editDistance('abc', 'abc', 2), 0);
  assert.equal(editDistance('abc', 'abd', 2), 1);
  assert.equal(editDistance('abc', 'acb', 2), 1);
  assert.equal(editDistance('abc', 'xyz', 2), 3);
});
