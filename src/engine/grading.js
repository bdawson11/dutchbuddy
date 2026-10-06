// Grading for typed and dictation blocks.
// Normalize: trim, lowercase, collapse whitespace, strip terminal punctuation.
// Diacritic-tolerant (default on; per-pack override via manifest.grading) — a
// match that only works after stripping diacritics is flagged so the UI can
// show a gentle note.

function normalize(s) {
  return s.normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?,;:]+$/g, '');
}

function stripDiacritics(s) {
  // NFD-decompose, recompose the tilde on n first — ñ is a distinct
  // letter in Spanish (año vs ano), never an optional accent — then drop
  // the remaining combining marks. ß -> ss covers the common German
  // ASCII-keyboard substitution.
  return s
    .normalize('NFD')
    .replace(/ñ/g, 'ñ')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .normalize('NFC');
}

// Per-pack defaults, set from manifest.grading at pack load.
let packOpts = {};
export function configureGrading(opts) {
  packOpts = opts || {};
}

export function grade(input, answers, opts) {
  const { diacriticTolerant = true } = { ...packOpts, ...opts };
  const given = normalize(input);
  for (const a of answers) {
    if (normalize(a) === given) return { correct: true, exact: true };
  }
  if (diacriticTolerant) {
    const bare = stripDiacritics(given);
    for (const a of answers) {
      if (stripDiacritics(normalize(a)) === bare) {
        return { correct: true, exact: false, note: `Watch the spelling: ${answers[0]}` };
      }
    }
  }
  return { correct: false };
}

// Spoken (or typed) answers in practice role-plays. Speech recognizers vary in
// spacing, punctuation and capitalisation, so instead of a full-sentence match
// the answer must contain every keyword group: each group is a list of
// acceptable alternatives, matched as whole words. A keyword may span or merge
// words ("havermelk" matches "haver melk"). `heard` is the recognizer's list
// of alternatives; any one passing is enough.
function words(s) {
  return stripDiacritics(s.normalize('NFC').toLowerCase())
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

function containsKeyword(tokens, keyword) {
  const target = words(keyword).join('');
  if (!target) return false;
  for (let i = 0; i < tokens.length; i++) {
    let joined = '';
    for (let j = i; j < tokens.length && joined.length < target.length; j++) {
      joined += tokens[j];
      if (joined === target) return true;
    }
  }
  return false;
}

export function matchSpoken(heard, keywordGroups) {
  const list = Array.isArray(heard) ? heard : [heard];
  for (const h of list) {
    const tokens = words(h || '');
    if (tokens.length && keywordGroups.every((g) => g.some((k) => containsKeyword(tokens, k)))) {
      return { correct: true, heard: h };
    }
  }
  return { correct: false, heard: list[0] || '' };
}
