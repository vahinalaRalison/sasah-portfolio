import type { Experience as ExperienceItem } from '../api/types';
import { formatMonth } from '../lib/format';
import { Section } from './Section';

export function Experience({ experiences }: { experiences: ExperienceItem[] }) {
  return (
    <Section id="experience" eyebrow="Mon chemin" title="Parcours">
      <ol className="relative mx-auto max-w-3xl border-l-4 border-barbie-200 pl-8">
        {experiences.map((exp) => (
          <li key={exp.id} className="relative mb-10 last:mb-0">
            <span className="absolute -left-[2.65rem] top-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-barbie-400 to-royal-500 text-sm shadow-glow">
              {exp.endDate ? '✦' : '👑'}
            </span>
            <article className="card">
              <p className="text-xs font-bold uppercase tracking-wider text-royal-700">
                {formatMonth(exp.startDate)} → {formatMonth(exp.endDate)}
              </p>
              <h3 className="mt-1 font-display text-xl font-bold">{exp.role}</h3>
              <p className="font-semibold text-barbie-600">{exp.company}</p>
              <p className="mt-3 text-sm text-barbie-900/80">{exp.summary}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {exp.highlights.map((h) => (
                  <li key={h} className="chip">
                    {h}
                  </li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
    </Section>
  );
}
