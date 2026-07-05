// Pure, environment-agnostic helpers shared by the browser audio backend
// (src/engine/audio.js) and the offline TTS generator (tools/tts/*). A clip
// must be looked up at runtime under the exact key it was filed under during
// generation — keeping that logic in one place is what prevents drift.
//
// No DOM and no Node APIs live here on purpose, so it is safe to import from
// either side.

// Canonical lookup key for a spoken string: NFC-normalised, whitespace
// collapsed, trimmed, lower-cased. Casing and stray spacing must not split one
// utterance across two clips ("Goedemorgen" and "goedemorgen" are one clip).
export function normalizeSpoken(text) {
  return String(text).normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();
}
