import { memo, type ReactNode } from 'react';
import { LANDS } from '../journey/lands';
import { Terrain } from '../journey/Terrain';
import { BALL_CASTLE_X, LAND_WIDTH } from './world';

const FAR_SCALE = 0.5;

/**
 * Décor lointain (parallaxe 0,5) : une silhouette par terre. `register` reçoit chaque SVG pour que la
 * boucle de jeu ne rende que les terres à l'écran (data-shown) et n'anime que l'active (data-active).
 */
export const FarScenery = memo(function FarScenery({ register, slotOffset }: { register: (slot: number) => (el: SVGSVGElement | null) => void; slotOffset: number }) {
  const w = LAND_WIDTH * FAR_SCALE;
  return (
    <>
      {LANDS.map((land, i) => (
        <svg
          key={land.id}
          ref={register(slotOffset + i)}
          viewBox="0 0 1600 220"
          preserveAspectRatio="xMidYMax meet"
          className="far-land"
          data-land={i}
          data-shown={i === 0 ? '1' : '0'}
          style={{ left: i * w, width: w }}
        >
          <g className={`far-${land.terrain}`}>
            <Terrain kind={land.terrain} />
          </g>
        </svg>
      ))}
    </>
  );
});

type Terrain = (typeof LANDS)[number]['terrain'];

interface AnimLayer {
  /** Classe d'animation (glow | sway | shine) */
  kind: string;
  delay?: string;
  node: ReactNode;
}

/**
 * Décor proche (parallaxe 1) d'une terre, en coordonnées de la terre : un SVG statique, plus un SVG
 * par groupe animé. Chaque groupe a sa propre couche composée (`will-change`) : une animation
 * d'opacité ou de transformation n'y repeint rien, alors qu'à l'intérieur d'un SVG elle repeindrait
 * tout le décor à chaque image.
 */
export const NearLand = memo(function NearLand({ terrain }: { terrain: Terrain }) {
  const { base, anim } = nearParts(terrain);
  const viewBox = `0 0 ${LAND_WIDTH} 420`;
  return (
    <>
      <svg viewBox={viewBox} className="near-land" style={{ width: LAND_WIDTH }}>
        {base}
      </svg>
      {anim.map((a, i) => (
        <svg key={i} viewBox={viewBox} className={`near-land near-anim ${a.kind}`} style={{ width: LAND_WIDTH, animationDelay: a.delay }}>
          {a.node}
        </svg>
      ))}
    </>
  );
});

