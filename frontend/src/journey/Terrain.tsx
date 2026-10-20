import type { Terrain as TerrainKind } from './lands';

/**
 * Décors de fond, un par terre. Tous partagent le viewBox 0 0 1600 220 :
 * y=170 est la ligne d'horizon (le sol est dessiné par JourneyTrack).
 */
export function Terrain({ kind }: { kind: TerrainKind }) {
  switch (kind) {
    case 'castle':
      return <Castle x={1180} />;
    case 'meadow':
      return <Meadow />;
    case 'forest':
      return <Forest />;
    case 'mountains':
      return <Mountains />;
    case 'treasure':
      return <Treasure />;
    case 'ball':
      return (
        <>
          <Castle x={1150} festive />
          <Fireworks />
        </>
      );
  }
}

function Castle({ x, festive = false }: { x: number; festive?: boolean }) {
  return (
    <g transform={`translate(${x} 170) scale(0.62)`}>
      <rect x="-150" y="-90" width="300" height="90" fill="#d9ccff" />
      <rect x="-180" y="-130" width="60" height="130" fill="#cbbcff" />
      <rect x="120" y="-130" width="60" height="130" fill="#cbbcff" />
      <rect x="-30" y="-170" width="60" height="170" fill="#cbbcff" />
      <polygon points="-190,-130 -150,-190 -110,-130" fill="#ff8fc8" />
      <polygon points="110,-130 150,-190 190,-130" fill="#ff8fc8" />
      <polygon points="-40,-170 0,-240 40,-170" fill="#ff5bb0" />
      <line x1="0" y1="-240" x2="0" y2="-270" stroke="#c99a1a" strokeWidth="3" />
      <polygon points="0,-270 30,-260 0,-250" fill="#f5c542" />
      {[-130, -90, -50, -10, 30, 70, 110].map((wx) => (
        <rect key={wx} x={wx} y="-96" width="16" height="12" fill="#fff" />
      ))}
      <rect x="-20" y="-50" width="40" height="50" rx="20" fill="#5b3fd6" />
      {[-160, 140, -10].map((wx) => (
        <rect key={wx} x={wx} y="-110" width="16" height="26" rx="8" fill={festive ? '#fff6c4' : '#ffe58a'} className="window" />
      ))}
    </g>
  );
}

function Meadow() {
  return (
    <g>
      <ellipse cx="300" cy="190" rx="500" ry="60" fill="#ffc9e4" />
      <ellipse cx="1200" cy="200" rx="600" ry="70" fill="#ffd3ea" />
      {[80, 260, 480, 700, 940, 1120, 1360, 1540].map((x, i) => (
        <g key={x} transform={`translate(${x} ${150 + (i % 3) * 8})`} className="flower">
          <line x1="0" y1="0" x2="0" y2="22" stroke="#7bc47f" strokeWidth="3" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-8" rx="5" ry="9" fill={i % 2 ? '#ff5bb0' : '#c9b8ff'} transform={`rotate(${a})`} />
          ))}
          <circle r="4" fill="#ffe58a" />
        </g>
      ))}
      {[180, 600, 1020, 1460].map((x) => (
        <g key={x} className="butterfly" transform={`translate(${x} 90)`}>
          <ellipse cx="-6" cy="0" rx="7" ry="5" fill="#ff94cb" />
          <ellipse cx="6" cy="0" rx="7" ry="5" fill="#ff94cb" />
          <line x1="0" y1="-6" x2="0" y2="6" stroke="#5c0032" strokeWidth="1.5" />
        </g>
      ))}
    </g>
  );
}

function Forest() {
  const trees = [40, 150, 260, 390, 520, 640, 790, 920, 1060, 1180, 1320, 1450, 1560];
  return (
    <g>
      {trees.map((x, i) => {
        const h = 110 + (i % 4) * 25;
        const c = i % 2 ? '#8f6cff' : '#b39cff';
        return (
          <g key={x} transform={`translate(${x} 172)`}>
            <rect x="-6" y="-18" width="12" height="18" fill="#7a4e2d" />
            <polygon points={`-34,-18 0,${-h} 34,-18`} fill={c} />
            <polygon points={`-26,${-h * 0.45} 0,${-h * 0.95} 26,${-h * 0.45}`} fill={i % 2 ? '#a58bff' : '#c9b8ff'} />
            <circle cx={-10} cy={-h * 0.5} r="3" fill="#ffe58a" className="glow" />
            <circle cx={12} cy={-h * 0.3} r="3" fill="#ff94cb" className="glow" />
          </g>
        );
      })}
    </g>
  );
}

function Mountains() {
  return (
    <g>
      <polygon points="-50,172 250,-20 550,172" fill="#c9b8ff" />
      <polygon points="250,-20 200,30 300,30" fill="#fff" />
      <polygon points="350,172 650,20 950,172" fill="#b39cff" />
      <polygon points="650,20 605,62 695,62" fill="#fff" />
      <polygon points="800,172 1150,-40 1500,172" fill="#c9b8ff" />
      <polygon points="1150,-40 1095,15 1205,15" fill="#fff" />
      <polygon points="1300,172 1550,40 1800,172" fill="#b39cff" />
      <polygon points="1550,40 1510,80 1590,80" fill="#fff" />
      <ellipse cx="500" cy="60" rx="60" ry="18" fill="#fff" opacity="0.8" className="cloud" />
      <ellipse cx="1300" cy="80" rx="70" ry="20" fill="#fff" opacity="0.8" className="cloud" />
    </g>
  );
}

function Treasure() {
  const gems = [120, 340, 560, 760, 980, 1200, 1420];
  return (
    <g>
      <ellipse cx="800" cy="200" rx="900" ry="60" fill="#ffd3ea" />
      {gems.map((x, i) => (
        <g key={x} transform={`translate(${x} 172)`} className="gem">
          <polygon points="-22,-10 -10,-40 10,-40 22,-10 0,8" fill={['#ff5bb0', '#8f6cff', '#f5c542'][i % 3]} />
          <polygon points="-10,-40 0,-10 10,-40" fill="#fff" opacity="0.6" />
          <polygon points="-16,-30 0,-10 -22,-10" fill="#fff" opacity="0.25" />
        </g>
      ))}
      <g transform="translate(880 172)">
        <rect x="-40" y="-36" width="80" height="36" rx="6" fill="#c99a1a" />
        <path d="M-40 -36 Q0 -70 40 -36 Z" fill="#f5c542" />
        <rect x="-6" y="-40" width="12" height="14" fill="#ff2d95" />
        <circle cx="-20" cy="-50" r="4" fill="#ffe58a" className="glow" />
        <circle cx="22" cy="-56" r="3" fill="#ffe58a" className="glow" />
      </g>
    </g>
  );
}

function Fireworks() {
  return (
    <g>
      {[300, 600, 900].map((x, i) => (
        <g key={x} transform={`translate(${x} ${50 + i * 15})`} className={`firework firework-${i}`}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="0" y1="0" x2="0" y2="-28" stroke={i % 2 ? '#ff5bb0' : '#f5c542'} strokeWidth="3" strokeLinecap="round" transform={`rotate(${a})`} />
          ))}
        </g>
      ))}
      {[200, 500, 800, 1050].map((x, i) => (
        <path
          key={x}
          className={`heart heart-${i % 4}`}
          transform={`translate(${x} 150) scale(0.9)`}
          d="M12 21 C-6 9, 2 -4, 12 4 C22 -4, 30 9, 12 21 Z"
          fill="#ff5bb0"
        />
      ))}
    </g>
  );
}
