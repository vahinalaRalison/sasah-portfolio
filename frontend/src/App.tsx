import { About } from './components/About';
import { Contact } from './components/Contact';
import { Experience } from './components/Experience';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero/Hero';
import { Navbar } from './components/Navbar';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';
import { useProfile, useProjects } from './hooks/usePortfolio';
import { JourneyTrack } from './journey/JourneyTrack';
import { useJourney } from './journey/useJourney';

export default function App() {
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
    </>
  );
}
