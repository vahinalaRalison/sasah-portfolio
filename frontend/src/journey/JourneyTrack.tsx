import clsx from 'clsx';
import { LANDS, landById, landIndex } from './lands';
import { Rider } from './Rider';
import { Terrain } from './Terrain';
import type { JourneyState } from './useJourney';
import './journey-track.css';

/**
 * Bandeau fixe en bas de l'écran : le décor de la terre active, le chemin qui défile
 * pendant le déplacement et le cheval qui avance avec la progression de la page.
 */
export function JourneyTrack({ progress, activeLand, moving }: JourneyState) {
  const land = landById(activeLand);
  const index = landIndex(activeLand);
  // Le cheval part du bord gauche et atteint le bord droit au château du bal.
  const left = 4 + progress * 72;

  return (
    <div className={clsx('journey-track', `terrain-${land.terrain}`, moving && 'is-moving')} aria-hidden>
      <svg viewBox="0 0 1600 220" preserveAspectRatio="xMidYMax slice" className="journey-scene">
        {LANDS.map((l) => (
          <g key={l.id} className={clsx('terrain-layer', l.id === activeLand && 'is-active')}>
            <Terrain kind={l.terrain} />
          </g>
        ))}
        <rect x="0" y="170" width="1600" height="50" fill="url(#journey-ground)" />
        <defs>
          <linearGradient id="journey-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffb3d9" />
            <stop offset="1" stopColor="#ff8fc8" />
          </linearGradient>
        </defs>
        <g className="journey-road">
          {Array.from({ length: 14 }, (_, i) => (
            <g key={i} transform={`translate(${i * 130} 196)`}>
              <circle r="6" fill="#ff5bb0" opacity="0.7" />
              <circle r="2.5" fill="#ffe58a" />
              <circle cx="65" cy="12" r="4" fill="#fff" opacity="0.8" />
            </g>
          ))}
        </g>
      </svg>


      {/* Cheval et cavaliers */}
      <div className="journey-rider" style={{ left: `${left}%` }}>
        <div className="journey-sign">
          <span className="journey-sign-land">{land.emoji} {land.name}</span>
          <span className="journey-sign-step">
            Terre {index + 1} / {LANDS.length} · {land.discover}
          </span>
        </div>
        <Rider moving={moving} className="journey-rider-svg" />
      </div>
    </div>
  );
}
