import { useEffect, useState } from 'react';
import { LANDS } from './lands';

export interface JourneyState {
  /** Avancement global du voyage, de 0 (départ) à 1 (château du bal) */
  progress: number;
  /** Terre dans laquelle se trouve le cheval */
  activeLand: string;
  /** Vrai pendant le défilement : le cheval galope */
  moving: boolean;
}

/** Position d'une terre (en fraction de la page) : le milieu de sa section. */
function computeLandPositions(): { id: string; at: number }[] {
  const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  return LANDS.map((land) => {
    const el = document.getElementById(land.id);
    if (!el) return { id: land.id, at: 0 };
    const top = el.getBoundingClientRect().top + window.scrollY;
    return { id: land.id, at: Math.min(1, Math.max(0, (top - window.innerHeight * 0.35) / total)) };
  });
}

/**
 * Suit le défilement et le traduit en « voyage » : progression, terre active, mouvement.
 * Une seule écoute scroll/resize pour toute l'application, throttlée par requestAnimationFrame.
 */
export function useJourney(): JourneyState {
  const [state, setState] = useState<JourneyState>({ progress: 0, activeLand: LANDS[0]!.id, moving: false });

  useEffect(() => {
    let positions = computeLandPositions();
    let frame = 0;
    let stopTimer = 0;

    const update = (moving: boolean) => {
      const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / total));
      let activeLand = positions[0]?.id ?? LANDS[0]!.id;
      for (const p of positions) if (progress >= p.at) activeLand = p.id;
      setState((prev) =>
        prev.progress === progress && prev.activeLand === activeLand && prev.moving === moving ? prev : { progress, activeLand, moving },
      );
    };

    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          update(true);
        });
      }
      window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => update(false), 160);
    };

    const onResize = () => {
      positions = computeLandPositions();
      update(false);
    };

    // Les sections se chargent (API) et changent de hauteur : on recalcule les repères.
    const observer = new ResizeObserver(onResize);
    observer.observe(document.body);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    update(false);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(stopTimer);
    };
  }, []);

  return state;
}
