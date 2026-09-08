// Audio abstraction. v1 backend: Web Speech API, voice chosen by pack locale.
// The interface (speak/stop/available) is the contract; a v2 backend playing
// pre-generated audio files (block.audioUrl) can replace the internals
// without touching lesson content or components.

let voice = null;
let locale = 'nl-NL';
let avoid = [];
let preferred = [];

const norm = (l) => String(l || '').replace('_', '-').toLowerCase();

// Voice choice, best first:
//   1. a voice explicitly preferred by the pack (manifest.audio.preferredVoices)
//   2. an exact locale match, local (on-device) voices before network ones
//   3. same language, but never a locale the pack contrasts itself against
//      (manifest.audio.avoidLocales — e.g. Netherlands Dutch avoids nl-BE)
//   4. anything in the language at all
export function pickVoice(voices, opts = {}) {
  const loc = norm(opts.locale || locale);
  const lang = loc.split('-')[0];
  const bad = new Set((opts.avoid || avoid).map(norm));
  const wanted = (opts.preferred || preferred).map((n) => n.toLowerCase());
  const inLang = voices.filter((v) => norm(v.lang).startsWith(lang));
  return (
    inLang.find((v) => wanted.some((w) => v.name.toLowerCase().includes(w))) ||
    inLang.find((v) => norm(v.lang) === loc && v.localService) ||
    inLang.find((v) => norm(v.lang) === loc) ||
    inLang.find((v) => !bad.has(norm(v.lang))) ||
    inLang[0] ||
    null
  );
}

export function configureAudio(packLocale, audioOpts = {}) {
  locale = packLocale || locale;
  avoid = audioOpts.avoidLocales || [];
  preferred = audioOpts.preferredVoices || [];
  voice = null;
  if (!audioAvailable()) return;
  const pick = () => {
    voice = pickVoice(window.speechSynthesis.getVoices());
  };
  pick();
  // Voices load asynchronously in Chrome/Safari; keep listening.
  window.speechSynthesis.removeEventListener?.('voiceschanged', pick);
  window.speechSynthesis.addEventListener?.('voiceschanged', pick);
}

export function audioAvailable() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text, { rate = 0.88 } = {}) {
  if (!audioAvailable()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = locale;
  if (!voice) voice = pickVoice(window.speechSynthesis.getVoices());
  if (voice) u.voice = voice;
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (audioAvailable()) window.speechSynthesis.cancel();
}
