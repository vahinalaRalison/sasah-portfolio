import clsx from 'clsx';
import { Crown, LogOut, Sparkles } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { ApiError, api } from '../api/client';
import type { Profile, Project } from '../api/types';
import { CvPanel } from './CvPanel';
import { ExperiencesPanel } from './ExperiencesPanel';
import { ExportPanel } from './ExportPanel';
import { MessagesPanel } from './MessagesPanel';
import { ProfilePanel } from './ProfilePanel';
import { ProjectsPanel } from './ProjectsPanel';
import { SkillsPanel } from './SkillsPanel';
import { type Status, toErrorStatus } from './form';
import { StatusLine } from './ui';
import { useAdminSession } from './useAdminSession';

type Tab = 'profile' | 'skills' | 'experiences' | 'projects' | 'cv' | 'messages' | 'export';

const TABS: { id: Tab; label: string }[] = [
  { id: 'profile', label: '🌸 Profil' },
  { id: 'skills', label: '🌲 Compétences' },
  { id: 'experiences', label: '⛰️ Expériences' },
  { id: 'projects', label: '💎 Projets' },
  { id: 'cv', label: '🎁 CV' },
  { id: 'messages', label: '💌 Messages' },
  { id: 'export', label: '📦 Export' },
];

/** Espace d'administration (/admin) : connexion par mot de passe, puis édition des données. */
export function AdminApp() {
  const session = useAdminSession();

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <a href="/" className="title-script text-4xl">
              Sasah
            </a>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-barbie-700">
              <Crown className="h-4 w-4 text-gold-500" aria-hidden /> Espace admin
            </p>
          </div>
          {session.token && (
            <button type="button" className="btn-ghost px-4 py-2 text-sm" onClick={session.logout}>
              <LogOut className="h-4 w-4" aria-hidden /> Se déconnecter
            </button>
          )}
        </header>
        {session.token ? session.checking ? <p className="text-sm text-barbie-700">Vérification de la session…</p> : <Dashboard onUnauthorized={session.logout} /> : <Login onLogin={session.login} />}
      </div>
    </div>
  );
}

function Login({ onLogin }: { onLogin: (password: string) => Promise<void> }) {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: 'saving' });
    try {
      await onLogin(password);
    } catch (err) {
      setStatus(toErrorStatus(err));
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto max-w-md space-y-4">
      <h1 className="font-display text-2xl font-bold text-barbie-900">Entrée du château</h1>
      <p className="text-sm text-barbie-800/70">Le mot de passe est celui de la variable ADMIN_PASSWORD des services.</p>
      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-barbie-900">Mot de passe</span>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus autoComplete="current-password" required />
      </label>
      <button type="submit" className="btn-royal w-full justify-center" disabled={status.kind === 'saving' || !password}>
        <Sparkles className="h-4 w-4" aria-hidden /> Entrer
      </button>
      <StatusLine status={status} />
    </form>
  );
}

function Dashboard({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [tab, setTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getProfile(), api.getProjects()])
      .then(([p, list]) => {
        if (cancelled) return;
        setProfile(p);
        setProjects(list);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) onUnauthorized();
        setError(err instanceof Error ? err.message : 'Impossible de charger les données');
      });
    return () => {
      cancelled = true;
    };
  }, [onUnauthorized]);

  if (error) return <p className="card text-sm font-semibold text-red-600">{error} — l'API est-elle démarrée ?</p>;
  if (!profile || !projects) return <p className="text-sm text-barbie-700">Chargement des données…</p>;

  return (
    <>
      <nav className="mb-5 flex flex-wrap gap-2" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={clsx(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition',
              tab === t.id ? 'bg-gradient-to-r from-barbie-500 to-royal-500 text-white shadow-glow' : 'bg-white/70 text-barbie-700 hover:bg-white',
            )}
            aria-current={tab === t.id ? 'page' : undefined}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {tab === 'profile' && <ProfilePanel key={profile.email + profile.fullName} profile={profile} onChange={setProfile} />}
      {tab === 'skills' && <SkillsPanel profile={profile} onChange={setProfile} />}
      {tab === 'experiences' && <ExperiencesPanel profile={profile} onChange={setProfile} />}
      {tab === 'projects' && <ProjectsPanel projects={projects} onChange={setProjects} />}
      {tab === 'cv' && <CvPanel profile={profile} onChange={setProfile} />}
      {tab === 'messages' && <MessagesPanel />}
      {tab === 'export' && <ExportPanel profile={profile} projects={projects} />}
    </>
  );
}
