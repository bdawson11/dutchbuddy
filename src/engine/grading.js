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
