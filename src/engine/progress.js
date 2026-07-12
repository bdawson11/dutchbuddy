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

// Profile namespace prefix for other per-user stores (e.g. practice decks).
export function nsPrefix() {
  return ns();
}

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

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function touchStreak(p) {
  const today = todayStr();
  if (p.lastActive === today) return;
  if (p.lastActive) {
    const diff = (new Date(today) - new Date(p.lastActive)) / 86400000;
    p.streak = diff === 1 ? (p.streak || 0) + 1 : 1;
  } else {
    p.streak = 1;
  }
  p.lastActive = today;
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
    streak: p.streak || 0,
  };
}
