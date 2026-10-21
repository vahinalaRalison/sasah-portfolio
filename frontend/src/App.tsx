import { Gamepad2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminApp } from './admin/AdminApp';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Experience } from './components/Experience';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero/Hero';
import { Navbar } from './components/Navbar';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';
import { Game } from './game/Game';
import { useProfile, useProjects } from './hooks/usePortfolio';
import { JourneyTrack } from './journey/JourneyTrack';
import { useJourney } from './journey/useJourney';

type Mode = 'game' | 'read';
const MODE_KEY = 'sasah-mode';

function loadMode(): Mode {
  try {
    return localStorage.getItem(MODE_KEY) === 'read' ? 'read' : 'game';
  } catch {
    return 'game';
  }
}

/** `/admin` : espace d'administration ; tout le reste : le portfolio (jeu ou lecture). */
const isAdminRoute = () => typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '') === '/admin';

export default function App() {
  if (isAdminRoute()) return <AdminApp />;
  return <Portfolio />;
}

function Portfolio() {
  const profile = useProfile();
  const projects = useProjects();
  const [mode, setMode] = useState<Mode>(loadMode);

  useEffect(() => {
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* stockage indisponible */
    }
  }, [mode]);

  if (mode === 'game') {
    return <Game profile={profile.data} projects={projects.data} onRead={() => setMode('read')} />;
  }
  return <ReadingPage onPlay={() => setMode('game')} />;
}

/** Page classique : le voyage au défilement, pour lire sans jouer. */
function ReadingPage({ onPlay }: { onPlay: () => void }) {
  const profile = useProfile();
  const projects = useProjects();
  const journey = useJourney();

  return (
    <>
      <Navbar nickname={profile.data.nickname} activeLand={journey.activeLand} />
      <main className="pb-[150px] sm:pb-[160px]">
        <Hero profile={profile.data} progress={journey.progress} activeLand={journey.activeLand} />
        <About profile={profile.data} offline={profile.offline} />
        <Skills skills={profile.data.skills} />
        <Experience experiences={profile.data.experiences} />
        <Projects projects={projects.data} loading={projects.loading} />
        <Contact email={profile.data.email} />
        <Footer profile={profile.data} />
      </main>
      <JourneyTrack {...journey} />
      <button type="button" onClick={onPlay} className="btn-royal fixed right-4 top-20 z-[60] px-4 py-2 text-sm sm:top-4">
        <Gamepad2 className="h-4 w-4" aria-hidden /> Jouer
      </button>
    </>
  );
}
