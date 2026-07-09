// One component per block type. Every exercise component reports completion
// once via onDone(). Teaching blocks (card, chips, contrast, dialogue, shadow)
// complete on acknowledgement; graded blocks complete on a correct answer;
// journal completes on save. Ugly-but-functional pass: structure and behavior
// are final, visual design is replaced in the Claude Design pass.

import { useState } from 'react';
import { speak } from '../audio';
import { grade } from '../grading';
import { ui, packLanguage } from '../ui';
import { saveJournal, loadJournal } from '../progress';

// --- tiny markdown: **bold** and *italic* only ---
function md(text) {
  const html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function DoneButton({ done, onDone, label = 'Got it' }) {
  return (
    <button className={`done-btn ${done ? 'is-done' : ''}`} onClick={onDone} disabled={done}>
      {done ? '✓ Done' : label}
    </button>
  );
}

export function Card({ block, done, onDone }) {
  return (
    <div className="block block-card">
      <h3>{block.title}</h3>
      <p>{md(block.body)}</p>
      {block.table && (
        <table>
          <thead><tr>{block.table.headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
          <tbody>
            {block.table.rows.map((r, i) => (
              <tr key={i}>{r.map((c, j) => <td key={j}>{md(c)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      )}
      {block.callout && <div className="callout">{md(block.callout)}</div>}
      <DoneButton done={done} onDone={onDone} />
    </div>
  );
}

export function Chips({ block, done, onDone }) {
  const [tapped, setTapped] = useState(new Set());
  const tap = (i, item) => {
    if (item.speak) speak(item.speak);
    const next = new Set(tapped).add(i);
    setTapped(next);
    if (next.size === block.items.length && !done) onDone();
  };
  return (
    <div className="block block-chips">
      {block.title && <h3>{block.title}</h3>}
      <div className="chip-grid">
        {block.items.map((item, i) => (
          <button key={i} className={`chip ${tapped.has(i) ? 'chip-tapped' : ''}`} onClick={() => tap(i, item)}>
            <span className="chip-nl">🔊 {item.target ?? item.nl}</span>
            <span className="chip-en">{item.en}</span>
          </button>
        ))}
      </div>
      <p className="hint-text">Tap every chip to continue.</p>
    </div>
  );
}

export function Contrast({ block, done, onDone }) {
  return (
    <div className="block block-contrast">
      {block.title && <h3>{block.title}</h3>}
      {block.pairs.map((p, i) => (
        <div key={i} className="contrast-pair">
          <div className="contrast-cols">
            <div className="contrast-cell">{md(p.left)}</div>
            <div className="contrast-vs">vs</div>
            <div className="contrast-cell">{md(p.right)}</div>
          </div>
          {p.note && <p className="contrast-note">{md(p.note)}</p>}
        </div>
      ))}
      <DoneButton done={done} onDone={onDone} />
    </div>
  );
}

export function Mcq({ block, done, onDone }) {
  const [picked, setPicked] = useState(null);
  const pick = (i) => {
    if (done) return;
    setPicked(i);
    if (i === block.correct) onDone();
  };
  return (
    <div className="block block-mcq">
      <p className="prompt">{md(block.prompt)}</p>
      <div className="mcq-options">
        {block.options.map((o, i) => {
          let cls = 'mcq-option';
          if (picked !== null) {
            if (i === block.correct && (picked === i || done)) cls += ' is-correct';
            else if (i === picked) cls += ' is-wrong';
          }
          return <button key={i} className={cls} onClick={() => pick(i)}>{o}</button>;
        })}
      </div>
      {picked !== null && picked !== block.correct && <p className="feedback wrong">Not quite — try again.</p>}
      {done && block.explain && <p className="feedback explain">{md(block.explain)}</p>}
    </div>
  );
}

function TypedInput({ prompt, answers, hint, explain, done, onDone, preSpeak }) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const check = () => {
    const r = grade(value, answers);
    setResult(r);
    if (r.correct && !done) onDone();
  };
  return (
    <div className="block block-typed">
      <p className="prompt">{md(prompt)}</p>
      {preSpeak && (
        <button className="speak-btn" onClick={() => speak(preSpeak)}>🔊 Play audio</button>
      )}
      <div className="typed-row">
        <input
          value={value}
          onChange={(e) => { setValue(e.target.value); setResult(null); }}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          placeholder={ui('typedPlaceholder', `Type in ${packLanguage()}…`)}
          disabled={done}
          autoCapitalize="none" autoCorrect="off" spellCheck="false"
        />
        <button onClick={check} disabled={done || !value.trim()}>Check</button>
      </div>
      {result?.correct && <p className="feedback correct">✓ {result.note || ui('correctFeedback', 'Nice!')}</p>}
      {done && explain && <p className="feedback explain">{md(explain)}</p>}
      {result && !result.correct && (
        <p className="feedback wrong">Not yet. {hint ? md(`Hint: ${hint}`) : ''}</p>
      )}
    </div>
  );
}

export function Typed({ block, done, onDone }) {
  return <TypedInput {...block} done={done} onDone={onDone} />;
}

export function Dictation({ block, done, onDone }) {
  return (
    <TypedInput
      prompt={block.prompt || 'Listen and type what you hear.'}
      answers={block.answers}
      done={done}
      onDone={onDone}
      preSpeak={block.speak}
    />
  );
}

export function Builder({ block, done, onDone }) {
  const [picks, setPicks] = useState({});
  const pick = (slotIdx, chip) => {
    const next = { ...picks, [slotIdx]: chip };
    setPicks(next);
    if (Object.keys(next).length === block.slots.length && !done) onDone();
  };
  const sentence = block.slots.map((_, i) => picks[i]).filter(Boolean).join(' ');
  return (
    <div className="block block-builder">
      {block.title && <h3>{block.title}</h3>}
      {block.prompt && <p className="prompt">{md(block.prompt)}</p>}
      {block.slots.map((slot, i) => (
        <div key={i} className="builder-slot">
          <span className="slot-label">{slot.label}</span>
          <div className="chip-grid">
            {slot.chips.map((c, j) => (
              <button key={j} className={`chip ${picks[i] === c ? 'chip-tapped' : ''}`} onClick={() => pick(i, c)}>{c}</button>
            ))}
          </div>
        </div>
      ))}
      <div className="builder-output">
        {sentence ? <><span>{sentence}</span> <button className="speak-btn" onClick={() => speak(sentence)}>🔊</button></> : <span className="hint-text">Pick one from each row…</span>}
      </div>
      {block.sample && done && <p className="feedback explain">Sample: {block.sample}</p>}
    </div>
  );
}

export function Dialogue({ block, done, onDone }) {
  const [revealed, setRevealed] = useState(new Set());
  const reveal = (i, line) => {
    speak(line.target ?? line.nl);
    const next = new Set(revealed).add(i);
    setRevealed(next);
    if (next.size === block.lines.length && !done) onDone();
  };
  return (
    <div className="block block-dialogue">
      <h3>💬 {block.scene}</h3>
      {block.lines.map((line, i) => (
        <div key={i} className={`dialogue-line ${revealed.has(i) ? 'is-revealed' : ''}`} onClick={() => reveal(i, line)}>
          <span className="speaker">{line.speaker}</span>
          <span className="line-nl">{line.target ?? line.nl}</span>
          {revealed.has(i) && <span className="line-en">{line.en}</span>}
          {revealed.has(i) && line.spotlight && <span className="spotlight">💡 {md(line.spotlight)}</span>}
        </div>
      ))}
      <p className="hint-text">Tap each line to hear it and reveal the translation.</p>
    </div>
  );
}

export function Shadow({ block, done, onDone }) {
  const [played, setPlayed] = useState(new Set());
  const play = (i, line) => {
    speak(line.target ?? line.nl, { rate: 0.8 });
    const next = new Set(played).add(i);
    setPlayed(next);
    if (next.size === block.lines.length && !done) onDone();
  };
  return (
    <div className="block block-shadow">
      <h3>{block.title || 'Shadowing'}</h3>
      <p className="hint-text">Play each line, then say it out loud, copying the rhythm.</p>
      {block.lines.map((line, i) => (
        <div key={i} className="shadow-line">
          <button className={`speak-btn ${played.has(i) ? 'chip-tapped' : ''}`} onClick={() => play(i, line)}>🔊</button>
          <span className="line-nl">{line.target ?? line.nl}</span>
          <span className="line-en">{line.en}</span>
        </div>
      ))}
    </div>
  );
}

export function Comprehension({ block, done, onDone }) {
  const [answers, setAnswers] = useState({});
  const answer = (qi, oi) => {
    if (answers[qi] === block.questions[qi].correct) return;
    const next = { ...answers, [qi]: oi };
    setAnswers(next);
    const allCorrect = block.questions.every((q, i) => next[i] === q.correct);
    if (allCorrect && !done) onDone();
  };
  return (
    <div className="block block-comprehension">
      <h3>{block.title || 'Comprehension'}</h3>
      {block.questions.map((q, qi) => (
        <div key={qi} className="comp-question">
          <p className="prompt">{q.q}</p>
          <div className="mcq-options">
            {q.options.map((o, oi) => {
              let cls = 'mcq-option';
              if (answers[qi] !== undefined) {
                if (oi === q.correct && answers[qi] === oi) cls += ' is-correct';
                else if (oi === answers[qi]) cls += ' is-wrong';
              }
              return <button key={oi} className={cls} onClick={() => answer(qi, oi)}>{o}</button>;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Journal({ block, done, onDone, packId, dayId, blockIndex }) {
  const [text, setText] = useState(() => loadJournal(packId, dayId, blockIndex));
  const save = () => {
    saveJournal(packId, dayId, blockIndex, text);
    if (!done) onDone();
  };
  return (
    <div className="block block-journal">
      <h3>📓 Journal</h3>
      <p className="prompt">{md(block.prompt)}</p>
      {block.starters && (
        <p className="hint-text">Starters: {block.starters.join(' · ')}</p>
      )}
      <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder={ui('journalPlaceholder', 'Write here…')} />
      <button className="done-btn" onClick={save} disabled={!text.trim()}>
        {done ? '✓ Saved — save again' : 'Save entry'}
      </button>
    </div>
  );
}

export const BLOCK_COMPONENTS = {
  card: Card,
  chips: Chips,
  contrast: Contrast,
  mcq: Mcq,
  typed: Typed,
  dictation: Dictation,
  builder: Builder,
  dialogue: Dialogue,
  shadow: Shadow,
  comprehension: Comprehension,
  journal: Journal,
};
