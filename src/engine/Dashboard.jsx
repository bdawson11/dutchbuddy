import { useState } from 'react';
import { stats, loadProgress, resetProgress } from './progress';

function dayNumber(dayId) {
  return parseInt(dayId.split('-')[1], 10);
}

export default function Dashboard({ manifest, lessonIndex, onOpenDay, onPractice }) {
  const s = stats(manifest.packId);
  const progress = loadProgress(manifest.packId);
  const [openWeeks, setOpenWeeks] = useState(() => new Set([1]));

  const allDays = manifest.weeks.flatMap((w) => w.days);
  const levels = manifest.levels || [];
  const levelRange = levels.length
    ? `${levels[0].code} → ${levels[levels.length - 1].code}`
    : '';
  const nextDay = allDays.find((d) => progress.days[d]?.status !== 'complete') || allDays[0];
  const nextMeta = lessonIndex[nextDay];

  const toggleWeek = (w) =>
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      next.has(w) ? next.delete(w) : next.add(w);
      return next;
    });

  const doReset = () => {
    if (confirm('Reset all progress on this device? This cannot be undone.')) {
      resetProgress(manifest.packId);
      location.reload();
    }
  };

  return (
    <div className="dashboard">
      <header className="brand">
        <h1>{manifest.flag || '🌍'} {manifest.language}</h1>
        <p className="brand-sub">{manifest.tagline}</p>
      </header>

      <section className="hero">
        <h2>{manifest.hero.title}</h2>
        <p>{manifest.hero.blurb}</p>
        <ul className="hero-bullets">
          {manifest.hero.bullets.map((b, i) => (
            <li key={i}>{b.emoji} <strong>{b.strong}</strong>, {b.text}</li>
          ))}
        </ul>
      </section>

      <section className="stats-banner">
        <p className="stats-label">{manifest.flag || '🌍'} {manifest.language.toUpperCase()}{levelRange && ` · ${levelRange}`}</p>
        <div className="stats-grid">
          <div><span className="stat-num">{s.daysComplete}/{allDays.length}</span><span className="stat-label">days done</span></div>
          <div><span className="stat-num">{s.stepsDone}</span><span className="stat-label">steps done</span></div>
          <div><span className="stat-num">{s.timeMin}m</span><span className="stat-label">time logged</span></div>
          <div><span className="stat-num">{s.streak}🔥</span><span className="stat-label">day streak</span></div>
        </div>
      </section>

      {nextMeta && (
        <button className="start-here" onClick={() => onOpenDay(nextDay)}>
          <span className="start-label">🚀 {s.daysStarted === 0 ? 'START HERE' : 'CONTINUE'}</span>
          <span className="start-title">{nextMeta.emoji} {nextMeta.title}</span>
          <span className="start-meta">Day {nextMeta.day} · {nextMeta.module}.{nextMeta.unit}</span>
        </button>
      )}

      {onPractice && (
        <section className="practice-banner">
          <h2>🎯 Five spare minutes?</h2>
          <div className="practice-grid">
            <button className="practice-tile" onClick={() => onPractice('speak')}>
              <span className="practice-emoji">🎙</span>
              <span className="practice-title">Pronunciation studio</span>
              <span className="practice-sub">Listen, slow it down, say it out loud — line by line from your lessons.</span>
            </button>
            <button className="practice-tile" onClick={() => onPractice('cards')}>
              <span className="practice-emoji">🃏</span>
              <span className="practice-title">Palm cards</span>
              <span className="practice-sub">Quick flip-card rounds of the words you've met. Shaky ones come back sooner.</span>
            </button>
          </div>
        </section>
      )}

      {manifest.levels.map((level) => (
        <section key={level.code} className="level-section">
          <h2><span className="level-badge">{level.code}</span> {level.title} <span className="level-weeks">Weeks {level.weeks[0]}–{level.weeks[1]}</span></h2>
          <p className="level-blurb">{level.blurb}</p>

          {manifest.weeks
            .filter((w) => w.week >= level.weeks[0] && w.week <= level.weeks[1])
            .map((week) => {
              const doneCount = week.days.filter((d) => progress.days[d]?.status === 'complete').length;
              const open = openWeeks.has(week.week);
              return (
                <div key={week.week} className="week">
                  <button className="week-header" onClick={() => toggleWeek(week.week)}>
                    <span><strong>Week {week.week}</strong> — {week.title}</span>
                    <span className="week-meta">{doneCount} / {week.days.length} complete {open ? '▾' : '▸'}</span>
                  </button>
                  {open && (
                    <div className="day-grid">
                      {week.days.map((dayId) => {
                        const meta = lessonIndex[dayId];
                        const st = progress.days[dayId]?.status;
                        if (!meta) {
                          return (
                            <div key={dayId} className="day-card day-card-missing">
                              <span className="day-num">{dayNumber(dayId)}</span>
                              <span className="day-title">Coming soon</span>
                            </div>
                          );
                        }
                        return (
                          <button key={dayId} className={`day-card ${st === 'complete' ? 'is-complete' : ''}`} onClick={() => onOpenDay(dayId)}>
                            <span className="day-num">{meta.day} <span className="day-code">{meta.module}.{meta.unit}</span></span>
                            <span className="day-title">{meta.emoji} {meta.title}</span>
                            <span className="day-summary">{meta.summary}</span>
                            <span className="day-status">{st === 'complete' ? '✓ Complete' : st === 'in-progress' ? 'In progress' : 'Not started'}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </section>
      ))}

      <footer className="footer">
        {manifest.footer.donation && <p className="donation">❤️ {manifest.footer.donationText}</p>}
        <p className="disclosure">{manifest.footer.storageDisclosure}</p>
        <button className="reset-btn" onClick={doReset}>Reset all progress</button>
        <p className="copyright">© {new Date().getFullYear()} {manifest.appName}</p>
      </footer>
    </div>
  );
}
