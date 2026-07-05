import { useEffect, useState } from 'react';
import Dashboard from './engine/Dashboard';
import Player from './engine/Player';
import { configureAudio } from './engine/audio';
import { configureGrading } from './engine/grading';
import { configureUi } from './engine/ui';

const PACK = import.meta.env.VITE_PACK || 'dutch-nl';
const base = `${import.meta.env.BASE_URL}packs/${PACK}`;

export default function AppShell() {
  const [manifest, setManifest] = useState(null);
  const [lessonIndex, setLessonIndex] = useState({});
  const [openLesson, setOpenLesson] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const m = await (await fetch(`${base}/manifest.json`)).json();
        setManifest(m);
        configureAudio(m.locale);
        configureGrading(m.grading);
        configureUi(m);
        // Index available lessons (missing days render as "coming soon").
        const dayIds = m.weeks.flatMap((w) => w.days);
        const entries = await Promise.all(
          dayIds.map(async (id) => {
            const res = await fetch(`${base}/lessons/${id}.json`);
            if (!res.ok) return null;
            try {
              return [id, await res.json()];
            } catch {
              return null;
            }
          })
        );
        setLessonIndex(Object.fromEntries(entries.filter(Boolean)));
      } catch (e) {
        setError(String(e));
      }
    })();
  }, []);

  if (error) return <div className="loading">Couldn't load the course pack. {error}</div>;
  if (!manifest) return <div className="loading">Loading…</div>;

  if (openLesson) {
    return (
      <Player
        packId={manifest.packId}
        lesson={lessonIndex[openLesson]}
        onExit={() => setOpenLesson(null)}
      />
    );
  }

  return (
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
  );
}
