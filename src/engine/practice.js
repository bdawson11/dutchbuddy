// Practice data layer. Palm cards and pronunciation lines are derived from
// lesson content the packs already ship — chips items become flip cards,
// shadow/dialogue lines become pronunciation material — so practice needs no
// separate authoring and grows automatically as lessons are added.
//
// Card memory is a light Leitner ladder: box 0-4 per card, "Again" drops a
// card to 0, "Got it" climbs one rung. Sessions deal low boxes first so shaky
// cards come back sooner. State persists per profile + pack.

import { loadProgress, nsPrefix } from './progress';

const deckKey = (packId) => `practice.${nsPrefix()}${packId}.cards`;

// Days in scope: 'mine' = days the learner has opened (fall back to the first
// week for brand-new learners so practice is never empty), 'all' = everything.
export function scopeDays(manifest, packId, scope) {
  const all = manifest.weeks.flatMap((w) => w.days);
  if (scope === 'all') return all;
  const started = new Set(Object.keys(loadProgress(packId).days));
  const mine = all.filter((d) => started.has(d));
  return mine.length ? mine : all.slice(0, 7);
}

// Flip cards from chips items ({nl, en, speak}). Deduped by front text,
// keeping the earliest day so cards can say where they came from.
export function buildCards(lessonIndex, days) {
  const seen = new Map();
  for (const dayId of days) {
    const lesson = lessonIndex[dayId];
    if (!lesson) continue;
    for (const block of lesson.blocks || []) {
      if (block.type !== 'chips') continue;
      for (const item of block.items || []) {
        if (!item.nl || !item.en || seen.has(item.nl)) continue;
        seen.set(item.nl, {
          id: item.nl,
          front: item.nl,
          back: item.en,
          speak: item.speak || item.nl,
          day: lesson.day,
        });
      }
    }
  }
  return [...seen.values()];
}

// Pronunciation lines from shadow (built for repetition) and dialogue blocks.
export function buildLines(lessonIndex, days) {
  const seen = new Map();
  for (const dayId of days) {
    const lesson = lessonIndex[dayId];
    if (!lesson) continue;
    for (const block of lesson.blocks || []) {
      if (block.type !== 'shadow' && block.type !== 'dialogue') continue;
      for (const line of block.lines || []) {
        const text = line.nl?.trim();
        if (!text || text.length < 2 || seen.has(text)) continue;
        seen.set(text, {
          text,
          en: line.en || '',
          speaker: block.type === 'dialogue' ? line.speaker : null,
          day: lesson.day,
        });
      }
    }
  }
  return [...seen.values()];
}

export function loadDeck(packId) {
  try {
    return JSON.parse(localStorage.getItem(deckKey(packId))) || {};
  } catch {
    return {};
  }
}

export function rateCard(packId, id, gotIt) {
  const deck = loadDeck(packId);
  const cur = deck[id] || { box: 0, seen: 0 };
  deck[id] = {
    box: gotIt ? Math.min(cur.box + 1, 4) : 0,
    seen: cur.seen + 1,
    last: Date.now(),
  };
  try {
    localStorage.setItem(deckKey(packId), JSON.stringify(deck));
  } catch {
    /* storage unavailable — the session still works, it just won't remember */
  }
  return deck[id];
}

export function deckStats(cards, deck) {
  const known = cards.filter((c) => (deck[c.id]?.box || 0) >= 3).length;
  return { total: cards.length, known };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Deal a session: shuffle, then deal shaky boxes before solid ones.
export function dealCards(cards, deck, n = 20) {
  return shuffle(cards)
    .sort((a, b) => (deck[a.id]?.box || 0) - (deck[b.id]?.box || 0))
    .slice(0, n);
}

export function dealLines(lines, n = 8) {
  return shuffle(lines).slice(0, n);
}

// Word-overlap score for the optional mic check: how much of the target came
// back in the recognized speech. Tolerant on purpose — recognition output has
// its own quirks, and the goal is encouragement, not grading.
export function matchScore(target, heard) {
  const words = (s) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}' ]+/gu, ' ')
      .split(/\s+/)
      .filter(Boolean);
  const t = words(target);
  if (!t.length) return 0;
  const pool = words(heard);
  let hit = 0;
  for (const w of t) {
    const at = pool.indexOf(w);
    if (at >= 0) {
      hit++;
      pool.splice(at, 1);
    }
  }
  return hit / t.length;
}
