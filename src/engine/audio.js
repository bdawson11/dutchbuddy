// Audio abstraction. The interface (speak/stop/available) is the contract for
// all lesson components; the backend behind it is layered:
//
// v2 backend — pre-generated studio clips. If the pack ships an
// `audio/index.json` (rendered offline by tools/generate-audio-f5.py with a
// neural TTS model such as alien79/F5-TTS-italian), speak(text) plays the
// clip whose key exactly matches the text. Lesson content and components
// never change; dropping the files into public/packs/<pack>/audio/ is enough.
//
// v1 backend — Web Speech API, used for any line without a clip (and for
// dynamic text like builder sentences that can't be pre-rendered).
//
// v1.5 quality pass: instead of taking the first voice whose lang matches,
// every same-language voice is scored — exact region first (nl-NL over nl-BE,
// es-ES over es-MX, de-DE over de-AT/de-CH), known high-quality engines
// (Natural/Neural/Premium/Enhanced, Google, Siri) over robotic ones (eSpeak,
// iOS "Compact", macOS novelty voices), with per-pack name hints from
// manifest.audio.preferredVoices. A learner override, persisted per language,
// beats the heuristic; when no same-language voice exists at all we still
// speak with utterance.lang set and let the engine pick its default.

let locale = 'nl-NL';
let preferredHints = [];
let sample = '';
let defaultRate = 0.88;

// v2 clip state: exact-text → clip filename, loaded from <pack>/audio/index.json.
let clips = null;
let clipsMeta = null;
let clipsBase = '';
let clipEl = null;

const OVERRIDE_KEY_PREFIX = 'yapworld.voice.';
const listeners = new Set();
let speakSeq = 0;

