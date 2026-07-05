// Tests for the localStorage progress layer (src/engine/progress.js).
// Uses an in-memory localStorage shim: methods are non-enumerable, stored
// values are enumerable own properties, so Object.keys(localStorage) returns
// only stored keys (as resetProgress relies on).
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

function makeLocalStorage() {
  const ls = {};
  Object.defineProperties(ls, {
    getItem: { value: (k) => (Object.prototype.hasOwnProperty.call(ls, k) ? ls[k] : null) },
    setItem: { value: (k, v) => { ls[k] = String(v); } },
    removeItem: { value: (k) => { delete ls[k]; } },
  });
  return ls;
}

globalThis.localStorage = makeLocalStorage();
const {
  loadProgress, recordStep, recordTime, saveJournal, loadJournal, resetProgress, stats,
} = await import('../src/engine/progress.js');

const PACK = 'dutch-nl-v1';
beforeEach(() => { for (const k of Object.keys(localStorage)) delete localStorage[k]; });

test('fresh progress is empty', () => {
  const p = loadProgress(PACK);
  assert.deepEqual(p.days, {});
  assert.equal(p.streak, 0);
});

test('recording steps marks a day complete only when all steps are done', () => {
  recordStep(PACK, 'day-01', 0, 3);
  recordStep(PACK, 'day-01', 1, 3);
  assert.equal(loadProgress(PACK).days['day-01'].status, 'in-progress');
  recordStep(PACK, 'day-01', 2, 3);
  assert.equal(loadProgress(PACK).days['day-01'].status, 'complete');
});

test('duplicate step indices are not double-counted', () => {
  recordStep(PACK, 'day-01', 0, 3);
  recordStep(PACK, 'day-01', 0, 3);
  assert.equal(loadProgress(PACK).days['day-01'].steps.length, 1);
});

test('stats aggregate across days', () => {
  recordStep(PACK, 'day-01', 0, 2);
  recordStep(PACK, 'day-01', 1, 2); // complete
  recordStep(PACK, 'day-02', 0, 4); // in-progress
  recordTime(PACK, 'day-01', 120);
  const s = stats(PACK);
  assert.equal(s.daysStarted, 2);
  assert.equal(s.daysComplete, 1);
  assert.equal(s.stepsDone, 3);
  assert.equal(s.timeMin, 2);
});

test('journal round-trips per block', () => {
  saveJournal(PACK, 'day-01', 6, 'De g is lastig.');
  assert.equal(loadJournal(PACK, 'day-01', 6), 'De g is lastig.');
  assert.equal(loadJournal(PACK, 'day-01', 99), '');
});

test('reset clears progress and journals for the pack', () => {
  recordStep(PACK, 'day-01', 0, 2);
  saveJournal(PACK, 'day-01', 6, 'iets');
  resetProgress(PACK);
  assert.deepEqual(loadProgress(PACK).days, {});
  assert.equal(loadJournal(PACK, 'day-01', 6), '');
});

test('streak increments on a consecutive day and resets after a gap', () => {
  const day = (offsetDays) => new Date(Date.now() - offsetDays * 86400000).toISOString().slice(0, 10);
  // seed: active yesterday with a streak of 3
  localStorage.setItem(`progress.${PACK}`, JSON.stringify({ days: {}, streak: 3, lastActive: day(1) }));
  recordStep(PACK, 'day-01', 0, 1);
  assert.equal(loadProgress(PACK).streak, 4);

  // seed: active 3 days ago -> streak resets to 1
  localStorage.setItem(`progress.${PACK}`, JSON.stringify({ days: {}, streak: 9, lastActive: day(3) }));
  recordStep(PACK, 'day-02', 0, 1);
  assert.equal(loadProgress(PACK).streak, 1);
});

test('same-day activity does not inflate the streak', () => {
  recordStep(PACK, 'day-01', 0, 2);
  const first = loadProgress(PACK).streak;
  recordStep(PACK, 'day-01', 1, 2);
  assert.equal(loadProgress(PACK).streak, first);
});
