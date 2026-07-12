// Palm cards: quick flip-card rounds built from the pack's chips vocabulary.
// Tap to flip, rate yourself Again/Got it; a light Leitner ladder (practice.js)
// brings shaky cards back sooner. One session = up to 20 cards.

import { useMemo, useState } from 'react';
import { speak, stopSpeaking } from './audio';
import { packLanguage } from './ui';
import {
  buildCards,
  dealCards,
  deckStats,
  loadDeck,
  rateCard,
  scopeDays,
} from './practice';
import VoiceSettings from './VoiceSettings';

function Session({ packId, cards, deck, onDone }) {
  const session = useMemo(() => dealCards(cards, deck), [cards, deck]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState({ got: 0, again: 0 });

  const card = session[i];
  const flip = () => {
    if (!flipped) speak(card.speak);
    setFlipped((f) => !f);
  };
  const rate = (gotIt) => {
    rateCard(packId, card.id, gotIt);
    const next = { got: tally.got + (gotIt ? 1 : 0), again: tally.again + (gotIt ? 0 : 1) };
    setTally(next);
    stopSpeaking();
    if (i + 1 >= session.length) onDone(next);
    else {
      setI(i + 1);
      setFlipped(false);
    }
  };

  if (!card) return null;
  return (
    <>
      <div className="practice-progress">
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${(i / session.length) * 100}%` }} /></div>
        <p className="player-meta">{i + 1} / {session.length}</p>
      </div>
      <button className={`pcard ${flipped ? 'is-flipped' : ''}`} onClick={flip}>
        <span className="pcard-side-label">{flipped ? 'English' : packLanguage()}</span>
        <span className="pcard-text">{flipped ? card.back : card.front}</span>
        <span className="pcard-hint">{flipped ? '' : 'Tap to flip'}</span>
      </button>
      <div className="pcard-actions">
        <button
          className="speak-btn"
          onClick={(e) => { e.stopPropagation(); speak(card.speak); }}
        >
          🔊 Hear it
        </button>
      </div>
      {flipped ? (
        <div className="rate-row">
          <button className="rate-btn rate-again" onClick={() => rate(false)}>↺ Again</button>
          <button className="rate-btn rate-got" onClick={() => rate(true)}>✓ Got it</button>
        </div>
      ) : (
        <p className="hint-text practice-hint">Say it out loud, then flip to check.</p>
      )}
    </>
  );
}

export default function PalmCards({ manifest, lessonIndex, onExit }) {
  const [scope, setScope] = useState('mine');
  const [round, setRound] = useState(0);
  const [result, setResult] = useState(null);
  const packId = manifest.packId;

  const days = useMemo(() => scopeDays(manifest, packId, scope), [manifest, packId, scope]);
  const cards = useMemo(() => buildCards(lessonIndex, days), [lessonIndex, days]);
  // Cheap re-read each render, so deck health is fresh after every round.
  const deck = loadDeck(packId);
  const known = deckStats(cards, deck);

  return (
    <div className="practice">
      <header className="player-header">
        <div className="player-topline">
          <button className="back-btn" onClick={onExit}>← Dashboard</button>
          <VoiceSettings />
        </div>
        <div className="player-title">
          <span className="player-emoji">🃏</span>
          <div>
            <h2>Palm cards</h2>
            <p className="player-meta">
              {known.known} of {known.total} solid · {scope === 'mine' ? 'your days' : 'whole course'}
            </p>
          </div>
        </div>
      </header>

      <main className="practice-body">
        <div className="scope-row" role="group" aria-label="Card scope">
          <button className={`scope-pill ${scope === 'mine' ? 'is-active' : ''}`} onClick={() => { setScope('mine'); setResult(null); setRound((r) => r + 1); }}>My days</button>
          <button className={`scope-pill ${scope === 'all' ? 'is-active' : ''}`} onClick={() => { setScope('all'); setResult(null); setRound((r) => r + 1); }}>Whole course</button>
        </div>

        {cards.length === 0 ? (
          <p className="voice-empty">No cards here yet — open a lesson first and its vocabulary shows up as cards.</p>
        ) : result ? (
          <div className="practice-done">
            <h3>🎉 Round done</h3>
            <p>{result.got} solid · {result.again} coming back next round</p>
            <div className="rate-row">
              <button className="rate-btn rate-got" onClick={() => { setResult(null); setRound((r) => r + 1); }}>Go again</button>
              <button className="rate-btn" onClick={onExit}>Back to dashboard</button>
            </div>
          </div>
        ) : (
          <Session
            key={`${scope}-${round}`}
            packId={packId}
            cards={cards}
            deck={deck}
            onDone={setResult}
          />
        )}
      </main>
    </div>
  );
}
