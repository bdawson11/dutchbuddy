import { useEffect, useRef, useState } from 'react';
import { BLOCK_COMPONENTS } from './blocks';
import { loadProgress, recordStep, recordTime } from './progress';
import { stopSpeaking } from './audio';
import { ui } from './ui';

export default function Player({ packId, lesson, onExit }) {
  const [doneSteps, setDoneSteps] = useState(() => {
    const d = loadProgress(packId).days[lesson.id];
    return new Set(d?.steps || []);
  });
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    return () => {
      stopSpeaking();
      recordTime(packId, lesson.id, Math.round((Date.now() - startRef.current) / 1000));
    };
  }, [packId, lesson.id]);

  const total = lesson.blocks.length;
  const markDone = (i) => {
    setDoneSteps((prev) => {
      if (prev.has(i)) return prev;
      const next = new Set(prev).add(i);
      recordStep(packId, lesson.id, i, total);
      return next;
    });
  };

  const complete = doneSteps.size >= total;

  return (
    <div className="player">
      <header className="player-header">
        <button className="back-btn" onClick={onExit}>← Dashboard</button>
        <div className="player-title">
          <span className="player-emoji">{lesson.emoji}</span>
          <div>
            <h2>{lesson.title}</h2>
            <p className="player-meta">Day {lesson.day} · {lesson.module}.{lesson.unit} · {lesson.durationMin[0]}–{lesson.durationMin[1]} min</p>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(doneSteps.size / total) * 100}%` }} />
        </div>
        <p className="player-meta">{doneSteps.size} / {total} steps</p>
      </header>

      <main className="player-blocks">
        {lesson.blocks.map((block, i) => {
          const Component = BLOCK_COMPONENTS[block.type];
          if (!Component) return <div key={i} className="block">Unknown block type: {block.type}</div>;
          return (
            <Component
              key={i}
              block={block}
              done={doneSteps.has(i)}
              onDone={() => markDone(i)}
              packId={packId}
              dayId={lesson.id}
              blockIndex={i}
            />
          );
        })}
      </main>

      {complete && (
        <div className="lesson-complete">
          <h3>🎉 {ui('dayComplete', 'Day {day} done!').replace('{day}', lesson.day)}</h3>
          <p>Come back tomorrow for the next one.</p>
          <button className="done-btn" onClick={onExit}>Back to dashboard</button>
        </div>
      )}
    </div>
  );
}
