import './fairy-scene.css';

/**
 * Scène SVG animée : château, nuages qui défilent, cheval blanc au galop
 * avec la princesse en amazone et le prince charmant derrière elle.
 * Toute l'animation est en CSS (fairy-scene.css) : aucun JS à l'exécution.
 */
export function FairyScene() {
  return (
    <svg
      viewBox="0 0 1200 700"
      role="img"
      aria-labelledby="fairy-title"
      className="fairy-scene mx-auto w-full max-w-2xl"
    >
      <title id="fairy-title">Une princesse et un prince charmant sur un cheval blanc au galop devant un château</title>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd6ec" />
          <stop offset="0.6" stopColor="#f3e6ff" />
          <stop offset="1" stopColor="#ffe9f4" />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb3d9" />
          <stop offset="1" stopColor="#ff8fc8" />
        </linearGradient>
        <linearGradient id="castle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9dcff" />
          <stop offset="1" stopColor="#c9b8ff" />
        </linearGradient>
        <linearGradient id="horse" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e8e4f3" />
        </linearGradient>
        <linearGradient id="gown" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8fc8" />
          <stop offset="1" stopColor="#ff2d95" />
        </linearGradient>
        <linearGradient id="coat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8f6cff" />
          <stop offset="1" stopColor="#5b3fd6" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6c4" />
          <stop offset="0.6" stopColor="#ffe58a" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffe58a" stopOpacity="0" />
        </radialGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* Ciel et soleil */}
      <rect width="1200" height="700" rx="40" fill="url(#sky)" />
      <circle cx="980" cy="140" r="130" fill="url(#sun)" className="sun" />

      {/* Nuages (parallaxe lente) */}
      <g className="clouds clouds-far" fill="#fff" opacity="0.85">
        <g transform="translate(100 120)">
          <ellipse cx="0" cy="0" rx="70" ry="28" />
          <ellipse cx="50" cy="-14" rx="48" ry="30" />
          <ellipse cx="-50" cy="-8" rx="42" ry="24" />
        </g>
        <g transform="translate(600 90)">
          <ellipse cx="0" cy="0" rx="60" ry="24" />
          <ellipse cx="40" cy="-14" rx="40" ry="26" />
          <ellipse cx="-40" cy="-6" rx="36" ry="20" />
        </g>
        <g transform="translate(1100 180)">
          <ellipse cx="0" cy="0" rx="70" ry="28" />
          <ellipse cx="50" cy="-14" rx="48" ry="30" />
        </g>
      </g>

      {/* Château */}
      <g className="castle" transform="translate(760 220)">
        <rect x="0" y="120" width="300" height="200" fill="url(#castle)" />
        <rect x="-30" y="60" width="70" height="260" fill="url(#castle)" />
        <rect x="260" y="60" width="70" height="260" fill="url(#castle)" />
        <rect x="120" y="20" width="60" height="300" fill="url(#castle)" />
        <polygon points="-40,60 5,-30 50,60" fill="#ff8fc8" />
        <polygon points="250,60 295,-30 340,60" fill="#ff8fc8" />
        <polygon points="110,20 150,-70 190,20" fill="#ff5bb0" />
        <line x1="150" y1="-70" x2="150" y2="-110" stroke="#c99a1a" strokeWidth="3" />
        <polygon points="150,-110 190,-98 150,-86" fill="#f5c542" className="flag" />
        {[20, 60, 100, 140, 180, 220, 260].map((x) => (
          <rect key={x} x={x} y="110" width="18" height="14" fill="#fff" />
        ))}
        <rect x="130" y="240" width="40" height="80" rx="20" fill="#5b3fd6" />
        {[60, 220].map((x) => (
          <rect key={x} x={x} y="160" width="20" height="36" rx="10" fill="#fff6c4" className="window" />
        ))}
        <rect x="140" y="80" width="20" height="36" rx="10" fill="#fff6c4" className="window" />
      </g>

      {/* Collines et sol */}
      <ellipse cx="300" cy="560" rx="420" ry="90" fill="#ffc2e2" />
      <ellipse cx="950" cy="580" rx="420" ry="90" fill="#ffc2e2" />
      <rect x="0" y="540" width="1200" height="160" rx="40" fill="url(#ground)" />

      {/* Chemin fleuri qui défile */}
      <g className="road" fill="#ff5bb0" opacity="0.8">
        {Array.from({ length: 16 }, (_, i) => (
          <g key={i} transform={`translate(${i * 150} 630)`}>
            <circle cx="0" cy="0" r="7" />
            <circle cx="0" cy="0" r="3" fill="#ffe58a" />
            <circle cx="70" cy="18" r="5" fill="#fff" />
          </g>
        ))}
      </g>

      {/* Cheval + cavaliers : tout le groupe « galope » (rebond) */}
      <g className="rider-group" transform="translate(220 300)">
        {/* Ombre */}
        <ellipse cx="300" cy="300" rx="230" ry="22" fill="#b80063" opacity="0.18" filter="url(#soft)" className="shadow" />

        {/* Pattes arrière */}
        <g transform="translate(190 210)">
          <g className="leg leg-back-1">
            <path d="M0 0 L-8 60 L4 70 L4 120 L18 120 L16 70 L24 60 L20 0 Z" fill="url(#horse)" stroke="#cfc8e6" strokeWidth="2" />
            <rect x="2" y="118" width="18" height="10" rx="3" fill="#8c7fb3" />
          
          </g>
        </g>
        <g transform="translate(420 215)">
          <g className="leg leg-front-1">
            <path d="M0 0 L-4 60 L6 70 L2 115 L16 115 L18 70 L26 60 L22 0 Z" fill="url(#horse)" stroke="#cfc8e6" strokeWidth="2" />
            <rect x="2" y="113" width="16" height="10" rx="3" fill="#8c7fb3" />
          
          </g>
        </g>

        {/* Queue */}
        <path className="tail" d="M150 160 C100 150, 60 190, 40 250 C70 220, 110 210, 150 200 Z" fill="#fff" stroke="#e8e4f3" strokeWidth="2" />

        {/* Corps */}
        <ellipse cx="300" cy="200" rx="150" ry="62" fill="url(#horse)" stroke="#cfc8e6" strokeWidth="2" />

        {/* Cou et tête */}
        <path d="M410 165 C440 120, 480 90, 510 70 L540 90 C520 120, 480 160, 450 215 Z" fill="url(#horse)" stroke="#cfc8e6" strokeWidth="2" />
        <g transform="translate(525 80)">
          <g className="head">
            <path d="M-20 -15 C10 -30, 50 -15, 70 10 L75 30 C60 40, 40 42, 20 35 C5 28, -10 18, -22 5 Z" fill="url(#horse)" stroke="#cfc8e6" strokeWidth="2" />
            <path d="M-5 -16 L-15 -45 L8 -22 Z" fill="#fff" stroke="#cfc8e6" strokeWidth="2" />
            <path d="M12 -20 L10 -48 L28 -24 Z" fill="#fff" stroke="#cfc8e6" strokeWidth="2" />
            <circle cx="15" cy="4" r="5" fill="#2b1b45" />
            <circle cx="17" cy="2" r="1.6" fill="#fff" />
            <circle cx="66" cy="26" r="3" fill="#d8b4ff" />
            <path d="M-5 18 C20 30, 45 32, 70 26" stroke="#c99a1a" strokeWidth="3" fill="none" />
          
          </g>
        </g>
        {/* Crinière */}
        <path className="mane" d="M420 150 C430 110, 470 85, 515 60 C500 95, 480 120, 470 160 C460 150, 440 150, 420 150 Z" fill="#ffe0f0" stroke="#ffc2e2" strokeWidth="2" />

        {/* Pattes avant (devant le corps) */}
        <g transform="translate(230 220)">
          <g className="leg leg-back-2">
            <path d="M0 0 L-6 60 L6 70 L2 118 L16 118 L18 70 L26 60 L22 0 Z" fill="#f3f0fa" stroke="#cfc8e6" strokeWidth="2" />
            <rect x="2" y="116" width="16" height="10" rx="3" fill="#8c7fb3" />
          
          </g>
        </g>
        <g transform="translate(395 225)">
          <g className="leg leg-front-2">
            <path d="M0 0 L-6 58 L6 68 L4 112 L18 112 L18 68 L26 58 L22 0 Z" fill="#f3f0fa" stroke="#cfc8e6" strokeWidth="2" />
            <rect x="4" y="110" width="16" height="10" rx="3" fill="#8c7fb3" />
          
          </g>
        </g>

        {/* Selle */}
        <path d="M230 150 C270 135, 340 135, 380 150 L372 175 C330 165, 280 165, 238 175 Z" fill="#c99a1a" />
        <path d="M232 152 C272 138, 338 138, 378 152" stroke="#ffe58a" strokeWidth="4" fill="none" />

        {/* Prince charmant (derrière) */}
        <g transform="translate(255 60)">
          <g className="prince">
            <path d="M-5 100 L-25 130 L-12 140 L4 118 Z" fill="#2b1b45" />
            <path d="M-30 20 C-40 60, -36 95, -5 102 L20 100 C40 70, 36 40, 20 18 Z" fill="url(#coat)" />
            <path d="M-20 24 L-6 70 L8 24" stroke="#f5c542" strokeWidth="4" fill="none" />
            <path d="M20 40 C45 55, 70 70, 95 72 L92 84 C62 82, 36 70, 14 56 Z" fill="url(#coat)" />
            <circle cx="97" cy="80" r="7" fill="#f8d3c1" />
            <circle cx="-4" cy="-6" r="24" fill="#f8d3c1" />
            <path d="M-30 -10 C-28 -36, -4 -44, 18 -32 C24 -20, 20 -12, 18 -8 C8 -22, -10 -24, -24 -6 Z" fill="#3b2a1a" />
            <path d="M-20 -30 L-16 -44 L-8 -34 L-2 -46 L4 -34 L12 -42 L14 -30 Z" fill="#f5c542" stroke="#c99a1a" strokeWidth="1.5" />
            <circle cx="-8" cy="-6" r="2.2" fill="#2b1b45" />
            <circle cx="6" cy="-6" r="2.2" fill="#2b1b45" />
            <path d="M-6 6 C-2 10, 4 10, 8 6" stroke="#b05a5a" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M-18 18 L-10 28 L-4 18 L4 28 L10 18" stroke="#fff" strokeWidth="3" fill="none" />
          
          </g>
        </g>

        {/* Princesse (devant, en amazone) */}
        <g transform="translate(330 70)">
          <g className="princess">
            <path className="gown" d="M-20 30 C-60 70, -90 130, -70 170 C-40 182, 20 182, 60 172 C70 130, 50 80, 25 32 Z" fill="url(#gown)" />
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
        <path d="M330 130 C400 120, 480 100, 540 100" stroke="#c99a1a" strokeWidth="3" fill="none" />
      </g>

      {/* Cœurs et étoiles flottants */}
      <g className="hearts" fill="#ff5bb0">
        {[
          [160, 240],
          [420, 160],
          [640, 230],
          [330, 300],
        ].map(([x, y], i) => (
          <path
            key={i}
            className={`heart heart-${i}`}
            transform={`translate(${x} ${y}) scale(0.7)`}
            d="M12 21 C-6 9, 2 -4, 12 4 C22 -4, 30 9, 12 21 Z"
          />
        ))}
      </g>
    </svg>
  );
}
