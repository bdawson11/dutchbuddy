// Progress layer. All state in localStorage, keyed by packId so multiple
// language packs coexist on one device, and namespaced by the active YapWorld
// profile so multiple learners can share a device. Shape:
// { days: { "day-01": { status, stepsDone, totalSteps, timeSec, completedAt } },
//   lastActive: "YYYY-MM-DD", streak: n }

let uid = '';
// Set by AppShell whenever the signed-in profile changes. Empty = the legacy
// device-wide namespace (used before anyone logs in).
export function setProgressUser(id) {
  uid = id || '';
}
const ns = () => (uid ? `${uid}.` : '');
const key = (packId) => `progress.${ns()}${packId}`;

export function loadProgress(packId) {
  try {
    return JSON.parse(localStorage.getItem(key(packId))) || { days: {}, streak: 0, lastActive: null };
  } catch {
    return { days: {}, streak: 0, lastActive: null };
  }
}

function save(packId, p) {
  localStorage.setItem(key(packId), JSON.stringify(p));
  return p;
}

// Local calendar date (not UTC): a learner in Amsterdam at 23:30 is still on
// today's streak, and one at 00:30 has started tomorrow's.
export function todayStr(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function daysBetween(a, b) {
  // Both are YYYY-MM-DD; compare as UTC midnights so DST never yields 0.96 days.
  const toUtc = (s) => Date.UTC(...s.split('-').map((x, i) => (i === 1 ? +x - 1 : +x)));
  return Math.round((toUtc(b) - toUtc(a)) / 86400000);
}

export function touchStreak(p, today = todayStr()) {
  if (p.lastActive === today) return p;
  if (p.lastActive) {
    const diff = daysBetween(p.lastActive, today);
    p.streak = diff === 1 ? (p.streak || 0) + 1 : 1;
  } else {
    p.streak = 1;
  }
  p.lastActive = today;
  return p;
}

// The streak shown on the dashboard: a streak is only alive if the learner
// was active today or yesterday. Stored streak is left untouched so a
// same-day return still continues it.
export function currentStreak(p, today = todayStr()) {
  if (!p.lastActive || !p.streak) return 0;
  return daysBetween(p.lastActive, today) <= 1 ? p.streak : 0;
}

export function recordStep(packId, dayId, stepIndex, totalSteps) {
  const p = loadProgress(packId);
  const d = p.days[dayId] || { status: 'in-progress', steps: [], timeSec: 0 };
  if (!d.steps.includes(stepIndex)) d.steps.push(stepIndex);
  d.totalSteps = totalSteps;
  if (d.steps.length >= totalSteps && d.status !== 'complete') {
    d.status = 'complete';
    d.completedAt = new Date().toISOString();
  } else if (d.status !== 'complete') {
    d.status = 'in-progress';
  }
  p.days[dayId] = d;
  touchStreak(p);
  return save(packId, p);
}

export function recordTime(packId, dayId, seconds) {
  const p = loadProgress(packId);
  const d = p.days[dayId] || { status: 'in-progress', steps: [], timeSec: 0 };
  d.timeSec = (d.timeSec || 0) + seconds;
  p.days[dayId] = d;
  return save(packId, p);
}

export function saveJournal(packId, dayId, blockIndex, text) {
  localStorage.setItem(`journal.${ns()}${packId}.${dayId}.${blockIndex}`, text);
}

export function loadJournal(packId, dayId, blockIndex) {
  return localStorage.getItem(`journal.${ns()}${packId}.${dayId}.${blockIndex}`) || '';
}

export function resetProgress(packId) {
  localStorage.removeItem(key(packId));
  localStorage.removeItem(vocabKey(packId));
  Object.keys(localStorage)
    .filter((k) => k.startsWith(`journal.${ns()}${packId}.`))
    .forEach((k) => localStorage.removeItem(k));
}

export function stats(packId) {
  const p = loadProgress(packId);
  const days = Object.values(p.days);
  return {
    daysStarted: days.length,
    daysComplete: days.filter((d) => d.status === 'complete').length,
    stepsDone: days.reduce((s, d) => s + (d.steps?.length || 0), 0),
    timeMin: Math.round(days.reduce((s, d) => s + (d.timeSec || 0), 0) / 60),
    streak: currentStreak(p),
  };
}

// ---------- vocabulary review (spaced repetition over chips) ----------
// One record per word: { box, seen, missed, last }. Leitner boxes 0–4; a word
// in box n is due again after BOX_DAYS[n] days. Keyed by the word's nl text.

const BOX_DAYS = [0, 1, 3, 7, 14];
const vocabKey = (packId) => `vocab.${ns()}${packId}`;

export function loadVocab(packId) {
  try {
    return JSON.parse(localStorage.getItem(vocabKey(packId))) || {};
  } catch {
    return {};
  }
}

function saveVocab(packId, v) {
  localStorage.setItem(vocabKey(packId), JSON.stringify(v));
  return v;
}

export function isDue(rec, today = todayStr()) {
  if (!rec || !rec.last) return true;
  const box = Math.min(rec.box || 0, BOX_DAYS.length - 1);
  const toUtc = (s) => Date.UTC(...s.split('-').map((x, i) => (i === 1 ? +x - 1 : +x)));
  return (toUtc(today) - toUtc(rec.last)) / 86400000 >= BOX_DAYS[box];
}

// Record one flashcard outcome. Known → up a box (max 4); missed → back to 0.
export function recordVocab(packId, word, known, today = todayStr()) {
  const v = loadVocab(packId);
  const r = v[word] || { box: 0, seen: 0, missed: 0, last: null };
  r.seen += 1;
  if (known) r.box = Math.min((r.box || 0) + 1, BOX_DAYS.length - 1);
  else {
    r.box = 0;
    r.missed += 1;
  }
  r.last = today;
  v[word] = r;
  saveVocab(packId, v);
  return r;
}

// Pick a session: due words first (lowest box first, then least recently
// seen), topped up with unseen words, capped at `limit`.
export function pickVocabSession(packId, words, limit = 20, today = todayStr()) {
  const v = loadVocab(packId);
  const due = words.filter((w) => isDue(v[w.nl], today));
  due.sort((a, b) => {
    const ra = v[a.nl] || { box: -1, last: '' };
    const rb = v[b.nl] || { box: -1, last: '' };
    // unseen (box -1) after due-known words? No: unseen words are new material,
    // put weakest known words first, then unseen, then the rest by staleness.
    const ka = ra.box === -1 ? 0.5 : ra.box;
    const kb = rb.box === -1 ? 0.5 : rb.box;
    if (ka !== kb) return ka - kb;
    return (ra.last || '').localeCompare(rb.last || '');
  });
  return due.slice(0, limit);
}

export function vocabStats(packId, words) {
  const v = loadVocab(packId);
  let known = 0;
  let due = 0;
  for (const w of words) {
    const r = v[w.nl];
    if (r && r.box >= 3) known += 1;
    if (isDue(r)) due += 1;
  }
  return { total: words.length, known, due };
}
