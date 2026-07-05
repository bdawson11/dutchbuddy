// Audio abstraction. v1 backend: Web Speech API, voice chosen by pack locale.
// The interface (speak/stop/available) is the contract; a v2 backend playing
// pre-generated audio files (block.audioUrl) can replace the internals
// without touching lesson content or components.

let voice = null;
let locale = 'nl-NL';

export function configureAudio(packLocale) {
  locale = packLocale;
  if (!('speechSynthesis' in window)) return;
  const pick = () => {
    const voices = window.speechSynthesis.getVoices();
    voice =
      voices.find((v) => v.lang === locale && v.localService) ||
      voices.find((v) => v.lang === locale) ||
      voices.find((v) => v.lang.startsWith(locale.split('-')[0])) ||
      null;
  };
  pick();
  window.speechSynthesis.onvoiceschanged = pick;
}

export function audioAvailable() {
  return 'speechSynthesis' in window;
}

export function speak(text, { rate = 0.88 } = {}) {
  if (!audioAvailable()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = locale;
  if (voice) u.voice = voice;
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (audioAvailable()) window.speechSynthesis.cancel();
}
