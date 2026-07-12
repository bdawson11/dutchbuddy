// Pronunciation studio: line-by-line listen → repeat practice built from the
// pack's shadow and dialogue lines. Core loop works everywhere (listen, slow
// replay, say it aloud, self-advance); where the browser exposes
// SpeechRecognition, an optional mic check hears the learner back and gives an
// encouraging word-match verdict. Recognition is a bonus, never a gate.

import { useMemo, useRef, useState } from 'react';
import { speak, stopSpeaking } from './audio';
import { buildLines, dealLines, matchScore, scopeDays } from './practice';
import VoiceSettings from './VoiceSettings';

const SR =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

function verdict(score) {
  if (score >= 0.85) return { emoji: '🌟', note: 'Sounded great!' };
  if (score >= 0.55) return { emoji: '👍', note: 'Close — give it one more go.' };
  return { emoji: '💪', note: 'Tricky one. Listen again and copy the rhythm.' };
}

function Session({ locale, lines, onDone }) {
  const [i, setI] = useState(0);
  const [heard, setHeard] = useState(null); // {text, score}
  const [listening, setListening] = useState(false);
  const [micBlocked, setMicBlocked] = useState(false);
  const recRef = useRef(null);

  const line = lines[i];
  const advance = () => {
    stopSpeaking();
    recRef.current?.abort?.();
    setHeard(null);
    setListening(false);
    if (i + 1 >= lines.length) onDone();
    else setI(i + 1);
  };

  const check = () => {
    stopSpeaking();
    const rec = new SR();
    recRef.current = rec;
    rec.lang = locale;
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.onresult = (e) => {
      const alts = [...e.results[0]].map((r) => r.transcript);
      const best = alts
        .map((t) => ({ text: t, score: matchScore(line.text, t) }))
        .sort((a, b) => b.score - a.score)[0];
      setHeard(best);
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') setMicBlocked(true);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    setHeard(null);
    setListening(true);
    rec.start();
  };

  if (!line) return null;
  const v = heard ? verdict(heard.score) : null;
  return (
    <>
      <div className="practice-progress">
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${(i / lines.length) * 100}%` }} /></div>
        <p className="player-meta">{i + 1} / {lines.length}</p>
      </div>

      <div className="pron-line">
        {line.speaker && <span className="speaker">{line.speaker}</span>}
        <p className="pron-text">{line.text}</p>
        <p className="pron-en">{line.en}</p>
      </div>

      <div className="pron-controls">
        <button className="speak-btn" onClick={() => speak(line.text)}>🔊 Listen</button>
        <button className="speak-btn" onClick={() => speak(line.text, { rate: 0.7 })}>🐢 Slow</button>
        {SR && !micBlocked && (
          <button className={`speak-btn mic-btn ${listening ? 'is-listening' : ''}`} onClick={check} disabled={listening}>
            {listening ? '🎙 Listening…' : '🎙 Say it'}
          </button>
        )}
      </div>

      {micBlocked && (
        <p className="hint-text practice-hint">Mic is blocked — no problem, practice by ear: listen, say it aloud, move on.</p>
      )}
      {heard && (
        <div className={`pron-verdict ${heard.score >= 0.85 ? 'is-great' : ''}`}>
          <p className="pron-verdict-note">{v.emoji} {v.note}</p>
          <p className="pron-heard">Heard: “{heard.text.trim()}”</p>
        </div>
      )}
      {!SR && !heard && (
        <p className="hint-text practice-hint">Listen, then say it out loud — copy the rhythm, not just the sounds.</p>
      )}

      <div className="rate-row">
        <button className="rate-btn" onClick={() => { setHeard(null); speak(line.text); }}>↺ Once more</button>
        <button className="rate-btn rate-got" onClick={advance}>Next →</button>
      </div>
    </>
  );
}

export default function Pronunciation({ manifest, lessonIndex, onExit }) {
  const [scope, setScope] = useState('mine');
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  const packId = manifest.packId;

  const days = useMemo(() => scopeDays(manifest, packId, scope), [manifest, packId, scope]);
  const lines = useMemo(() => buildLines(lessonIndex, days), [lessonIndex, days]);
  const session = useMemo(() => {
    void round; // a new round re-deals even though the pool didn't change
    return dealLines(lines);
  }, [lines, round]);

  return (
    <div className="practice">
      <header className="player-header">
        <div className="player-topline">
          <button className="back-btn" onClick={onExit}>← Dashboard</button>
          <VoiceSettings />
        </div>
        <div className="player-title">
          <span className="player-emoji">🎙</span>
          <div>
            <h2>Pronunciation studio</h2>
            <p className="player-meta">{lines.length} lines · {scope === 'mine' ? 'your days' : 'whole course'}</p>
          </div>
        </div>
      </header>

      <main className="practice-body">
        <div className="scope-row" role="group" aria-label="Line scope">
          <button className={`scope-pill ${scope === 'mine' ? 'is-active' : ''}`} onClick={() => { setScope('mine'); setDone(false); setRound((r) => r + 1); }}>My days</button>
          <button className={`scope-pill ${scope === 'all' ? 'is-active' : ''}`} onClick={() => { setScope('all'); setDone(false); setRound((r) => r + 1); }}>Whole course</button>
        </div>

        {session.length === 0 ? (
          <p className="voice-empty">No lines here yet — open a lesson first and its dialogue shows up for practice.</p>
        ) : done ? (
          <div className="practice-done">
            <h3>🎉 Set done</h3>
            <p>{session.length} lines practiced out loud. Little and often wins.</p>
            <div className="rate-row">
              <button className="rate-btn rate-got" onClick={() => { setDone(false); setRound((r) => r + 1); }}>Another set</button>
              <button className="rate-btn" onClick={onExit}>Back to dashboard</button>
            </div>
          </div>
        ) : (
          <Session
            key={`${scope}-${round}`}
            locale={manifest.locale}
            lines={session}
            onDone={() => setDone(true)}
          />
        )}
      </main>
    </div>
  );
}
