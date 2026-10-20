import clsx from 'clsx';
import { ExternalLink, GitBranch } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Project } from '../api/types';
import { Section } from './Section';

export function Projects({ projects, loading }: { projects: Project[]; loading: boolean }) {
  const [tech, setTech] = useState<string | null>(null);

  const technologies = useMemo(() => [...new Set(projects.flatMap((p) => p.stack))].sort((a, b) => a.localeCompare(b)), [projects]);
  const visible = useMemo(() => (tech ? projects.filter((p) => p.stack.includes(tech)) : projects), [projects, tech]);

  return (
    <Section land="projects">
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <FilterChip active={tech === null} onClick={() => setTech(null)}>
          Tous
        </FilterChip>
        {technologies.map((t) => (
          <FilterChip key={t} active={tech === t} onClick={() => setTech(t)}>
            {t}
          </FilterChip>
        ))}
      </div>

      <ul className={clsx('grid gap-6 md:grid-cols-2 lg:grid-cols-3', loading && 'opacity-60')} aria-busy={loading}>
        {visible.map((p, i) => (
          <li key={p.slug} className="card group relative flex animate-rise flex-col transition hover:-translate-y-1 hover:shadow-glow" style={{ animationDelay: `${i * 60}ms` }}>
            {p.featured && <span className="absolute right-4 top-4 rounded-full bg-gold-300 px-2 py-0.5 text-xs font-bold text-barbie-900">★ Coup de cœur</span>}
            <span className="text-4xl" aria-hidden>
              {p.emoji}
            </span>
            <h3 className="mt-3 font-display text-xl font-bold">{p.name}</h3>
            <p className="text-sm font-semibold text-barbie-600">{p.tagline}</p>
            <p className="mt-3 flex-1 text-sm text-barbie-900/80">{p.description}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <li key={s} className="chip">
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-4 text-sm font-semibold">
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
          </li>
        ))}
      </ul>
    </Section>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        'rounded-full px-4 py-1.5 text-sm font-semibold transition',
        active ? 'bg-gradient-to-r from-barbie-500 to-royal-500 text-white shadow-glow' : 'bg-white/70 text-barbie-700 hover:bg-barbie-100',
      )}
    >
      {children}
    </button>
  );
}
