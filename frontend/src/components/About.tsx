import type { Profile } from '../api/types';
import { PILLARS } from '../data/pillars';
import { Section } from './Section';

export function About({ profile, offline }: { profile: Profile; offline: boolean }) {
  return (
    <Section land="about">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="card animate-rise">
          <p className="text-lg leading-relaxed text-barbie-900/85">{profile.bio}</p>
          <p className="mt-4 text-sm font-semibold text-barbie-600">📍 {profile.location}</p>
          {offline && (
            <p className="mt-4 rounded-xl bg-gold-300/40 px-3 py-2 text-xs font-semibold text-barbie-800">
              Mode hors-ligne : l’API est injoignable, données locales affichées.
            </p>
          )}
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map((p, i) => (
            <li key={p.title} className="card animate-rise transition hover:-translate-y-1" style={{ animationDelay: `${i * 80}ms` }}>
              <p.icon className="h-8 w-8 text-barbie-500" aria-hidden />
              <h3 className="mt-3 font-display text-lg font-bold">{p.title}</h3>
              <p className="mt-1 text-sm text-barbie-900/75">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
