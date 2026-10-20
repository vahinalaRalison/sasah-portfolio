import { useMemo } from 'react';

interface Spark {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  hue: 'pink' | 'gold' | 'violet';
}

const COLORS = { pink: '#ff5bb0', gold: '#f5c542', violet: '#8f6cff' } as const;

/** Générateur pseudo-aléatoire déterministe (même rendu à chaque chargement). */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Sparkles({ count = 24 }: { count?: number }) {
  const sparks = useMemo<Spark[]>(() => {
    const rand = mulberry32(42);
    const hues: Spark['hue'][] = ['pink', 'gold', 'violet'];
    return Array.from({ length: count }, () => ({
      left: rand() * 100,
      top: rand() * 100,
      size: 6 + rand() * 14,
      delay: rand() * 3,
      duration: 1.8 + rand() * 2,
      hue: hues[Math.floor(rand() * hues.length)] ?? 'pink',
    }));
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {sparks.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="absolute animate-twinkle"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
        >
          <path d="M12 0 C13 7 17 11 24 12 C17 13 13 17 12 24 C11 17 7 13 0 12 C7 11 11 7 12 0 Z" fill={COLORS[s.hue]} />
        </svg>
      ))}
    </div>
  );
}
