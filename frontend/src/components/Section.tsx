import type { ReactNode } from 'react';

interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}

/** Gabarit commun de section : ancre, titre calligraphié et contenu. */
export function Section({ id, eyebrow, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 text-center">
          <p className="title-script text-4xl sm:text-5xl">{eyebrow}</p>
          <h2 className="mt-1 font-display text-3xl font-bold text-barbie-900 sm:text-4xl">{title}</h2>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-barbie-400 via-gold-500 to-royal-500" />
        </header>
        {children}
      </div>
    </section>
  );
}
