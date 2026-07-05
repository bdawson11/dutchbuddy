import { stats } from './engine/progress';

export default function LanguagePicker({ catalog, user, onPick, onLogout }) {
  return (
    <div className="picker">
      <div className="picker-top">
        <div className="wordmark">🌍 {catalog.app}</div>
        <div className="picker-user">
          <span className="picker-hi">Hi, {user.name}</span>
          <button className="link-btn" onClick={onLogout}>Log out</button>
        </div>
      </div>

      <h1 className="picker-h1">What do you want to learn?</h1>
      <p className="picker-sub">{catalog.tagline}</p>

      <div className="lang-grid">
        {catalog.packs.map(({ packId, manifest }) => {
          const s = stats(manifest.packId);
          const levels = manifest.levels || [];
          const range = levels.length ? `${levels[0].code}–${levels[levels.length - 1].code}` : '';
          return (
            <button
              key={packId}
              className="lang-card"
              onClick={() => onPick(packId)}
              style={manifest.accent ? { '--accent': manifest.accent } : undefined}
            >
              <span className="lang-flag">{manifest.flag || '🌍'}</span>
              <span className="lang-name">{manifest.language}</span>
              <span className="lang-tagline">{manifest.tagline}</span>
              <span className="lang-meta">
                {range}
                {' · '}
                {s.daysComplete > 0 ? `${s.daysComplete} days done` : 'Start from day 1'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
