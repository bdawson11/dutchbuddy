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

async function fetchLesson(packId, dayId) {
  try {
    const res = await fetch(`${packBase(packId)}/lessons/${dayId}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

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
  const [lessonIndex, setLessonIndex] = useState({}); // dayId -> metadata (from index.json)
  const [lessons, setLessons] = useState({}); // dayId -> full lesson, fetched on open
  const [openLesson, setOpenLesson] = useState(null);
  const [loadingPack, setLoadingPack] = useState(false);
  const [loadingLesson, setLoadingLesson] = useState(false);
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

  // When a language is chosen, apply its manifest config and load the lesson
  // index (one small file). Full lessons are fetched lazily when opened; if a
  // pack has no index.json we fall back to fetching every lesson up front.
  useEffect(() => {
    if (!packId || !catalog) {
      setManifest(null);
      setLessonIndex({});
      setLessons({});
      // Back to the YapWorld shell — drop the per-language accent so the
      // umbrella brand colour (from base.css :root) takes over again.
      document.documentElement.style.removeProperty('--accent');
      return;
    }
    const entry = catalog.packs.find((p) => p.packId === packId);
    if (!entry) return;
    setLoadingPack(true);
    setManifest(entry.manifest);
    setLessons({});
    configureAudio(entry.manifest.locale, entry.manifest.audio);
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
      let index = null;
      try {
        const res = await fetch(`${packBase(packId)}/index.json`);
        if (res.ok) index = (await res.json()).days;
      } catch {
        index = null;
      }
      if (!index) {
        const entries = await Promise.all(
          dayIds.map(async (id) => {
            const lesson = await fetchLesson(packId, id);
            return lesson ? [id, lesson] : null;
          })
        );
        const full = Object.fromEntries(entries.filter(Boolean));
        if (cancelled) return;
        setLessons(full);
        index = full;
      }
      if (cancelled) return;
      setLessonIndex(index);
      setLoadingPack(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [packId, catalog]);

  const openDay = async (dayId) => {
    if (!lessonIndex[dayId]) return;
    window.scrollTo(0, 0);
    if (lessons[dayId]) {
      setOpenLesson(dayId);
      return;
    }
    setLoadingLesson(true);
    const lesson = await fetchLesson(packId, dayId);
    setLoadingLesson(false);
    if (!lesson) {
      setError(`Couldn't load ${dayId}.`);
      return;
    }
    setLessons((prev) => ({ ...prev, [dayId]: lesson }));
    setOpenLesson(dayId);
  };

  const allDayIds = manifest ? manifest.weeks.flatMap((w) => w.days) : [];
  const nextDayId = openLesson ? allDayIds[allDayIds.indexOf(openLesson) + 1] : null;
  const hasNext = Boolean(nextDayId && lessonIndex[nextDayId]);

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
      ) : openLesson && lessons[openLesson] ? (
        <Player
          key={openLesson}
          packId={manifest.packId}
          lesson={lessons[openLesson]}
          onExit={() => setOpenLesson(null)}
          onNext={hasNext ? () => openDay(nextDayId) : null}
        />
      ) : (
        <Dashboard
          manifest={manifest}
          lessonIndex={lessonIndex}
          busy={loadingLesson}
          onOpenDay={openDay}
        />
      )}
    </div>
  );
}
