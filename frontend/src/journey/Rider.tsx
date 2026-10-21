import clsx from 'clsx';
import './rider.css';

interface RiderProps {
  /** Galop (vrai) ou pose au repos (faux) */
  moving: boolean;
  className?: string;
}

/**
 * Le cheval blanc et la princesse en amazone, suivis de ses quatre cotons de Tuléar.
 * Les groupes `transform=` positionnent, les groupes `className=` s'animent :
 * une animation CSS `transform` écraserait l'attribut si les deux étaient sur le même élément.
 */
export function Rider({ moving, className }: RiderProps) {
  return (
    <svg viewBox="250 300 580 370" role="img" aria-label="La princesse sur son cheval blanc" className={clsx('rider', moving ? 'is-moving' : 'is-idle', className)}>
      <defs>
        <linearGradient id="rider-horse" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e8e4f3" />
        </linearGradient>
        <linearGradient id="rider-gown" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8fc8" />
          <stop offset="1" stopColor="#ff2d95" />
        </linearGradient>
        <filter id="rider-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      <g className="rider-group" transform="translate(220 300)">
        <ellipse cx="300" cy="300" rx="230" ry="22" fill="#b80063" opacity="0.18" filter="url(#rider-soft)" className="shadow" />

        {/* Pattes arrière-plan */}
        <g transform="translate(190 210)">
          <g className="leg leg-back-1">
            <path d="M0 0 L-8 60 L4 70 L4 120 L18 120 L16 70 L24 60 L20 0 Z" fill="url(#rider-horse)" stroke="#cfc8e6" strokeWidth="2" />
            <rect x="2" y="118" width="18" height="10" rx="3" fill="#8c7fb3" />
          </g>
        </g>
        <g transform="translate(420 215)">
          <g className="leg leg-front-1">
            <path d="M0 0 L-4 60 L6 70 L2 115 L16 115 L18 70 L26 60 L22 0 Z" fill="url(#rider-horse)" stroke="#cfc8e6" strokeWidth="2" />
            <rect x="2" y="113" width="16" height="10" rx="3" fill="#8c7fb3" />
          </g>
        </g>

        <path className="tail" d="M150 160 C100 150, 60 190, 40 250 C70 220, 110 210, 150 200 Z" fill="#fff" stroke="#e8e4f3" strokeWidth="2" />

        {/* Corps, cou, tête */}
        <ellipse cx="300" cy="200" rx="150" ry="62" fill="url(#rider-horse)" stroke="#cfc8e6" strokeWidth="2" />
        <path d="M410 165 C440 120, 480 90, 510 70 L540 90 C520 120, 480 160, 450 215 Z" fill="url(#rider-horse)" stroke="#cfc8e6" strokeWidth="2" />
        <g transform="translate(525 80)">
          <g className="head">
            <path d="M-20 -15 C10 -30, 50 -15, 70 10 L75 30 C60 40, 40 42, 20 35 C5 28, -10 18, -22 5 Z" fill="url(#rider-horse)" stroke="#cfc8e6" strokeWidth="2" />
            <path d="M-5 -16 L-15 -45 L8 -22 Z" fill="#fff" stroke="#cfc8e6" strokeWidth="2" />
            <path d="M12 -20 L10 -48 L28 -24 Z" fill="#fff" stroke="#cfc8e6" strokeWidth="2" />
            <circle cx="15" cy="4" r="5" fill="#2b1b45" />
            <circle cx="17" cy="2" r="1.6" fill="#fff" />
            <circle cx="66" cy="26" r="3" fill="#d8b4ff" />
            <path d="M-5 18 C20 30, 45 32, 70 26" stroke="#c99a1a" strokeWidth="3" fill="none" />
          </g>
        </g>
        <path className="mane" d="M420 150 C430 110, 470 85, 515 60 C500 95, 480 120, 470 160 C460 150, 440 150, 420 150 Z" fill="#ffe0f0" stroke="#ffc2e2" strokeWidth="2" />

        {/* Pattes premier plan */}
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

        {/* Princesse */}
        <g transform="translate(330 70)">
          <g className="princess">
            <path className="gown" d="M-20 30 C-60 70, -90 130, -70 170 C-40 182, 20 182, 60 172 C70 130, 50 80, 25 32 Z" fill="url(#rider-gown)" />
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

        <path d="M330 130 C400 120, 480 100, 540 100" stroke="#c99a1a" strokeWidth="3" fill="none" />
      </g>
    </svg>
  );
}
