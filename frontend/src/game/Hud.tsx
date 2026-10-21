import { BookOpen, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { RefObject } from 'react';
import { LANDS, landById, landIndex } from '../journey/lands';
import type { GameView } from './useGame';

interface HudProps {
  view: GameView;
  muted: boolean;
  onRead: () => void;
  onReset: () => void;
  onToggleSound: () => void;
  /** Barre de progression mise à jour chaque frame par la boucle (variable CSS --p) */
  progressRef: RefObject<HTMLDivElement>;
}

/** Affichage tête haute : terre, progression du royaume, étoiles, découvertes, boutons. */
export function Hud({ view, muted, onRead, onReset, onToggleSound, progressRef }: HudProps) {
  const land = landById(view.landId);
  const index = landIndex(view.landId);

  return (
    <div className="hud">
      <div className="hud-left">
        <p className="hud-land">
          <span aria-hidden>{land.emoji}</span> <span className="hud-land-name">{land.name}</span>
          <span className="hud-land-short">
            Terre {index + 1}/{LANDS.length}
          </span>
        </p>
        <p className="hud-sub">
          Terre {index + 1} / {LANDS.length} · {land.subtitle}
        </p>
        <div ref={progressRef} className="hud-progress" aria-hidden>
          <div className="hud-progress-fill" />
          {LANDS.map((l, i) => (
            <span key={l.id} className={i <= index ? 'is-reached' : undefined} style={{ left: `${((i + 0.5) / LANDS.length) * 100}%` }}>
              {l.emoji}
            </span>
          ))}
          <span className="hud-progress-horse">🐎</span>
        </div>
      </div>
      <div className="hud-right">
        <p className="hud-stat" key={view.collected.size} title="Étoiles ramassées">
          ⭐ {view.collected.size} / {view.totalStars}
        </p>
        <p className="hud-stat hud-stat-poi" title="Points d'intérêt découverts">
          📍 {view.discovered.size} / {view.pois.length}
        </p>
        <button type="button" className="hud-btn" onClick={onToggleSound} title={muted ? 'Activer les sons' : 'Couper les sons'} aria-pressed={!muted}>
          {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
        </button>
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