function nearParts(terrain: Terrain): { base: ReactNode; anim: AnimLayer[] } {
  switch (terrain) {
    case 'castle':
      return {
        base: (
          <g>
            <Castle x={330} />
            {[900, 1500, 2100].map((x) => (
              <Bush key={x} x={x} />
            ))}
            <Banner x={700} text="Appuyez sur → pour partir" />
          </g>
        ),
        anim: [{ kind: 'glow', node: <CastleWindows x={330} /> }],
      };
    case 'meadow':
      return {
        base: (
          <g>
            {[400, 1300, 2000].map((x) => (
              <Bush key={x} x={x} />
            ))}
          </g>
        ),
        // Les fleurs se balancent par groupes (trois animations au lieu de dix-huit).
        anim: [0, 1, 2].map((g) => ({
          kind: 'sway',
          delay: `${-g}s`,
          node: (
            <g>
              {Array.from({ length: 6 }, (_, i) => (
                <Flower key={i} x={60 + (i * 3 + g) * 135} tint={(i + g) % 3} />
              ))}
            </g>
          ),
        })),
      };
    case 'forest':
      return {
        base: (
          <g>
            {Array.from({ length: 11 }, (_, i) => (
              <Tree key={i} x={100 + i * 225} h={180 + (i % 3) * 50} dark={i % 2 === 0} />
            ))}
            {Array.from({ length: 6 }, (_, i) => (
              <Mushroom key={i} x={250 + i * 380} />
            ))}
          </g>
        ),
        anim: [
          {
            kind: 'glow',
            node: (
              <g>
                {Array.from({ length: 11 }, (_, i) => {
                  const h = 180 + (i % 3) * 50;
                  return (
                    <g key={i} transform={`translate(${100 + i * 225} 420)`}>
                      <circle cx={-28} cy={-h * 0.5} r="5" fill="#ffe58a" />
                      <circle cx={30} cy={-h * 0.32} r="5" fill="#ff94cb" />
                    </g>
                  );
                })}
              </g>
            ),
          },
        ],
      };
    case 'mountains':
      return {
        base: (
          <g>
            {[200, 900, 1700, 2250].map((x, i) => (
              <Rock key={x} x={x} s={0.8 + (i % 2) * 0.4} />
            ))}
            {Array.from({ length: 7 }, (_, i) => (
              <Pine key={i} x={450 + i * 300} />
            ))}
          </g>
        ),
        anim: [],
      };
    case 'treasure':
      return {
        base: null,
        // Les cristaux scintillent par groupes de trois (opacité seulement).
        anim: [0, 1, 2].map((g) => ({
          kind: 'shine',
          delay: `${-g * 0.9}s`,
          node: (
            <g>
              {[0, 1, 2].map((i) => (
                <Crystal key={i} x={150 + (i * 3 + g) * 270} tint={(i + g) % 3} />
              ))}
            </g>
          ),
        })),
      };
    case 'ball':
      return {
        base: (
          <g>
            {[300, 800, 1100, 1400].map((x) => (
              <Lantern key={x} x={x} />
            ))}
            <Castle x={BALL_CASTLE_X} big />
            <Banner x={BALL_CASTLE_X - 330} text="Entrez au château →" />
          </g>
        ),
        anim: [
          {
            kind: 'glow',
            node: (
              <g>
                {[300, 800, 1100, 1400].map((x) => (
                  <rect key={x} x={x - 22} y="190" width="44" height="46" rx="8" fill="#fff6c4" stroke="#c99a1a" strokeWidth="3" />
                ))}
                <CastleWindows x={BALL_CASTLE_X} big />
              </g>
            ),
          },
        ],
      };
  }
}

/* ---- Éléments ---- */

function Castle({ x, big = false }: { x: number; big?: boolean }) {
  const s = big ? 1.35 : 1;
  return (
    <g transform={`translate(${x} 420) scale(${s})`}>
      <rect x="-150" y="-110" width="300" height="110" fill="#e4dbff" />
      <rect x="-190" y="-170" width="70" height="170" fill="#d6caff" />
      <rect x="120" y="-170" width="70" height="170" fill="#d6caff" />
      <rect x="-35" y="-220" width="70" height="220" fill="#d6caff" />
      <polygon points="-200,-170 -155,-240 -110,-170" fill="#ff8fc8" />
      <polygon points="110,-170 155,-240 200,-170" fill="#ff8fc8" />
      <polygon points="-45,-220 0,-300 45,-220" fill="#ff5bb0" />
      <line x1="0" y1="-300" x2="0" y2="-335" stroke="#c99a1a" strokeWidth="3" />
      <polygon points="0,-335 34,-324 0,-313" fill="#f5c542" />
      {[-130, -90, -50, -10, 30, 70, 110].map((wx) => (
        <rect key={wx} x={wx} y="-118" width="18" height="14" fill="#fff" />
      ))}
      <rect x="-28" y="-70" width="56" height="70" rx="28" fill="#5b3fd6" />
      <rect x="-20" y="-62" width="40" height="62" rx="20" fill="#8f6cff" />
    </g>
  );
}

/** Fenêtres éclairées du château, dessinées dans la couche animée (glow). */
function CastleWindows({ x, big = false }: { x: number; big?: boolean }) {
  const s = big ? 1.35 : 1;
  return (
    <g transform={`translate(${x} 420) scale(${s})`}>
      {[-165, 145, -10].map((wx) => (
        <rect key={wx} x={wx} y="-150" width="18" height="30" rx="9" fill="#fff6c4" />
      ))}
    </g>
  );
}

function Banner({ x, text }: { x: number; text: string }) {
  return (
    <g transform={`translate(${x} 420)`}>
      <rect x="-6" y="-150" width="12" height="150" fill="#9a7416" />
      <rect x="-120" y="-150" width="240" height="56" rx="12" fill="#fff" stroke="#ffc2e2" strokeWidth="3" />
      <text x="0" y="-116" textAnchor="middle" fontSize="20" fontWeight="700" fill="#8c004c" fontFamily="Quicksand, sans-serif">
        {text}
      </text>
    </g>
  );
}

