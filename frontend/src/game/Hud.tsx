import { BookOpen, RotateCcw } from 'lucide-react';
import { LANDS, landById, landIndex } from '../journey/lands';
import type { GameView } from './useGame';

interface HudProps {
  view: GameView;
  onRead: () => void;
  onReset: () => void;
}

/** Affichage tête haute : terre, étoiles, découvertes, boutons. */
export function Hud({ view, onRead, onReset }: HudProps) {
  const land = landById(view.landId);
  const index = landIndex(view.landId);

  return (
    <div className="hud">
      <div className="hud-left">
        <p className="hud-land">
          <span aria-hidden>{land.emoji}</span> {land.name}
        </p>
        <p className="hud-sub">
          Terre {index + 1} / {LANDS.length} · {land.subtitle}
        </p>
      </div>
      <div className="hud-right">
        <p className="hud-stat" key={view.collected.size} title="Étoiles ramassées">
          ⭐ {view.collected.size} / {view.totalStars}
        </p>
        <p className="hud-stat" title="Points d'intérêt découverts">
          📍 {view.discovered.size} / {view.pois.length}
        </p>
        <button type="button" className="hud-btn" onClick={onRead} title="Lire le portfolio sous forme de page">
          <BookOpen className="h-4 w-4" aria-hidden /> <span>Mode lecture</span>
        </button>
        <button type="button" className="hud-btn" onClick={onReset} title="Revenir au château de départ">
          <RotateCcw className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
