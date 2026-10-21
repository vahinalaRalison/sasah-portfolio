import { BookOpen, RotateCcw } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import { rankFor } from './score';
import type { GameView } from './useGame';

/** Délai (s) avant la bascule automatique en mode lecture. */
const AUTO_READ_AFTER = 8;

interface FinaleProps {
  view: GameView;
  onRead: () => void;
  onReplay: () => void;
}

/** Bilan du voyage à l'entrée du château : titre honorifique, étoiles, panneaux, puis la page de lecture. */
export function Finale({ view, onRead, onReplay }: FinaleProps) {
  const rank = rankFor(view.collected.size, view.totalStars);
  const [left, setLeft] = useState(AUTO_READ_AFTER);

  useEffect(() => {
    if (left <= 0) {
      onRead();
      return;
    }
    const t = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left, onRead]);

  return (
    <div className="finale" role="dialog" aria-label="Bilan du voyage">
      <div className="finale-confetti" aria-hidden>
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} style={{ '--i': i } as CSSProperties} />
        ))}
      </div>
      <div className="finale-card">
        <span className="finale-emoji" aria-hidden>
          {rank.emoji}
        </span>
        <p className="finale-kicker">Vous êtes</p>
        <h2 className="title-script text-5xl text-barbie-500">{rank.title}</h2>
        <p className="finale-praise">{rank.praise}</p>
        <ul className="finale-stats">
          <li>
            <span className="finale-stat-value">
              ⭐ {view.collected.size} / {view.totalStars}
            </span>
            <span className="finale-stat-label">étoiles</span>
          </li>
          <li>
            <span className="finale-stat-value">
              📍 {view.discovered.size} / {view.pois.length}
            </span>
            <span className="finale-stat-label">panneaux</span>
          </li>
        </ul>
        <div className="finale-actions">
          <button type="button" className="btn-royal" onClick={onRead} autoFocus>
            <BookOpen className="h-4 w-4" aria-hidden /> Lire la suite
          </button>
          <button type="button" className="btn-ghost" onClick={onReplay}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Rejouer
          </button>
        </div>
        <p className="finale-countdown">La page de lecture s'ouvre dans {left} s…</p>
      </div>
    </div>
  );
}
