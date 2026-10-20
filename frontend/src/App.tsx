import { About } from './components/About';
import { Contact } from './components/Contact';
import { Experience } from './components/Experience';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero/Hero';
import { Navbar } from './components/Navbar';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';
import { useProfile, useProjects } from './hooks/usePortfolio';

export default function App() {
  const profile = useProfile();
  const projects = useProjects();

  return (
    <>
      <Navbar nickname={profile.data.nickname} />
      <main>
        <Hero profile={profile.data} />
        <About profile={profile.data} offline={profile.offline} />
        <Skills skills={profile.data.skills} />
        <Experience experiences={profile.data.experiences} />
        <Projects projects={projects.data} loading={projects.loading} />
        <Contact email={profile.data.email} />
      </main>
      <Footer profile={profile.data} />
    </>
  );
}
