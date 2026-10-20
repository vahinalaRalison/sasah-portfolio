import clsx from 'clsx';
import type { ReactNode } from 'react';
import { LANDS, landById, landIndex } from '../journey/lands';
import { useReveal } from '../journey/useReveal';

interface SectionProps {
  /** Identifiant de la terre (= ancre de la section) */
  land: string;
  children: ReactNode;
}

/**
 * Une terre du voyage : panneau d'arrivée, titre calligraphié, contenu
 * qui se dévoile quand le cheval y parvient.
 */
export function Section({ land: landId, children }: SectionProps) {
  const land = landById(landId);
  const index = landIndex(landId);
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section id={land.id} ref={ref} className="scroll-mt-24 px-4 py-20 sm:px-6">
      <div className={clsx('mx-auto max-w-6xl transition-all duration-700 ease-out', visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0')}>
        <header className="mb-12 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border-2 border-gold-300 bg-white/80 px-4 py-1 text-xs font-bold uppercase tracking-widest text-barbie-700 shadow-sm">
            <span aria-hidden>{land.emoji}</span>
            Terre {index + 1} / {LANDS.length}
          </p>
          <p className="title-script mt-3 text-4xl sm:text-5xl">{land.name}</p>
          <h2 className="mt-1 font-display text-3xl font-bold text-barbie-900 sm:text-4xl">{land.subtitle}</h2>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-barbie-400 via-gold-500 to-royal-500" />
        </header>
        {children}
      </div>
    </section>
  );
}
