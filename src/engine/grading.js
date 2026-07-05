// Grading for typed and dictation blocks.
// Normalize: trim, lowercase, collapse whitespace, strip terminal punctuation.
// Diacritic-tolerant (default on for Dutch: een/één) — a match that only
// works after stripping diacritics is flagged so the UI can show a gentle note.

function normalize(s) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?,;:]+$/g, '');
}

function stripDiacritics(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function grade(input, answers, { diacriticTolerant = true } = {}) {
  const given = normalize(input);
  for (const a of answers) {
    if (normalize(a) === given) return { correct: true, exact: true };
  }
  if (diacriticTolerant) {
    const bare = stripDiacritics(given);
    for (const a of answers) {
      if (stripDiacritics(normalize(a)) === bare) {
        return { correct: true, exact: false, note: `Watch the accents: ${answers[0]}` };
      }
    }
  }
  return { correct: false };
}
