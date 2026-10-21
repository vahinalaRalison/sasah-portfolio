import { ExternalLink, GitBranch } from 'lucide-react';
import type { Profile } from '../api/types';
import { PILLARS } from '../data/pillars';
import { ContactForm } from '../components/ContactForm';
import { Stars } from '../components/Skills';
import { formatMonth } from '../lib/format';
import type { Poi } from './world';

interface PoiCardProps {
  poi: Poi;
  profile: Profile;
  isTouch: boolean;
}

/**
 * Contenu dévoilé quand le cheval s'arrête devant un point d'intérêt.
 * La carte garde une position et une taille fixes (CSS) : seul le contenu change et défile.
 */
export function PoiCard({ poi, profile, isTouch }: PoiCardProps) {
  return (
    <aside className="poi-card" role="dialog" aria-label={poi.label}>
      <header className="poi-card-head">
        <span className="poi-card-emoji" aria-hidden>
          {poi.emoji}
        </span>
        <h2 className="font-display text-xl font-bold text-barbie-900">{poi.label}</h2>
      </header>
      <div className="poi-card-body" key={poi.id}>
        <PoiContent poi={poi} profile={profile} isTouch={isTouch} />
      </div>
    </aside>
  );
}

function PoiContent({ poi, profile, isTouch }: PoiCardProps) {
  switch (poi.kind) {
    case 'intro':
      return (
        <>
          <p className="title-script text-4xl text-barbie-500">{profile.nickname}</p>
          <p className="font-display text-lg font-bold">
            {profile.fullName} · {profile.title}
          </p>
          <p className="mt-2 text-sm text-barbie-900/80">{profile.tagline}</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>{isTouch ? '▶ ◀ pour avancer et reculer' : '→ ← (ou D / Q) pour avancer et reculer'}</li>
            <li>{isTouch ? '⤒ pour sauter' : '↑ ou Espace pour sauter'}</li>
            <li>⭐ Ramassez les étoiles, certaines demandent un saut</li>
            <li>📍 Approchez-vous des panneaux : chaque terre dévoile une partie de mon histoire</li>
          </ul>
        </>
      );
    case 'about':
      return (
        <>
          <p className="text-sm leading-relaxed text-barbie-900/85">{profile.bio}</p>
          <p className="mt-3 text-sm font-semibold text-barbie-600">📍 {profile.location}</p>
        </>
      );
    case 'pillars':
      return (
        <ul className="grid gap-3 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <li key={p.title} className="rounded-2xl bg-barbie-50 p-3">
              <p.icon className="h-6 w-6 text-barbie-500" aria-hidden />
              <h3 className="mt-1 font-display font-bold">{p.title}</h3>
              <p className="text-xs text-barbie-900/75">{p.text}</p>
            </li>
          ))}
        </ul>
      );
    case 'skills': {
      const skills = profile.skills.filter((s) => s.category === poi.category).sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));
      return (
        <ul className="space-y-2">
          {skills.map((skill) => (
            <li key={skill.name} className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">{skill.name}</span>
              <Stars level={skill.level} />
            </li>
          ))}
        </ul>
      );
    }
    case 'experience': {
      const exp = poi.experience!;
      return (
        <>
          <p className="text-xs font-bold uppercase tracking-wider text-royal-700">
            {formatMonth(exp.startDate)} → {formatMonth(exp.endDate)}
          </p>
          <h3 className="mt-1 font-display text-lg font-bold">{exp.role}</h3>
          <p className="text-sm text-barbie-900/80">{exp.summary}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {exp.highlights.map((h) => (
              <li key={h} className="chip">
                {h}
              </li>
            ))}
          </ul>
        </>
      );
    }
    case 'project': {
      const p = poi.project!;
      return (
        <>
          <p className="text-sm font-semibold text-barbie-600">{p.tagline}</p>
          <p className="mt-2 text-sm text-barbie-900/80">{p.description}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {p.stack.map((s) => (
              <li key={s} className="chip">
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-4 text-sm font-semibold">
            <span className="text-barbie-400">{p.year}</span>
            {p.repoUrl && (
              <a href={p.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-royal-700 hover:underline">
                <GitBranch className="h-4 w-4" aria-hidden /> Code
              </a>
            )}
            {p.liveUrl && (
              <a href={p.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-barbie-600 hover:underline">
                <ExternalLink className="h-4 w-4" aria-hidden /> Voir
              </a>
            )}
          </div>
        </>
      );
    }
    case 'contact':
      return (
        <>
          <p className="text-sm text-barbie-900/80">
            Vous êtes arrivés au bal ! Un projet, une mission ? Écrivez-moi ici ou à{' '}
            <a href={`mailto:${profile.email}`} className="font-semibold text-barbie-600 hover:underline">
              {profile.email}
            </a>
            .
          </p>
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">
            {profile.links.map((l) => (
              <li key={l.label}>
                <a href={l.url} target="_blank" rel="noreferrer" className="chip hover:bg-barbie-200">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <ContactForm compact />
          </div>
        </>
      );
  }
}
