import { ArrowLeft, ArrowRight, ArrowUp, Heart } from 'lucide-react';
import type { PointerEvent } from 'react';
import type { GameControls } from './useGame';

/** Boutons tactiles (écrans sans clavier). */
export function TouchControls({ controls }: { controls: GameControls }) {
  const hold = (key: 'left' | 'right') => ({
    onPointerDown: (e: PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      controls.press(key);
    },
    onPointerUp: () => controls.release(key),
    onPointerCancel: () => controls.release(key),
    onPointerLeave: () => controls.release(key),
  });

  return (
    <div className="touch-controls" aria-label="Commandes tactiles">
      <div className="touch-group">
        <button type="button" className="touch-btn" aria-label="Reculer" {...hold('left')}>
          <ArrowLeft />
        </button>
        <button type="button" className="touch-btn" aria-label="Avancer" {...hold('right')}>
          <ArrowRight />
        </button>
      </div>
      <div className="touch-group">
        <button
          type="button"
          className="touch-btn touch-pose"
          aria-label="Faire la pose : le cheval se cabre, les chiens aboient"
          onPointerDown={(e) => {
            e.preventDefault();
            controls.press('pose');
          }}
        >
          <Heart />
        </button>
        <button
          type="button"
          className="touch-btn touch-jump"
          aria-label="Sauter"
          onPointerDown={(e) => {
            e.preventDefault();
            controls.press('jump');
          }}
        >
          <ArrowUp />
        </button>
      </div>
    </div>
  );
}
