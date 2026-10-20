import { Star } from 'lucide-react';
import type { Skill } from '../api/types';
import { CATEGORY_LABELS, CATEGORY_ORDER, groupBy } from '../lib/format';
import { Section } from './Section';

function Stars({ level }: { level: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${level} sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={i < level ? 'h-4 w-4 fill-gold-500 text-gold-500' : 'h-4 w-4 text-barbie-200'} aria-hidden />
      ))}
    </span>
  );
}

export function Skills({ skills }: { skills: Skill[] }) {
  const grouped = groupBy(skills, (s) => s.category);

  return (
    <Section land="skills">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_ORDER.filter((c) => grouped[c]?.length).map((category) => (
          <div key={category} className="card">
            <h3 className="font-display text-xl font-bold text-barbie-700">{CATEGORY_LABELS[category]}</h3>
            <ul className="mt-4 space-y-3">
              {grouped[category]?.map((skill) => (
                <li key={skill.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold">{skill.name}</span>
                  <Stars level={skill.level} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
