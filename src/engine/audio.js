// Audio abstraction. Two backends behind one contract (speak/stop/available):
//
//   v2 (preferred): pre-generated neural clips rendered offline with Tortoise
//   TTS (see tools/tts/). When a pack ships an audio/index.json, spoken lines
//   play back as real recordings — accurate pronunciation the browser's
//   built-in voices can't match, especially for Dutch (the hard g, sch,
//   Scheveningen…).
//
//   v1 (fallback): the Web Speech API, voice chosen by pack locale. Used when a
//   pack has no generated audio, for a clip that hasn't been generated yet, or
//   for dynamically-composed text (e.g. the sentence builder) that can't be
//   pre-rendered.
//
// The interface is the contract; components call speak()/stopSpeaking() and
// never learn which backend served the sound.

import { normalizeSpoken } from './ttsKey';

let voice = null;
let locale = 'nl-NL';

// v2 clip registry: normalized text -> absolute clip URL. Empty until a pack
// with generated audio loads; speak() transparently falls back to v1 for any
// miss, so a partial or absent index is always safe.
let clips = new Map();
let clipBase = '';
let indexToken = 0; // guards against a stale index.json load clobbering a newer pack

let currentAudio = null; // the HTMLAudioElement currently playing a v2 clip, if any

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  voice =
    voices.find((v) => v.lang === locale && v.localService) ||
    voices.find((v) => v.lang === locale) ||
    voices.find((v) => v.lang.startsWith(locale.split('-')[0])) ||
    null;
}

// Called on every pack load. packBase is the pack's public path
// (e.g. "/packs/dutch-nl"); when omitted only the v1 backend is available.
export function configureAudio(packLocale, packBase) {
  locale = packLocale;
  clips = new Map();
  clipBase = '';
  const token = ++indexToken;

  if ('speechSynthesis' in window) {
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }

  if (!packBase) return;
  clipBase = `${packBase}/audio`;
  // Load the clip registry in the background. A miss here is not an error — the
  // pack simply has no generated audio and everything falls back to Web Speech.
  (async () => {
    try {
      const res = await fetch(`${clipBase}/index.json`);
      if (!res.ok) return;
      const index = await res.json();
      if (token !== indexToken) return; // a newer pack loaded while we awaited
      const map = new Map();
      for (const [key, file] of Object.entries(index.clips || {})) {
        map.set(normalizeSpoken(key), `${clipBase}/${file}`);
      }
      clips = map;
    } catch {
      // no/invalid index -> stay on the v1 backend
    }
  })();
}

export function audioAvailable() {
  return 'speechSynthesis' in window || clips.size > 0;
}

function stopClip() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
}

function speakViaWebSpeech(text, rate) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = locale;
  if (voice) u.voice = voice;
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

export function speak(text, { rate = 0.88 } = {}) {
  if (!text) return;
  stopSpeaking();

  const url = clips.get(normalizeSpoken(text));
  if (url) {
    const audio = new Audio(url);
    // Slow-downs (e.g. shadowing at 0.8) preserve pitch by default, so the clip
    // stays natural rather than dropping in tone.
    audio.playbackRate = rate;
    currentAudio = audio;
    audio.play().catch(() => {
      // Autoplay blocked, decode error, or a race with a newer clip -> fall
      // back to the browser voice for this line.
      if (currentAudio === audio) {
        currentAudio = null;
        speakViaWebSpeech(text, rate);
      }
    });
    return;
  }

  speakViaWebSpeech(text, rate);
}

export function stopSpeaking() {
  stopClip();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
