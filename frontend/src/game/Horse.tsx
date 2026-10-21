import { memo } from 'react';
import './horse.css';

/**
 * Cheval blanc (anatomie réaliste : encolure, garrot, membres articulés en deux segments,
 * crinière et queue en mèches), monté par la princesse en amazone.
 * Les groupes `transform=` positionnent, les groupes `className=` s'animent.
 * État piloté par `data-state` sur le conteneur : idle | move | jump, et `--cycle` (durée d'une foulée).
 */
export const Horse = memo(function Horse() {
  return (
    <svg viewBox="0 0 440 320" className="horse-svg" role="img" aria-label="La princesse sur son cheval blanc">
      <defs>
        <linearGradient id="h-coat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#f4f1fb" />
          <stop offset="1" stopColor="#d9d2ea" />
        </linearGradient>
        <linearGradient id="h-coat-leg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ded8ee" />
          <stop offset="0.5" stopColor="#f8f6fd" />
          <stop offset="1" stopColor="#cfc7e3" />
        </linearGradient>
        <linearGradient id="h-mane" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#c9b8ff" />
        </linearGradient>
        <linearGradient id="h-gown" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8fc8" />
          <stop offset="1" stopColor="#ff2d95" />
        </linearGradient>
        <radialGradient id="h-belly" cx="0.5" cy="0.9" r="0.6">
          <stop offset="0" stopColor="#b9afd6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#b9afd6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="h-shadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#5c0032" stopOpacity="0.28" />
          <stop offset="0.7" stopColor="#5c0032" stopOpacity="0.18" />
          <stop offset="1" stopColor="#5c0032" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ombre portée au sol */}
      <ellipse className="h-shadow" cx="220" cy="312" rx="160" ry="12" fill="url(#h-shadow)" />

      {/* Membres arrière-plan (côté opposé) */}
      <g transform="translate(142 200)">
        <g className="leg leg-hr">
          <path d="M-20 -24 C-27 8 -19 38 -10 55 L10 55 C16 36 18 10 14 -24 Z" fill="url(#h-coat-leg)" stroke="#c6bddf" strokeWidth="1.2" />
          <g transform="translate(0 55)">
            <g className="lower">
              <path d="M-8 -4 C-10 14 -8 32 -7 46 L7 46 C8 32 9 14 8 -4 Z" fill="url(#h-coat-leg)" stroke="#c6bddf" strokeWidth="1.2" />
              <path d="M-10 44 L-11 56 L11 56 L10 44 Z" fill="#4a3f6b" />
            </g>
          </g>
        </g>
      </g>
      {/* Partie qui se cabre : membres antérieurs, queue et corps ; les postérieurs restent plantés. */}
      <g className="horse-rear">
      <g transform="translate(296 200)">
        <g className="leg leg-fr">
          <path d="M-14 -16 C-18 10 -14 36 -9 55 L9 55 C13 36 15 10 12 -16 Z" fill="url(#h-coat-leg)" stroke="#c6bddf" strokeWidth="1.2" />
          <g transform="translate(0 55)">
            <g className="lower">
              <path d="M-8 -4 C-10 14 -8 32 -7 46 L7 46 C8 32 9 14 8 -4 Z" fill="url(#h-coat-leg)" stroke="#c6bddf" strokeWidth="1.2" />
              <path d="M-10 44 L-11 56 L11 56 L10 44 Z" fill="#4a3f6b" />
            </g>
          </g>
        </g>
      </g>

      {/* Queue */}
      <g className="tail">
        <path d="M120 148 C80 150 48 190 36 250 C56 212 82 190 118 186 Z" fill="url(#h-mane)" />
        <path d="M122 160 C86 170 60 210 60 262 C76 224 96 204 124 194 Z" fill="url(#h-mane)" opacity="0.9" />
        <path d="M118 142 C92 134 62 150 44 186 C66 166 90 158 120 164 Z" fill="#fff" opacity="0.8" />
      </g>

      <g className="horse-body">
        {/* Corps */}
        <path
          d="M118 150 C112 118 150 98 210 96 C270 95 310 104 326 124 C340 146 334 194 306 214 C262 234 170 236 130 216 C110 204 112 176 118 150 Z"
          fill="url(#h-coat)"
          stroke="#c6bddf"
          strokeWidth="1.5"
        />
        <ellipse cx="220" cy="200" rx="90" ry="40" fill="url(#h-belly)" />

        {/* Encolure */}
        <path d="M292 122 C304 84 328 54 356 40 L386 64 C372 96 348 136 334 172 C320 170 304 164 296 156 Z" fill="url(#h-coat)" stroke="#c6bddf" strokeWidth="1.5" />

        {/* Tête */}
        <g transform="translate(356 40)">
          <g className="head">
            <path
              d="M-4 0 C4 -14 24 -18 40 -8 C50 0 58 16 68 44 C72 56 66 66 54 66 C40 66 26 58 18 52 C10 46 4 36 2 26 C-2 16 -6 8 -4 0 Z"
              fill="url(#h-coat)"
              stroke="#c6bddf"
              strokeWidth="1.5"
            />
            <path d="M6 -4 L-2 -30 L18 -12 Z" fill="#f4f1fb" stroke="#c6bddf" strokeWidth="1.2" />
            <path d="M22 -10 L26 -34 L38 -12 Z" fill="#f4f1fb" stroke="#c6bddf" strokeWidth="1.2" />
            <path d="M8 -2 L2 -22 L16 -10 Z" fill="#f3c7df" opacity="0.7" />
            <ellipse cx="27" cy="12" rx="5" ry="4.5" fill="#2b1b45" />
            <circle cx="29" cy="10.5" r="1.5" fill="#fff" />
            <path d="M20 8 C24 4 30 4 34 7" stroke="#9f93bd" strokeWidth="1.2" fill="none" />
            <ellipse cx="62" cy="50" rx="3" ry="2.2" fill="#c9a0c0" />
            <path d="M46 60 L60 58" stroke="#b9afd6" strokeWidth="1.5" strokeLinecap="round" />
            {/* Bride */}
            <path d="M30 24 C40 34 50 44 58 54" stroke="#c99a1a" strokeWidth="2.2" fill="none" />
            <path d="M44 40 C50 56 48 62 42 64" stroke="#c99a1a" strokeWidth="2" fill="none" />
            <path d="M0 10 C10 18 18 28 20 40" stroke="#c99a1a" strokeWidth="2" fill="none" />
          </g>
        </g>

        {/* Crinière */}
        <g className="mane">
          <path d="M298 124 C320 90 338 66 362 44 C354 72 342 96 328 134 Z" fill="url(#h-mane)" />
          <path d="M312 112 C332 80 348 60 370 48 C358 78 348 100 338 128 Z" fill="url(#h-mane)" opacity="0.85" />
          <path d="M290 132 C306 104 322 84 344 62 C340 86 326 110 314 140 Z" fill="#fff" opacity="0.75" />
          <path d="M356 40 C370 30 384 34 390 46 C380 42 370 44 362 52 Z" fill="url(#h-mane)" />
        </g>

        {/* Selle et sangle */}
        <path d="M220 122 L214 214" stroke="#9a7416" strokeWidth="5" strokeLinecap="round" />
        <path d="M198 100 C230 90 270 92 296 106 L290 128 C262 118 232 118 204 126 Z" fill="#c99a1a" />
        <path d="M202 104 C232 94 268 96 292 108" stroke="#ffe58a" strokeWidth="3" fill="none" />

        {/* Princesse (devant, en amazone) */}
        <g transform="translate(252 30)">
          <g className="princess">
            <path className="gown" d="M-20 30 C-60 70, -90 130, -70 170 C-40 182, 20 182, 60 172 C70 130, 50 80, 25 32 Z" fill="url(#h-gown)" />
            <path d="M-30 100 C-10 112, 20 112, 45 100" stroke="#fff" strokeWidth="3" fill="none" opacity="0.7" />
            <path d="M-42 150 C-10 160, 30 160, 58 150" stroke="#fff" strokeWidth="3" fill="none" opacity="0.7" />
            <path d="M-14 30 C-20 50, -18 70, 0 72 L20 72 C34 60, 32 42, 22 30 Z" fill="#ff5bb0" />
            <path d="M-14 32 C-4 40, 14 40, 22 32" stroke="#fff" strokeWidth="3" fill="none" />
            <path d="M-14 40 C-40 50, -60 60, -70 80 L-60 88 C-45 70, -25 62, -6 58 Z" fill="#f8d3c1" />
            <path d="M22 40 C45 48, 60 60, 70 72 L62 82 C50 68, 36 60, 18 56 Z" fill="#f8d3c1" />
            <circle cx="5" cy="4" r="24" fill="#f8d3c1" />
            <path className="hair" d="M-24 0 C-30 -30, 0 -50, 28 -34 C40 -20, 36 -6, 30 4 C28 30, 40 60, 48 90 C30 72, 20 54, 16 40 C4 30, -10 34, -22 20 C-30 36, -36 60, -36 90 C-44 56, -40 20, -24 0 Z" fill="#ffe58a" />
            <path d="M-18 -26 L-12 -46 L-2 -32 L5 -50 L12 -32 L22 -46 L26 -26 Z" fill="#f5c542" stroke="#c99a1a" strokeWidth="1.5" />
            <circle cx="-13" cy="-45" r="3" fill="#ff5bb0" />
            <circle cx="5" cy="-49" r="3" fill="#8f6cff" />
            <circle cx="22" cy="-45" r="3" fill="#ff5bb0" />
            <circle cx="-3" cy="2" r="2.4" fill="#2b1b45" />
            <circle cx="13" cy="2" r="2.4" fill="#2b1b45" />
            <path d="M-8 -2 C-5 -5, -1 -5, 1 -2" stroke="#2b1b45" strokeWidth="1.2" fill="none" />
            <path d="M9 -2 C12 -5, 16 -5, 18 -2" stroke="#2b1b45" strokeWidth="1.2" fill="none" />
            <path d="M0 14 C4 18, 10 18, 14 14" stroke="#e5007d" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="-10" cy="10" r="4" fill="#ff94cb" opacity="0.6" />
            <circle cx="20" cy="10" r="4" fill="#ff94cb" opacity="0.6" />
          </g>
        </g>

        {/* Rênes */}
        <path d="M250 96 C290 86 330 74 374 64" stroke="#c99a1a" strokeWidth="2.5" fill="none" />
      </g>

      <g transform="translate(302 204)">
        <g className="leg leg-fl">
          <path d="M-14 -16 C-18 10 -14 36 -9 55 L9 55 C13 36 15 10 12 -16 Z" fill="url(#h-coat)" stroke="#c6bddf" strokeWidth="1.2" />
          <g transform="translate(0 55)">
            <g className="lower">
              <path d="M-8 -4 C-10 14 -8 32 -7 46 L7 46 C8 32 9 14 8 -4 Z" fill="url(#h-coat)" stroke="#c6bddf" strokeWidth="1.2" />
              <path d="M-10 44 L-11 56 L11 56 L10 44 Z" fill="#4a3f6b" />
            </g>
          </g>
        </g>
      </g>
      </g>

      {/* Membres premier plan (postérieur gauche, au-dessus de tout) */}
      <g transform="translate(136 204)">
        <g className="leg leg-hl">
          <path d="M-20 -24 C-27 8 -19 38 -10 55 L10 55 C16 36 18 10 14 -24 Z" fill="url(#h-coat)" stroke="#c6bddf" strokeWidth="1.2" />
          <g transform="translate(0 55)">
            <g className="lower">
              <path d="M-8 -4 C-10 14 -8 32 -7 46 L7 46 C8 32 9 14 8 -4 Z" fill="url(#h-coat)" stroke="#c6bddf" strokeWidth="1.2" />
              <path d="M-10 44 L-11 56 L11 56 L10 44 Z" fill="#4a3f6b" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
});
