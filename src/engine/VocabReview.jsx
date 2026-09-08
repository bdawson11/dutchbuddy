import { useState } from 'react';
import { speak } from './audio';
import { ui } from './ui';
import { pickVocabSession, recordVocab, vocabStats } from './progress';

// Flashcard review over every chips item the learner has met in completed
// lessons. Spaced with a small Leitner scheme (progress.js). Self-graded:
// the learner reveals the Dutch, hears it, and says whether they knew it.
export default function VocabReview({ packId, words, onExit }) {
  const [session] = useState(() => pickVocabSession(packId, words));
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState({ known: 0, missed: 0 });
  const stats = vocabStats(packId, words); // cheap; recomputed after every answer

  const card = session[i];
  const reveal = () => {
    setRevealed(true);
    speak(card.speak || card.nl);
  };
  const answer = (known) => {
    recordVocab(packId, card.nl, known);
    setResult((r) => ({ known: r.known + (known ? 1 : 0), missed: r.missed + (known ? 0 : 1) }));
    setRevealed(false);
    setI(i + 1);
  };

  return (
    <div className="player vocab">
      <header className="player-header">
        <button className="back-btn" onClick={onExit}>← {ui('dashboard', 'Dashboard')}</button>
        <div className="player-title">
          <span className="player-emoji">🃏</span>
          <div>
            <h2>{ui('vocabTitle', 'Vocabulary review')}</h2>
            <p className="player-meta">
              {stats.total} {ui('vocabWords', 'words met')} · {stats.known} {ui('vocabKnown', 'solid')} · {stats.due} {ui('vocabDue', 'due')}
            </p>
          </div>
        </div>
        {session.length > 0 && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(Math.min(i, session.length) / session.length) * 100}%` }} />
          </div>
        )}
      </header>

      <main className="player-blocks">
        {words.length === 0 ? (
          <div className="block">
            <p>{ui('vocabEmpty', 'Finish a lesson first — every word you tap in a lesson lands here for review.')}</p>
          </div>
        ) : !card ? (
          <div className="lesson-complete">
            <h3>🎉 {ui('vocabDone', 'Review done!')}</h3>
            <p>
              {session.length === 0
                ? ui('vocabNothingDue', 'Nothing is due right now. Come back tomorrow.')
                : `${result.known} ✓ · ${result.missed} ✗`}
            </p>
            <div className="complete-actions">
              <button className="done-btn" onClick={onExit}>{ui('backToDashboard', 'Back to dashboard')}</button>
            </div>
          </div>
        ) : (
          <div className="block flashcard">
            <p className="flash-count">{i + 1} / {session.length}</p>
            <p className="flash-en">{card.en}</p>
            {revealed ? (
              <>
                <p className="flash-nl">
                  {card.nl}{' '}
                  <button className="speak-btn" onClick={() => speak(card.speak || card.nl)}>🔊</button>
                </p>
                <p className="hint-text">{ui('vocabFrom', 'From')} {card.dayTitle}</p>
                <div className="complete-actions">
                  <button className="done-btn is-secondary" onClick={() => answer(false)}>✗ {ui('vocabMissed', 'Not yet')}</button>
                  <button className="done-btn" onClick={() => answer(true)}>✓ {ui('vocabKnew', 'Knew it')}</button>
                </div>
              </>
            ) : (
              <div className="complete-actions">
                <button className="done-btn" onClick={reveal}>{ui('vocabReveal', 'Show the Dutch')}</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
