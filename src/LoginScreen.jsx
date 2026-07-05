import { useState } from 'react';
import { login, listProfiles, switchTo } from './engine/auth';

export default function LoginScreen({ onLogin, appName, tagline }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const profiles = listProfiles();

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onLogin(login(name, email));
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">🌍 {appName}</div>
        <p className="auth-tagline">{tagline}</p>

        {profiles.length > 0 && (
          <div className="auth-profiles">
            <p className="auth-label">Continue as</p>
            <div className="profile-row">
              {profiles.map((p) => (
                <button key={p.id} className="profile-chip" onClick={() => onLogin(switchTo(p.id))}>
                  <span className="profile-avatar">{p.name.slice(0, 1).toUpperCase()}</span>
                  <span className="profile-name">{p.name}</span>
                </button>
              ))}
            </div>
            <p className="auth-label auth-or">or create a new profile</p>
          </div>
        )}

        <form onSubmit={submit} className="auth-form">
          <label>
            Your name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              autoFocus
            />
          </label>
          <label>
            Email <span className="auth-optional">(optional)</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <button type="submit" className="auth-submit" disabled={!name.trim()}>Log in</button>
        </form>

        <p className="auth-note">
          No password needed. Your profile and progress are saved on this device only.
        </p>
      </div>
    </div>
  );
}
