// Real-life practice ("Op straat" in the Dutch pack): scenario-based spoken
// role-plays that live outside the day-by-day path. Content comes from the
// pack's practice file (manifest.practice.file); the engine stays
// language-agnostic. Each scenario has three tabs: a role-play where the
// learner answers the shopkeeper out loud (speech recognition, typed
// fallback), a phrase cheat sheet, and curveballs (the moments that go off
// script).

import { useEffect, useRef, useState } from 'react';
import { speak, stopSpeaking } from './audio';
import { listen, listenAvailable } from './listen';
import { matchSpoken } from './grading';
import { loadPractice, recordPractice } from './progress';

const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];

function md(text) {
  const html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function loadEarMode() {
  try {
    return localStorage.getItem('practice.earMode') === '1';
  } catch {
    return false;
  }
}

function saveEarMode(on) {
  try {
    localStorage.setItem('practice.earMode', on ? '1' : '0');
  } catch {
    // Preference only; fine to lose.
  }
}

// --- one line from the shopkeeper -------------------------------------------
function TheirLine({ speaker, line, earMode }) {
  const [shown, setShown] = useState(false);
  const [english, setEnglish] = useState(false);
  const hidden = earMode && !shown;
  return (
    <div className="rp-line rp-them">
      <span className="speaker">{speaker}</span>
      <div className="rp-bubble">
        <button className="rp-play" onClick={() => speak(line.nl)} aria-label="Play again">🔊</button>
        {hidden ? (
          <button className="rp-reveal" onClick={() => setShown(true)}>👂 Listen first, then tap to show text</button>
        ) : (
          <button className="rp-text" onClick={() => setEnglish(!english)}>
            <span className="line-nl">{line.nl}</span>
            {english ? <span className="line-en">{line.en}</span> : <span className="rp-tap">tap for English</span>}
          </button>
        )}
      </div>
    </div>
  );
}

// --- the learner's turn: say it, or type it ---------------------------------
function YourTurn({ turn, onDone }) {
  const canListen = listenAvailable();
  const [status, setStatus] = useState('idle'); // idle | listening | wrong | silent | blocked
  const [heard, setHeard] = useState('');
  const [typing, setTyping] = useState(!canListen);
  const [typed, setTyped] = useState('');
  const [help, setHelp] = useState(false);
  const [missing, setMissing] = useState(null);
  const session = useRef(null);

  useEffect(() => () => session.current?.stop(), []);

  const check = (attempt, how) => {
    const r = matchSpoken(attempt, turn.keywords);
    if (r.correct) return onDone({ text: r.heard, how });
    setHeard(r.heard);
    const list = Array.isArray(attempt) ? attempt : [attempt];
    const group = turn.keywords.find((g) => !list.some((a) => matchSpoken(a, [g]).correct));
    setMissing(group ? group[0] : null);
    setStatus(r.heard ? 'wrong' : 'silent');
  };

  const startListening = () => {
    if (status === 'listening') return session.current?.stop();
    setStatus('listening');
    session.current = listen();
    session.current.promise.then(
      (alts) => check(alts, 'spoken'),
      (error) => {
        if (error === 'not-allowed' || error === 'service-not-allowed') {
          setStatus('blocked');
          setTyping(true);
        } else {
          setStatus('silent');
        }
      }
    );
  };

  const submitTyped = () => typed.trim() && check(typed, 'typed');

  return (
    <div className="rp-turn">
      <p className="rp-task">🎯 {md(turn.you)}</p>

      {canListen && (
        <button className={`rp-mic ${status === 'listening' ? 'is-listening' : ''}`} onClick={startListening}>
          {status === 'listening' ? '● Listening… tap when done' : '🎙️ Tap and say it'}
        </button>
      )}

      {status === 'wrong' && (
        <div className="feedback wrong">
          I heard: “{heard}”. {missing ? <>Hint: try using <strong>{missing}</strong>.</> : 'Not quite. Try again.'}
          <button className="link-btn rp-override" onClick={() => onDone({ text: heard, how: 'override' })}>
            I said it right →
          </button>
        </div>
      )}
      {status === 'silent' && <p className="feedback wrong">Didn't catch that. Try again, a little closer to the mic.</p>}
      {status === 'blocked' && <p className="feedback wrong">Microphone is blocked. Allow mic access for this site, or type your answer.</p>}

      {typing ? (
        <div className="typed-row">
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitTyped()}
            placeholder="Type what you'd say…"
            autoCapitalize="none" autoCorrect="off" spellCheck="false"
          />
          <button onClick={submitTyped} disabled={!typed.trim()}>Say it</button>
        </div>
      ) : null}

      <div className="rp-actions">
        {canListen && !typing && <button className="link-btn" onClick={() => setTyping(true)}>⌨️ Type instead</button>}
        <button className="link-btn" onClick={() => setHelp(!help)}>💡 {help ? 'Hide' : 'Show me'}</button>
      </div>

      {help && (
        <div className="rp-help">
          {[turn.sample, ...(turn.alts || [])].map((s, i) => (
            <button key={i} className="rp-sample" onClick={() => speak(s)}>🔊 {s}</button>
          ))}
          <p className="hint-text">Listen, then say it yourself.</p>
        </div>
      )}
    </div>
  );
}

// --- a whole conversation ----------------------------------------------------
function Roleplay({ turns, staff, earMode, onComplete }) {
  // Pick one variant per shopkeeper line, once per run, so every run sounds a
  // little different. Restarting (a new `key`) re-rolls.
  const [script] = useState(() =>
    turns.map((t) => (t.them ? { kind: 'them', line: pickOne(t.them) } : { kind: 'you', ...t }))
  );
  const nextYou = (from) => {
    const i = script.findIndex((t, j) => j >= from && t.kind === 'you');
    return i === -1 ? script.length : i;
  };
  const [pos, setPos] = useState(() => nextYou(0));
  const [answers, setAnswers] = useState({});
  const spokenUpTo = useRef(0);
  const finished = pos >= script.length;

  // Speak the shopkeeper lines that just came into view.
  useEffect(() => {
    const end = finished ? script.length : pos;
    const lines = script.slice(spokenUpTo.current, end).filter((t) => t.kind === 'them').map((t) => t.line.nl);
    spokenUpTo.current = Math.max(spokenUpTo.current, end);
    if (lines.length) speak(lines.join(' '));
  }, [pos, finished, script]);

  const answer = (i, a) => {
    setAnswers((prev) => ({ ...prev, [i]: a }));
    const next = nextYou(i + 1);
    setPos(next);
    if (next >= script.length) onComplete?.();
  };

  return (
    <div className="rp">
      {script.slice(0, finished ? script.length : pos + 1).map((t, i) => {
        if (t.kind === 'them') return <TheirLine key={i} speaker={staff} line={t.line} earMode={earMode} />;
        if (i === pos) return <YourTurn key={i} turn={t} onDone={(a) => answer(i, a)} />;
        const a = answers[i];
        return (
          <div key={i} className="rp-line rp-you">
            <span className="speaker">You</span>
            <div className="rp-bubble">
              <span className="line-nl">{a.how === 'override' ? t.sample : a.text}</span>
              <span className="rp-mark">{a.how === 'typed' ? '⌨️ ✓' : '🎙️ ✓'}</span>
            </div>
            <button className="rp-model" onClick={() => speak(t.sample)}>🔊 Model: {t.sample}</button>
          </div>
        );
      })}
    </div>
  );
}

// --- scenario screen ---------------------------------------------------------
function PhraseList({ title, items }) {
  return (
    <div className="block">
      <h3>{title}</h3>
      {items.map((p, i) => (
        <button key={i} className="phrase-row" onClick={() => speak(p.nl)}>
          <span className="line-nl">🔊 {p.nl}</span>
          <span className="line-en">{p.en}</span>
        </button>
      ))}
    </div>
  );
}

function Scenario({ scenario, done, onDone, onBack }) {
  const [tab, setTab] = useState('roleplay');
  const [rpIndex, setRpIndex] = useState(0);
  const [run, setRun] = useState(0);
  const [finished, setFinished] = useState(false);
  const [earMode, setEarMode] = useState(loadEarMode);
  const rp = scenario.roleplays[rpIndex];

  useEffect(() => () => stopSpeaking(), []);

  const toggleEar = () => {
    saveEarMode(!earMode);
    setEarMode(!earMode);
  };
  const restart = (i = rpIndex) => {
    stopSpeaking();
    setRpIndex(i);
    setFinished(false);
    setRun((r) => r + 1);
  };
  const complete = () => {
    setFinished(true);
    onDone(`${scenario.id}/${rp.id}`);
  };

  return (
    <div className="player practice">
      <header className="player-header">
        <button className="back-btn" onClick={onBack}>← All places</button>
        <div className="player-title">
          <span className="player-emoji">{scenario.emoji}</span>
          <div>
            <h2>{scenario.title}</h2>
            <p className="player-meta">{scenario.en}</p>
          </div>
        </div>
        <div className="practice-tabs" role="tablist">
          {[['roleplay', '🎭 Role-play'], ['phrases', '📋 Phrases'], ['curveballs', '⚡ Curveballs']].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => { stopSpeaking(); setTab(id); }}>
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="player-blocks">
        {tab === 'roleplay' && (
          <>
            <div className="block">
              <div className="chip-grid rp-picker">
                {scenario.roleplays.map((r, i) => (
                  <button key={r.id} className={`chip ${i === rpIndex ? 'chip-tapped' : ''}`} onClick={() => restart(i)}>
                    <span className="chip-nl">{r.title}</span>
                    <span className="chip-en">{done[`${scenario.id}/${r.id}`] ? `✓ practised ${done[`${scenario.id}/${r.id}`]}×` : r.en}</span>
                  </button>
                ))}
              </div>
              <p className="rp-setup">{md(rp.setup)}</p>
              <label className="ear-toggle">
                <input type="checkbox" checked={earMode} onChange={toggleEar} /> 👂 Ear mode: hide their Dutch text until I tap
              </label>
            </div>
            <div className="block">
              <Roleplay key={`${rp.id}-${run}`} turns={rp.turns} staff={rp.staff} earMode={earMode} onComplete={complete} />
              {finished && (
                <div className="rp-finished">
                  <h3>🎉 Gelukt! You got through it.</h3>
                  <p>Run it again. The shopkeeper's lines change each time.</p>
                  <button className="done-btn" onClick={() => restart()}>↻ Again</button>
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'phrases' && (
          <>
            {scenario.tips?.length > 0 && (
              <div className="block">
                <h3>Before you go in</h3>
                {scenario.tips.map((t, i) => <p key={i} className="tip">{md(t)}</p>)}
              </div>
            )}
            <PhraseList title="🗣️ What you say" items={scenario.say} />
            <PhraseList title="👂 What you'll hear" items={scenario.hear} />
          </>
        )}

        {tab === 'curveballs' && (
          <>
            <p className="hint-text practice-note">When the conversation goes off script. Each one is a single exchange: listen, then answer.</p>
            {scenario.curveballs.map((c, i) => (
              <div key={i} className="block">
                {c.title && <h3>{c.title}</h3>}
                <Roleplay turns={[{ them: c.them }, { you: c.you, keywords: c.keywords, sample: c.sample, alts: c.alts }]} staff={c.staff || scenario.roleplays[0].staff} earMode={earMode} />
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}

// --- entry: the list of places -----------------------------------------------
export default function Practice({ packId, practice, onExit }) {
  const [openId, setOpenId] = useState(null);
  const [done, setDone] = useState(() => loadPractice(packId));
  const scenario = practice.scenarios.find((s) => s.id === openId);

  useEffect(() => () => stopSpeaking(), []);

  const open = (id) => {
    setOpenId(id);
    window.scrollTo(0, 0);
  };

  if (scenario) {
    return (
      <Scenario
        scenario={scenario}
        done={done}
        onDone={(runId) => setDone(recordPractice(packId, runId))}
        onBack={() => open(null)}
      />
    );
  }

  return (
    <div className="player practice">
      <header className="player-header">
        <button className="back-btn" onClick={onExit}>← Dashboard</button>
        <div className="player-title">
          <span className="player-emoji">{practice.emoji}</span>
          <div>
            <h2>{practice.title}</h2>
            <p className="player-meta">{practice.subtitle}</p>
          </div>
        </div>
      </header>
      <main className="player-blocks">
        <div className="block">
          <p className="practice-intro">{md(practice.intro)}</p>
          {!listenAvailable() && (
            <div className="callout">🎙️ This browser can't do speech recognition, so you'll type your answers. Chrome, Edge or Safari will let you say them out loud.</div>
          )}
        </div>

        <div className="scenario-grid">
          {practice.scenarios.map((s) => {
            const runs = s.roleplays.reduce((n, r) => n + (done[`${s.id}/${r.id}`] || 0), 0);
            const covered = s.roleplays.filter((r) => done[`${s.id}/${r.id}`]).length;
            return (
              <button key={s.id} className={`day-card scenario-card ${covered === s.roleplays.length ? 'is-complete' : ''}`} onClick={() => open(s.id)}>
                <span className="scenario-emoji">{s.emoji}</span>
                <span className="day-title">{s.title}</span>
                <span className="day-summary">{s.blurb}</span>
                <span className="day-status">{runs ? `${covered}/${s.roleplays.length} role-plays · ${runs} runs` : `${s.roleplays.length} role-plays`}</span>
              </button>
            );
          })}
        </div>

        {practice.survival?.length > 0 && (
          <PhraseList title="🛟 Lifesavers that work anywhere" items={practice.survival} />
        )}
      </main>
    </div>
  );
}
