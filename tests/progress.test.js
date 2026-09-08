import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Minimal localStorage shim for the progress layer.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  key: (i) => [...store.keys()][i],
  get length() { return store.size; },
};
Object.defineProperty(globalThis.localStorage, 'keys', { value: () => [...store.keys()] });
// progress.js uses Object.keys(localStorage) for journal cleanup.
const origKeys = Object.keys;
Object.keys = (o) => (o === globalThis.localStorage ? [...store.keys()] : origKeys(o));

const {
  loadProgress, recordStep, recordTime, saveJournal, loadJournal, resetProgress, stats,
  setProgressUser, touchStreak, currentStreak, todayStr,
} = await import('../src/engine/progress.js');

beforeEach(() => { store.clear(); setProgressUser(null); });

test('todayStr is a local calendar date', () => {
  assert.equal(todayStr(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
  assert.equal(todayStr(new Date(2026, 11, 31, 0, 1)), '2026-12-31');
});

test('touchStreak: consecutive days grow, gaps reset, same day is idempotent', () => {
  const p = { streak: 0, lastActive: null };
  touchStreak(p, '2026-03-01'); assert.equal(p.streak, 1);
  touchStreak(p, '2026-03-01'); assert.equal(p.streak, 1);
  touchStreak(p, '2026-03-02'); assert.equal(p.streak, 2);
  touchStreak(p, '2026-03-04'); assert.equal(p.streak, 1);
  // across a DST change and a month boundary
  touchStreak(p, '2026-03-28'); touchStreak(p, '2026-03-29'); touchStreak(p, '2026-03-30');
  assert.equal(p.streak, 3);
  touchStreak(p, '2026-03-31'); touchStreak(p, '2026-04-01');
  assert.equal(p.streak, 5);
});

test('currentStreak dies after a missed day', () => {
  const p = { streak: 4, lastActive: '2026-03-10' };
  assert.equal(currentStreak(p, '2026-03-10'), 4);
  assert.equal(currentStreak(p, '2026-03-11'), 4);
  assert.equal(currentStreak(p, '2026-03-12'), 0);
});

test('recordStep completes a day once every step is done', () => {
  recordStep('p', 'day-01', 0, 3);
  assert.equal(loadProgress('p').days['day-01'].status, 'in-progress');
  recordStep('p', 'day-01', 1, 3);
  recordStep('p', 'day-01', 1, 3); // duplicate step
  recordStep('p', 'day-01', 2, 3);
  const d = loadProgress('p').days['day-01'];
  assert.equal(d.status, 'complete');
  assert.deepEqual(d.steps, [0, 1, 2]);
  assert.ok(d.completedAt);
  assert.equal(stats('p').daysComplete, 1);
  assert.equal(stats('p').stepsDone, 3);
});

test('progress is namespaced per profile and per pack', () => {
  setProgressUser('alex-1');
  recordStep('dutch', 'day-01', 0, 1);
  assert.equal(stats('dutch').daysComplete, 1);
  assert.equal(stats('german').daysComplete, 0);
  setProgressUser('sam-2');
  assert.equal(stats('dutch').daysComplete, 0);
});

test('journal + reset', () => {
  saveJournal('p', 'day-01', 5, 'Hoi!');
  assert.equal(loadJournal('p', 'day-01', 5), 'Hoi!');
  recordTime('p', 'day-01', 90);
  assert.equal(stats('p').timeMin, 2);
  resetProgress('p');
  assert.equal(loadJournal('p', 'day-01', 5), '');
  assert.equal(stats('p').daysStarted, 0);
});
