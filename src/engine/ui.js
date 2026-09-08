// Per-pack UI chrome strings. Configured from manifest.ui at pack load;
// every key falls back to an English default so packs without a ui block
// (or screens rendered before the manifest arrives) still work.

let strings = {};
let language = '';
let specialChars = [];

export function configureUi(manifest) {
  strings = manifest.ui || {};
  language = manifest.language || '';
  specialChars = Array.isArray(manifest.specialChars) ? manifest.specialChars : [];
}

export function ui(key, fallback) {
  const s = strings[key];
  return s === undefined ? fallback : s;
}

export function packLanguage() {
  return language;
}

// Characters a learner may not have on their keyboard (é ë ï … for Dutch),
// offered as tap-to-insert keys under typed inputs.
export function packSpecialChars() {
  return specialChars;
}
