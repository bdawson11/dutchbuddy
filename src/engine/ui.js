// Per-pack UI chrome strings. Configured from manifest.ui at pack load;
// every key falls back to an English default so packs without a ui block
// (or screens rendered before the manifest arrives) still work.

let strings = {};
let language = '';

export function configureUi(manifest) {
  strings = manifest.ui || {};
  language = manifest.language || '';
}

export function ui(key, fallback) {
  const s = strings[key];
  return s === undefined ? fallback : s;
}

export function packLanguage() {
  return language;
}
