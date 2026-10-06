// Speech recognition for spoken practice. v1 backend: the browser's Web
// Speech API (Chrome/Edge/Android, Safari 14.5+), language from the pack
// locale. Firefox has no recognizer, so callers must offer a typed fallback
// when listenAvailable() is false.

import { getLocale, stopSpeaking } from './audio';

const Recognition =
  typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

export function listenAvailable() {
  return Boolean(Recognition);
}

// Start listening. Resolves with the recognizer's alternatives (best first),
// or [] if nothing was heard. Rejects with the recognizer's error code
// ('not-allowed', 'network', ...) on hard failure. Call stop() to finish
// early; the promise still resolves with whatever was heard.
export function listen() {
  if (!Recognition) return { promise: Promise.reject('unsupported'), stop() {} };
  stopSpeaking();
  const rec = new Recognition();
  rec.lang = getLocale();
  rec.interimResults = false;
  rec.continuous = false;
  rec.maxAlternatives = 5;

  const promise = new Promise((resolve, reject) => {
    let heard = [];
    rec.onresult = (e) => {
      const result = e.results[e.results.length - 1];
      heard = Array.from(result, (alt) => alt.transcript);
    };
    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') resolve([]);
      else reject(e.error);
    };
    rec.onend = () => resolve(heard);
  });
  try {
    rec.start();
  } catch {
    return { promise: Promise.reject('busy'), stop() {} };
  }
  return { promise, stop: () => rec.stop() };
}
