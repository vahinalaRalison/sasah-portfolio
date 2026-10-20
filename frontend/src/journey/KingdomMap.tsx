import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { LANDS, landIndex } from './lands';
import './kingdom-map.css';

/** Points d'étape sur la carte (coordonnées dans le viewBox 0 0 600 420). */
const WAYPOINTS: Record<string, { x: number; y: number }> = {
  top: { x: 70, y: 340 },
  about: { x: 190, y: 250 },
  skills: { x: 300, y: 320 },
  experience: { x: 400, y: 200 },
  projects: { x: 470, y: 300 },
  contact: { x: 540, y: 110 },
};

const PATH = 'M70 340 C110 300, 150 250, 190 250 S270 330, 300 320 S380 180, 400 200 S450 320, 470 300 S520 150, 540 110';

interface KingdomMapProps {
  progress: number;
  activeLand: string;
}

/**
 * Carte du royaume : le chemin relie les six terres, un repère suit la progression,
 * chaque terre est cliquable pour s'y rendre.
 */
export function KingdomMap({ progress, activeLand }: KingdomMapProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [marker, setMarker] = useState({ x: 70, y: 340 });

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const point = path.getPointAtLength(path.getTotalLength() * progress);
    setMarker({ x: point.x, y: point.y });
  }, [progress]);

  const reached = landIndex(activeLand);

  return (
    <svg viewBox="0 0 600 420" className="kingdom-map" role="img" aria-label="Carte du royaume : les six terres du voyage">
      <defs>
        <linearGradient id="map-paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff7fb" />
          <stop offset="1" stopColor="#ffe3f1" />
        </linearGradient>
        <radialGradient id="map-glow">
          <stop offset="0" stopColor="#ffe58a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffe58a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="6" y="6" width="588" height="408" rx="28" fill="url(#map-paper)" stroke="#ffc2e2" strokeWidth="3" />
      <text x="300" y="42" textAnchor="middle" className="map-title">
        Carte du Royaume
      </text>

      {/* Décor */}
      <g opacity="0.55">
        <ellipse cx="130" cy="150" rx="70" ry="30" fill="#c9b8ff" />
        <polygon points="330,120 360,60 390,120" fill="#c9b8ff" />
        <polygon points="370,130 405,70 440,130" fill="#b39cff" />
        <circle cx="500" cy="380" r="26" fill="#ffd3ea" />
        <circle cx="230" cy="380" r="18" fill="#ffd3ea" />
      </g>

      {/* Chemin */}
      <path d={PATH} fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
      <path ref={pathRef} d={PATH} fill="none" stroke="#ff5bb0" strokeWidth="4" strokeDasharray="10 10" strokeLinecap="round" className="map-path" />

      {/* Terres */}
      {LANDS.map((land, i) => {
        const p = WAYPOINTS[land.id] ?? { x: 0, y: 0 };
        const state = land.id === activeLand ? 'is-active' : i < reached ? 'is-reached' : 'is-ahead';
        return (
          <a key={land.id} href={`#${land.id}`} className={clsx('map-land', state)} aria-label={land.name}>
            <circle cx={p.x} cy={p.y} r="30" fill="url(#map-glow)" className="map-land-glow" />
            <circle cx={p.x} cy={p.y} r="18" className="map-land-dot" />
            <text x={p.x} y={p.y + 6} textAnchor="middle" fontSize="18">
              {land.emoji}
            </text>
            <text x={p.x} y={p.y + 38} textAnchor="middle" className="map-land-label">
              {land.name.replace(/^(Le |La |Les )/, '')}
            </text>
          </a>
        );
      })}

      {/* Repère du cheval */}
      <g transform={`translate(${marker.x} ${marker.y})`} className="map-marker">
        <circle r="12" fill="#fff" stroke="#ff2d95" strokeWidth="3" />
        <text y="5" textAnchor="middle" fontSize="13">
          🐴
        </text>
      </g>
    </svg>
  );
}
