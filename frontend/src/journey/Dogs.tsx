import clsx from 'clsx';
import { memo, type CSSProperties } from 'react';
import './dogs.css';

export type DogSex = 'male' | 'female';

export interface DogSpec {
  readonly id: string;
  readonly sex: DogSex;
  /** Couleur du nœud (ruban sur la tête pour les femelles, nœud papillon pour le mâle) */
  readonly bow: string;
  /** Taille relative (1 = 72 px de large) */
  readonly size: number;
}

/** La meute : un mâle et trois femelles, tous cotons de Tuléar. */
const PACK: readonly DogSpec[] = [
  { id: 'm1', sex: 'male', bow: '#5b3fd6', size: 1.08 },
  { id: 'f1', sex: 'female', bow: '#ff2d95', size: 0.96 },
  { id: 'f2', sex: 'female', bow: '#8f6cff', size: 0.9 },
  { id: 'f3', sex: 'female', bow: '#f5c542', size: 0.86 },
];

/**
 * Un coton de Tuléar : petit chien blanc au poil long et cotonneux, oreilles tombantes,
 * truffe et yeux noirs. Les groupes `transform=` positionnent, les groupes `className=` s'animent.
 * L'état est piloté par `data-state` sur l'ancêtre `.pack` : idle | move | jump | enter.
 */
export function Dog({ spec, className }: { spec: DogSpec; className?: string }) {
  const female = spec.sex === 'female';
  return (
    <svg viewBox="0 0 124 84" className={clsx('dog-svg', className)} aria-hidden>
      <ellipse className="dog-shadow" cx="60" cy="80" rx="40" ry="4" fill="#5c0032" opacity="0.18" />

      {/* Pattes arrière-plan : une seule animation pour la paire (allure bondissante) */}
      <g className="dleg dleg-back">
        <g transform="translate(34 56)">
          <Leg tone="#ebe6f5" />
        </g>
        <g transform="translate(78 56)">
          <Leg tone="#ebe6f5" />
        </g>
      </g>

      {/* Queue en panache, portée sur le dos */}
      <g transform="translate(24 40)">
        <g className="dtail">
          <path d="M0 4 C-10 -4 -14 -18 -2 -26 C6 -30 14 -24 12 -14 C10 -6 6 0 0 4 Z" fill="#fff" stroke="#e3dcf0" strokeWidth="1.5" />
          <path d="M-4 -8 C-6 -16 0 -22 6 -20" stroke="#f4f0fb" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      </g>

      <g className="dog-body">
        {/* Corps cotonneux : contour ondulé façon poil long */}
        <path
          d="M20 48 C16 34 30 26 48 27 C64 25 80 27 92 34 C100 40 100 52 94 58 C98 64 90 68 82 64 C76 70 66 70 60 65 C54 70 44 70 38 64 C30 68 20 64 24 56 C18 54 18 50 20 48 Z"
          fill="#fff"
          stroke="#e3dcf0"
          strokeWidth="1.5"
        />
        <path d="M30 38 C40 32 56 30 72 33" stroke="#f4f0fb" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M34 52 C44 56 58 56 70 52" stroke="#ede8f7" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Tête */}
        <g transform="translate(94 34)">
          <g className="dhead">
            {/* Oreilles tombantes (arrière) */}
            <path d="M-14 -2 C-24 4 -26 18 -18 26 C-10 28 -6 18 -6 8 Z" fill="#f4f0fb" stroke="#e3dcf0" strokeWidth="1.5" />
            {/* Crâne cotonneux */}
            <path
              d="M-16 -4 C-16 -18 -4 -26 8 -24 C20 -24 28 -16 28 -4 C30 6 26 14 18 16 C10 20 0 18 -8 14 C-16 10 -18 2 -16 -4 Z"
              fill="#fff"
              stroke="#e3dcf0"
              strokeWidth="1.5"
            />
            {/* Mèches sur le front */}
            <path d="M-8 -16 C-2 -24 6 -24 12 -18" stroke="#f4f0fb" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Oreille avant */}
            <path d="M14 -8 C26 -2 30 12 22 22 C14 24 10 14 10 4 Z" fill="#fff" stroke="#e3dcf0" strokeWidth="1.5" className="dear" />
            {/* Museau, truffe, bouche, langue */}
            <path d="M12 2 C20 0 28 4 30 10 C30 14 26 16 20 14 C14 14 10 10 12 2 Z" fill="#fff" stroke="#e3dcf0" strokeWidth="1.2" />
            <ellipse cx="28" cy="6" rx="3.6" ry="3" fill="#1f1530" />
            <circle cx="27" cy="5" r="1" fill="#fff" />
            <path d="M24 11 C26 14 29 14 31 12" stroke="#1f1530" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path className="dtongue" d="M24 13 C25 17 29 17 30 13 Z" fill="#ff5bb0" />
            {/* Yeux */}
            <circle cx="6" cy="-2" r="2.6" fill="#1f1530" />
            <circle cx="7" cy="-3" r="0.9" fill="#fff" />
            <circle cx="16" cy="-6" r="2.2" fill="#1f1530" />
            <circle cx="17" cy="-7" r="0.8" fill="#fff" />
            {/* Ruban sur la tête (femelles) */}
            {female && (
              <g transform="translate(2 -22)">
                <path d="M0 0 L-12 -8 L-10 4 Z" fill={spec.bow} />
                <path d="M0 0 L12 -8 L10 4 Z" fill={spec.bow} />
                <circle r="3" fill={spec.bow} stroke="#fff" strokeWidth="1" />
              </g>
            )}
          </g>
        </g>

        {/* Nœud papillon au cou (mâle) */}
        {!female && (
          <g transform="translate(84 50)">
            <path d="M0 0 L-9 -6 L-8 6 Z" fill={spec.bow} />
            <path d="M0 0 L9 -6 L8 6 Z" fill={spec.bow} />
            <circle r="2.5" fill={spec.bow} stroke="#fff" strokeWidth="1" />
          </g>
        )}
      </g>

      {/* Pattes premier plan */}
      <g className="dleg dleg-front">
        <g transform="translate(42 58)">
          <Leg tone="#fff" />
        </g>
        <g transform="translate(86 58)">
          <Leg tone="#fff" />
        </g>
      </g>
    </svg>
  );
}

function Leg({ tone }: { tone: string }) {
  return (
    <>
      <path d="M-7 -4 C-10 6 -9 14 -7 20 L7 20 C9 14 10 6 7 -4 Z" fill={tone} stroke="#e3dcf0" strokeWidth="1.3" />
      <path d="M-8 18 C-9 23 -6 25 0 25 C6 25 9 23 8 18 Z" fill={tone} stroke="#e3dcf0" strokeWidth="1.2" />
    </>
  );
}

/**
 * Les quatre chiens disposés autour du cheval : deux devant, deux derrière.
 * Le conteneur partage le repère du cheval (bas = sabots, 0 = centre).
 */
export const Pack = memo(function Pack({ className }: { className?: string }) {
  return (
    <div className={clsx('pack-dogs', className)} aria-label="Quatre cotons de Tuléar accompagnent la princesse : un mâle et trois femelles">
      {PACK.map((spec, i) => (
        <div key={spec.id} className={clsx('dog', `dog-${i + 1}`, `dog-${spec.sex}`)} style={{ '--size': spec.size, '--d': `${i * 0.11}s` } as CSSProperties}>
          <Dog spec={spec} />
          <span className="dog-bubble" aria-hidden>
            {spec.sex === 'male' ? 'Wouf !' : 'Wif !'}
          </span>
        </div>
      ))}
    </div>
  );
});
