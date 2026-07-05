import { useEffect, useState } from 'react';
import Dashboard from './engine/Dashboard';
import Player from './engine/Player';
import LoginScreen from './LoginScreen';
import LanguagePicker from './LanguagePicker';
import { configureAudio } from './engine/audio';
import { configureGrading } from './engine/grading';
import { configureUi } from './engine/ui';
import { setProgressUser } from './engine/progress';
import { currentUser, logout, getSelectedPack, setSelectedPack } from './engine/auth';

const BASE = import.meta.env.BASE_URL;
const packBase = (packId) => `${BASE}packs/${packId}`;

// Set the progress namespace synchronously at module load so the very first
// render (e.g. the language picker's per-course stats) reads the right profile.
const initialUser = currentUser();
setProgressUser(initialUser?.id || null);

function TopBar({ appName, manifest, user, onSwitch, onLogout }) {
  return (
    <div className="topbar">
      <button className="wordmark link-btn" onClick={onSwitch}>🌍 {appName}</button>
      <div className="topbar-right">
        {manifest && (
          <span className="topbar-lang">{manifest.flag || '🌍'} {manifest.language}</span>
        )}
        <button className="link-btn" onClick={onSwitch}>Switch language</button>
        <button className="link-btn" onClick={onLogout}>Log out{user ? ` (${user.name})` : ''}</button>
      </div>
    </div>
  );
}

export default function AppShell() {
  const [catalog, setCatalog] = useState(null);
  const [user, setUserState] = useState(initialUser);
  const [packId, setPackId] = useState(null);
  const [manifest, setManifest] = useState(null);
  const [lessonIndex, setLessonIndex] = useState({});
  const [openLesson, setOpenLesson] = useState(null);
  const [loadingPack, setLoadingPack] = useState(false);
  const [error, setError] = useState(null);

  const applyUser = (u) => {
    setProgressUser(u?.id || null);
    setUserState(u);
  };

  // Load the catalog + every pack's manifest once (manifests power the picker
  // and, once a language is chosen, the course itself).
  useEffect(() => {
    (async () => {
      try {
        const cat = await (await fetch(`${BASE}packs/catalog.json`)).json();
        const packs = await Promise.all(
          cat.packs.map(async (id) => {
            try {
              const m = await (await fetch(`${packBase(id)}/manifest.json`)).json();
              return { packId: id, manifest: m };
            } catch {
              return null;
            }
          })
        );
        setCatalog({ ...cat, packs: packs.filter(Boolean) });
      } catch (e) {
        setError(String(e));
      }
    })();
  }, []);

  // When a user signs in, restore the language they last chose.
  useEffect(() => {
    setPackId(user ? getSelectedPack(user.id) : null);
    setOpenLesson(null);
  }, [user]);

  // When a language is chosen, load its manifest config + lessons.
  useEffect(() => {
    if (!packId || !catalog) {
      setManifest(null);
      setLessonIndex({});
      // Back to the YapWorld shell — drop the per-language accent so the
      // umbrella brand colour (from base.css :root) takes over again.
      document.documentElement.style.removeProperty('--accent');
      return;
    }
    const entry = catalog.packs.find((p) => p.packId === packId);
    if (!entry) return;
    setLoadingPack(true);
    setManifest(entry.manifest);
    configureAudio(entry.manifest.locale, packBase(packId));
    configureGrading(entry.manifest.grading);
    configureUi(entry.manifest);
    // Per-language theming: every surface derives its tints from this one hook.
    if (entry.manifest.accent) {
      document.documentElement.style.setProperty('--accent', entry.manifest.accent);
    } else {
      document.documentElement.style.removeProperty('--accent');
    }
    let cancelled = false;
    (async () => {
      const dayIds = entry.manifest.weeks.flatMap((w) => w.days);
      const entries = await Promise.all(
        dayIds.map(async (id) => {
          const res = await fetch(`${packBase(packId)}/lessons/${id}.json`);
          if (!res.ok) return null;
          try {
            return [id, await res.json()];
          } catch {
            return null;
          }
        })
      );
      if (cancelled) return;
      setLessonIndex(Object.fromEntries(entries.filter(Boolean)));
      setLoadingPack(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [packId, catalog]);

  const choosePack = (id) => {
    setSelectedPack(user.id, id);
    setPackId(id);
    setOpenLesson(null);
    window.scrollTo(0, 0);
  };
  const backToLanguages = () => {
    if (user) setSelectedPack(user.id, null);
    setPackId(null);
    setOpenLesson(null);
    window.scrollTo(0, 0);
  };
  const doLogout = () => {
    logout();
    applyUser(null);
  };

  if (error) return <div className="loading">Couldn't load YapWorld. {error}</div>;
  if (!catalog) return <div className="loading">Loading…</div>;
  if (!user) {
    return <LoginScreen onLogin={applyUser} appName={catalog.app} tagline={catalog.tagline} />;
  }
  if (!packId) {
    return <LanguagePicker catalog={catalog} user={user} onPick={choosePack} onLogout={doLogout} />;
  }

  return (
    <div className="app">
      {!openLesson && (
        <TopBar
          appName={catalog.app}
          manifest={manifest}
          user={user}
          onSwitch={backToLanguages}
          onLogout={doLogout}
        />
      )}
      {loadingPack || !manifest ? (
        <div className="loading">Loading your course…</div>
      ) : openLesson ? (
        <Player
          packId={manifest.packId}
          lesson={lessonIndex[openLesson]}
          onExit={() => setOpenLesson(null)}
        />
      ) : (
        <Dashboard
          manifest={manifest}
          lessonIndex={lessonIndex}
          onOpenDay={(dayId) => {
            if (lessonIndex[dayId]) {
              setOpenLesson(dayId);
              window.scrollTo(0, 0);
            }
          }}
        />
      )}
    </div>
  );
}