const normTag = (tag) => (tag || '').replace(/_/g, '-').toLowerCase();
const langOf = (tag) => normTag(tag).split('-')[0];
// Diacritic-insensitive so a "Alvaro" hint still matches "Álvaro".
const normName = (s) =>
  (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// [regex over "name voiceURI", points]. Positive: engines that sound human.
// Negative: formant synths and joke voices that make a language course sound
// broken. Applied cumulatively ("Microsoft Fenna Online (Natural)" collects
// natural + microsoft + online).
const QUALITY_HINTS = [
  [/natural/, 40],
  [/neural/, 40],
  [/premium/, 35],
  [/enhanced/, 30],
  [/google/, 25],
  [/siri/, 20],
  [/microsoft/, 12],
  [/online/, 8],
  [/network/, 8], // Android "-network" variants beat their "-local" twins
  [/compact/, -30],
  [/eloquence|klatt/, -50],
  [/espeak/, -70],
  [/albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|superstar|trinoids|whisper|wobble|zarvox/, -80],
];

export function configureAudio(packLocale, audioCfg = {}, packBaseUrl = '') {
  locale = packLocale;
  preferredHints = (audioCfg.preferredVoices || []).map(normName);
  sample = audioCfg.sample || '';
  defaultRate = audioCfg.rate ?? 0.88;
  clips = null;
  clipsMeta = null;
  clipsBase = packBaseUrl ? `${packBaseUrl}/audio` : '';
  if (clipsBase && typeof fetch === 'function') {
    const expected = clipsBase; // guard against a pack switch mid-fetch
    fetch(`${expected}/index.json`)
      .then((r) => {
        // vite's SPA fallback answers missing files with index.html — not an index.
        const type = (r.headers.get('content-type') || '').toLowerCase();
        return r.ok && !type.includes('text/html') ? r.json() : null;
      })
      .then((idx) => {
        if (!idx || typeof idx.clips !== 'object' || clipsBase !== expected) return;
        clips = idx.clips;
        clipsMeta = { model: idx.model || '', label: idx.label || 'Studio voice' };
        notify();
      })
      .catch(() => {}); // no clips shipped — Web Speech carries the pack
  }
  if (!audioAvailable()) return;
  // getVoices() is empty until the async voice list arrives (Chrome); notify
  // subscribers whenever it changes so pickers and the resolver stay fresh.
  window.speechSynthesis.addEventListener('voiceschanged', notify);
  notify();
}

// Metadata of the active pre-generated clip set ({model, label}), or null
// when the pack is running on plain Web Speech.
export function clipInfo() {
  return clips ? clipsMeta : null;
}

export function audioAvailable() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function notify() {
  for (const cb of listeners) cb();
}

// Subscribe to voice-list or selection changes. Returns an unsubscribe fn.
export function subscribeVoices(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function scoreVoice(v) {
  const vTag = normTag(v.lang);
  let s = 0;
  if (vTag === normTag(locale)) s += 100; // the pack's exact region identity
  else if (vTag === langOf(locale)) s += 60; // bare language tag, region-neutral
  else s += 30; // same language, wrong region — last-resort but usable
  const name = normName(`${v.name} ${v.voiceURI}`);
  for (const [re, pts] of QUALITY_HINTS) if (re.test(name)) s += pts;
  const hintIdx = preferredHints.findIndex((h) => h && name.includes(h));
  if (hintIdx >= 0) s += 24 - hintIdx * 2; // earlier manifest hints rank higher
  if (v.localService) s += 2; // offline tiebreaker only — never beats quality
  if (v.default) s += 1;
  return s;
}

// All voices for the pack's language, best first.
export function listVoices() {
  if (!audioAvailable()) return [];
  const lang = langOf(locale);
  return window.speechSynthesis
    .getVoices()
    .filter((v) => langOf(v.lang) === lang)
    .map((v) => ({ voice: v, score: scoreVoice(v), exactRegion: normTag(v.lang) === normTag(locale) }))
    .sort((a, b) => b.score - a.score || a.voice.name.localeCompare(b.voice.name));
}

const overrideKey = () => OVERRIDE_KEY_PREFIX + langOf(locale);

export function getPreferredVoiceURI() {
  try {
    return localStorage.getItem(overrideKey());
  } catch {
    return null;
  }
}

// voiceURI to pin for this language, or null to return to automatic pick.
export function setPreferredVoice(voiceURI) {
  try {
    if (voiceURI) localStorage.setItem(overrideKey(), voiceURI);
    else localStorage.removeItem(overrideKey());
  } catch {
    /* storage unavailable — selection just won't persist */
  }
  notify();
}

export function getActiveVoice() {
  const ranked = listVoices();
  if (!ranked.length) return null;
  const wanted = getPreferredVoiceURI();
  if (wanted) {
    const hit = ranked.find((r) => r.voice.voiceURI === wanted);
    if (hit) return hit.voice; // stale overrides (other device/browser) fall through
  }
  return ranked[0].voice;
}

export function sampleText() {
  return sample;
}

function stopClip() {
  if (clipEl) {
    clipEl.pause();
    clipEl.currentTime = 0;
  }
}

function playClip(file, rate) {
  stopClip();
  if (!clipEl) clipEl = new Audio();
  clipEl.src = `${clipsBase}/${file}`;
  // Clips are natural-pace recordings, so the pack's default TTS rate maps to
  // 1.0; slower requests (shadowing) scale down proportionally.
  clipEl.playbackRate = (rate ?? defaultRate) / defaultRate;
  if ('preservesPitch' in clipEl) clipEl.preservesPitch = true;
  clipEl.play().catch(() => {}); // autoplay refusal — user will tap again
}

export function speak(text, { rate } = {}) {
  if (!text) return;
  const clip = clips && clips[text];
  if (clip) {
    if (audioAvailable()) {
      speakSeq++; // cancel any TTS still pending its timer
      window.speechSynthesis.cancel();
    }
    playClip(clip, rate);
    return;
  }
  if (!audioAvailable()) return;
  const synth = window.speechSynthesis;
  stopClip();
  synth.cancel();
  const seq = ++speakSeq;
  const u = new SpeechSynthesisUtterance(text);
  const v = getActiveVoice();
  if (v) {
    u.voice = v;
    u.lang = v.lang;
  } else {
    u.lang = locale; // no same-language voice: let the engine's default try
  }
  u.rate = rate ?? defaultRate;
  // Chrome drops utterances queued in the same tick as cancel(), and can sit
  // in a paused state after tab switches — defer a tick and resume() first.
  setTimeout(() => {
    if (seq !== speakSeq) return; // a newer speak() superseded this one
    synth.resume();
    synth.speak(u);
  }, 30);
}

export function stopSpeaking() {
  stopClip();
  if (!audioAvailable()) return;
  speakSeq++; // invalidate any speak() still waiting on its timer
  window.speechSynthesis.cancel();
}
