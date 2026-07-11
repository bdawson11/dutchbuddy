// Voice picker for the current pack language. Auto mode follows audio.js's
// quality ranking; tapping a voice previews it with the pack's sample line and
// pins it (persisted per language). Also the graceful-degradation surface:
// when the device has no voice for the language, this is where we say so
// instead of playing a wrong-language voice unannounced.

import { useEffect, useState } from 'react';
import {
  audioAvailable,
  getActiveVoice,
  getPreferredVoiceURI,
  listVoices,
  sampleText,
  setPreferredVoice,
  speak,
  subscribeVoices,
} from './audio';
import { packLanguage } from './ui';

export default function VoiceSettings() {
  const [open, setOpen] = useState(false);
  const [, setTick] = useState(0);
  useEffect(() => subscribeVoices(() => setTick((t) => t + 1)), []);
  if (!audioAvailable()) return null;

  const ranked = listVoices();
  const active = getActiveVoice();
  const pinnedURI = getPreferredVoiceURI();
  const isAuto = !pinnedURI || !ranked.some((r) => r.voice.voiceURI === pinnedURI);
  const language = packLanguage();

  const choose = (uri) => {
    setPreferredVoice(uri);
    speak(sampleText());
  };

  return (
    <div className="voice-settings">
      <button
        className="voice-btn"
        onClick={() => setOpen((o) => !o)}
        title={active ? `Voice: ${active.name}` : 'Voice settings'}
        aria-expanded={open}
      >
        🎙 Voice
      </button>
      {open && (
        <>
          <div className="voice-backdrop" onClick={() => setOpen(false)} />
          <div className="voice-panel" role="dialog" aria-label={`${language} voice settings`}>
            <div className="voice-panel-head">
              <h4>{language} voice</h4>
              <button className="voice-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
            </div>
            {ranked.length === 0 ? (
              <p className="voice-empty">
                No {language} voice was found on this device, so audio will use your
                browser's default and may sound wrong. Adding a {language} voice in your
                system's text-to-speech settings fixes this.
              </p>
            ) : (
              <>
                <ul className="voice-list">
                  <li>
                    <button
                      className={`voice-option ${isAuto ? 'is-active' : ''}`}
                      onClick={() => choose(null)}
                    >
                      <span className="voice-name">✨ Automatic</span>
                      <span className="voice-meta">
                        best available{active ? ` — ${active.name}` : ''}
                      </span>
                    </button>
                  </li>
                  {ranked.map(({ voice, exactRegion }) => (
                    <li key={voice.voiceURI + voice.lang}>
                      <button
                        className={`voice-option ${!isAuto && pinnedURI === voice.voiceURI ? 'is-active' : ''}`}
                        onClick={() => choose(voice.voiceURI)}
                      >
                        <span className="voice-name">{voice.name}</span>
                        <span className="voice-meta">
                          {voice.lang}
                          {exactRegion ? '' : ' · different accent'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="voice-hint">Tap a voice to hear it — your pick is saved for {language}.</p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