function Bush({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 420)`}>
      <ellipse cx="0" cy="-20" rx="70" ry="30" fill="#ffb3d9" />
      <ellipse cx="-40" cy="-28" rx="40" ry="26" fill="#ffc2e2" />
      <ellipse cx="40" cy="-30" rx="44" ry="28" fill="#ffc2e2" />
      <circle cx="-20" cy="-36" r="5" fill="#ff2d95" />
      <circle cx="30" cy="-44" r="5" fill="#ff2d95" />
    </g>
  );
}

function Flower({ x, tint }: { x: number; tint: number }) {
  const colors = ['#ff5bb0', '#c9b8ff', '#ffe58a'];
  return (
    <g transform={`translate(${x} 420)`}>
      <path d="M0 0 C-4 -30 2 -50 0 -70" stroke="#7bc47f" strokeWidth="4" fill="none" />
      <ellipse cx="-10" cy="-30" rx="10" ry="5" fill="#9ad49e" transform="rotate(-25)" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-84" rx="8" ry="14" fill={colors[tint]} transform={`rotate(${a} 0 -70)`} />
      ))}
      <circle cx="0" cy="-70" r="7" fill="#fff6c4" />
    </g>
  );
}

function Tree({ x, h, dark }: { x: number; h: number; dark: boolean }) {
  return (
    <g transform={`translate(${x} 420)`}>
      <rect x="-14" y="-50" width="28" height="50" rx="6" fill="#7a4e2d" />
      <polygon points={`-80,-40 0,${-h} 80,-40`} fill={dark ? '#8f6cff' : '#a58bff'} />
      <polygon points={`-62,${-h * 0.42} 0,${-h * 0.92} 62,${-h * 0.42}`} fill={dark ? '#a58bff' : '#c9b8ff'} />
      <polygon points={`-42,${-h * 0.66} 0,${-h * 1.05} 42,${-h * 0.66}`} fill={dark ? '#b8a3ff' : '#d8ccff'} />
    </g>
  );
}

function Mushroom({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 420)`}>
      <rect x="-8" y="-26" width="16" height="26" rx="5" fill="#fff6e0" />
      <path d="M-28 -24 C-28 -52 28 -52 28 -24 Z" fill="#ff5bb0" />
      <circle cx="-10" cy="-38" r="4" fill="#fff" />
      <circle cx="10" cy="-34" r="3" fill="#fff" />
    </g>
  );
}

function Rock({ x, s }: { x: number; s: number }) {
  return (
    <g transform={`translate(${x} 420) scale(${s})`}>
      <path d="M-70 0 C-60 -40 -30 -60 0 -56 C30 -62 60 -36 70 0 Z" fill="#c9b8ff" />
      <path d="M-40 -10 C-30 -36 -10 -48 10 -44 L30 -10 Z" fill="#dcd2ff" opacity="0.8" />
    </g>
  );
}

function Pine({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 420)`}>
      <rect x="-8" y="-30" width="16" height="30" fill="#7a4e2d" />
      <polygon points="-40,-28 0,-110 40,-28" fill="#8f6cff" />
      <polygon points="-30,-60 0,-130 30,-60" fill="#a58bff" />
      <polygon points="-18,-96 0,-150 18,-96" fill="#fff" opacity="0.8" />
    </g>
  );
}

function Crystal({ x, tint }: { x: number; tint: number }) {
  const colors = ['#ff5bb0', '#8f6cff', '#f5c542'];
  return (
    <g transform={`translate(${x} 420)`}>
      <polygon points="-34,0 -18,-70 0,-96 18,-70 34,0" fill={colors[tint]} />
      <polygon points="-18,-70 0,-96 0,0 -34,0" fill="#fff" opacity="0.28" />
      <polygon points="0,-96 18,-70 34,0 0,0" fill="#000" opacity="0.08" />
    </g>
  );
}

function Lantern({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 420)`}>
      <rect x="-5" y="-190" width="10" height="190" fill="#9a7416" />
      <circle cx="0" cy="-207" r="28" fill="#ffe58a" opacity="0.25" />
    </g>
  );
}
