// Device-local profiles ("login") for YapWorld.
//
// The app is a static SPA with no backend, so this is not server-backed auth:
// a "profile" is a local identity (name + optional email) stored in
// localStorage, and progress is namespaced per profile so several learners can
// share one device. The surface (currentUser / login / logout / switchTo) is
// deliberately backend-shaped: swapping in a real auth provider later means
// reimplementing these four functions, with no change to their callers.

const PROFILES = 'yapworld.profiles';
const CURRENT = 'yapworld.currentUser';

function readProfiles() {
  try {
    return JSON.parse(localStorage.getItem(PROFILES)) || {};
  } catch {
    return {};
  }
}

function writeProfiles(p) {
  localStorage.setItem(PROFILES, JSON.stringify(p));
}

function slug(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'learner';
}

export function listProfiles() {
  return Object.values(readProfiles()).sort((a, b) => (b.lastSeen || '').localeCompare(a.lastSeen || ''));
}

export function currentUser() {
  const id = localStorage.getItem(CURRENT);
  if (!id) return null;
  return readProfiles()[id] || null;
}

// Resume a profile with the same name (case-insensitive) or create a new one,
// then set it as the current user.
export function login(name, email) {
  const profiles = readProfiles();
  const now = new Date().toISOString();
  let user = Object.values(profiles).find((u) => u.name.toLowerCase() === name.trim().toLowerCase());
  if (user) {
    user = { ...user, lastSeen: now, email: (email || user.email || '').trim() };
  } else {
    const id = `${slug(name)}-${Object.keys(profiles).length + 1}`;
    user = { id, name: name.trim(), email: (email || '').trim(), createdAt: now, lastSeen: now };
  }
  profiles[user.id] = user;
  writeProfiles(profiles);
  localStorage.setItem(CURRENT, user.id);
  return user;
}

export function switchTo(id) {
  const profiles = readProfiles();
  if (!profiles[id]) return null;
  profiles[id] = { ...profiles[id], lastSeen: new Date().toISOString() };
  writeProfiles(profiles);
  localStorage.setItem(CURRENT, id);
  return profiles[id];
}

export function logout() {
  localStorage.removeItem(CURRENT);
}

// The language a profile last chose, so returning users resume where they were.
export function getSelectedPack(userId) {
  return localStorage.getItem(`yapworld.${userId}.pack`) || null;
}

export function setSelectedPack(userId, packId) {
  const k = `yapworld.${userId}.pack`;
  if (packId) localStorage.setItem(k, packId);
  else localStorage.removeItem(k);
}
