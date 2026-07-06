// Audio abstraction with two backends behind one speak/stop interface:
//   v2 (preferred): pre-generated clips, looked up in <packBase>/audio/index.json
//     (written by tools/xtts/generate_audio.py — text → mp3 filename).
//   v1 (fallback): Web Speech API, voice chosen by pack locale.
// Dynamic text (e.g. builder sentences) has no pre-generated clip and always
// falls back, so both backends stay live at runtime.

let voice = null;
let locale = 'nl-NL';
let clipBase = null; // e.g. "/packs/dutch-nl/audio"
let clips = null; // normalized text → filename
let generation = 0; // guards against a stale index fetch after a pack switch
let currentClip = null;
const clipCache = new Map(); // url → HTMLAudioElement (session-scoped)

// Clip keys are matched on NFC-normalized, whitespace-collapsed text. The
// generator applies the same normalization, so authoring whitespace or
// composed/decomposed accents (é) never cause a silent cache miss.
function normalize(text) {
  return text.normalize('NFC').replace(/\s+/g, ' ').trim();
}

export function configureAudio(packLocale, packBase) {
  locale = packLocale;
  clips = null;
  clipBase = null;
  const gen = ++generation;

  if (packBase) {
    const base = `${packBase}/audio`;
    fetch(`${base}/index.json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((index) => {
        if (!index || gen !== generation) return;
        // Accept both the canonical {clips: {text: file}} shape and a flat
        // {text: file} map, so hand-rolled generator runs still work.
        const map = index.clips && typeof index.clips === 'object' ? index.clips : index;
        clips = new Map();
        for (const [text, file] of Object.entries(map)) {
          if (typeof file === 'string') clips.set(normalize(text), file);
        }
        clipBase = base;
      })
      .catch(() => {}); // no clips for this pack — Web Speech carries it
  }

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
  return clips !== null || 'speechSynthesis' in window;
}

// rate keeps its Web Speech meaning (default 0.88, shadow blocks pass 0.8 for
// "slow"). Clips are natural speech, so they play at 1.0 and interpret a
// below-default rate as the slow-shadowing intent instead of a literal value.
export function speak(text, { rate = 0.88 } = {}) {
  stopSpeaking();
  const file = clips?.get(normalize(text));
  if (file && clipBase) {
    const url = `${clipBase}/${file}`;
    let clip = clipCache.get(url);
    if (!clip) {
      clip = new Audio(url);
      clip.preload = 'auto';
      if (clipCache.size > 64) clipCache.clear();
      clipCache.set(url, clip);
    }
    clip.currentTime = 0;
    clip.playbackRate = rate < 0.88 ? 0.8 : 1.0;
    currentClip = clip;
    clip.play().catch(() => speakSynth(text, rate)); // decode/policy failure → TTS
    return;
  }
  speakSynth(text, rate);
}

function speakSynth(text, rate) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = locale;
  if (voice) u.voice = voice;
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (currentClip) {
    currentClip.pause();
    currentClip = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
