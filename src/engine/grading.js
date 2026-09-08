// Grading for typed and dictation blocks.
// Normalize: trim, lowercase, collapse whitespace, strip terminal punctuation,
// unify typographic apostrophes/quotes and the ĳ ligature. Diacritic-tolerant
// (default on; per-pack override via manifest.grading) — a match that only
// works after stripping diacritics is flagged so the UI can show a gentle
// note. A near miss (one typo away) is reported as `near` so the UI can nudge
// without marking the answer correct.

function normalize(s) {
  return String(s)
    .normalize('NFC')
    .replace(/[‘’‚′`´]/g, "'") // curly / prime apostrophes → '
    .replace(/[“”„″]/g, '"')
    .replace(/ĳ/g, 'ij') // ĳ ligature → ij
    .replace(/Ĳ/g, 'IJ')
    .replace(/[   ]/g, ' ') // non-breaking spaces
    .replace(/,/g, ' ') // commas are never graded (omdat ik moe ben, ga ik…)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^"+/g, '') // a quoted answer is still the answer… (keep the ' of 't)
    .replace(/[\s.!?,;:…"]+$/g, '') // …and so is one ending in “Hoi.”
    .trim();
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

// Damerau-style edit distance (insert / delete / substitute / adjacent swap),
// capped so we bail out early on clearly different strings.
function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev2 = [];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prev2[j - 2] + 1);
      }
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2.splice(0, prev2.length, ...prev);
    prev = cur;
  }
  return prev[b.length];
}

// Per-pack defaults, set from manifest.grading at pack load.
let packOpts = {};
export function configureGrading(opts) {
  packOpts = opts || {};
}

export function grade(input, answers, opts) {
  const { diacriticTolerant = true, nearMiss = true } = { ...packOpts, ...opts };
  const given = normalize(input);
  if (!given) return { correct: false };
  const norm = answers.map((a) => normalize(a));
  if (norm.some((a) => a === given)) return { correct: true, exact: true };
  if (diacriticTolerant) {
    const bare = stripDiacritics(given);
    if (norm.some((a) => stripDiacritics(a) === bare)) {
      return { correct: true, exact: false, note: `Watch the spelling: ${answers[0]}` };
    }
  }
  if (nearMiss) {
    // One slip in a word of 4+ letters, two in a sentence of 12+ characters.
    const bare = stripDiacritics(given);
    for (let i = 0; i < norm.length; i++) {
      const target = stripDiacritics(norm[i]);
      const allowed = target.length >= 12 ? 2 : target.length >= 4 ? 1 : 0;
      if (allowed && editDistance(bare, target, allowed) <= allowed) {
        return { correct: false, near: true, closest: answers[i] };
      }
    }
  }
  return { correct: false };
}

export const _internal = { normalize, stripDiacritics, editDistance };
