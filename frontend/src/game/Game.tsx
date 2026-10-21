import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Profile, Project } from '../api/types';
import { useCvUrl } from '../hooks/useCvUrl';
import { Pack } from '../journey/Dogs';
import { LANDS, landById } from '../journey/lands';
import { Finale } from './Finale';
import { Horse } from './Horse';
import { Hud } from './Hud';
import { PoiCard } from './PoiCard';
import { FarScenery, NearScenery } from './Scenery';
import { sfx } from './sound';
import { TouchControls } from './TouchControls';
import { useGame } from './useGame';
import { LAND_WIDTH, WORLD_WIDTH, type Poi } from './world';
import './game.css';

interface GameProps {
  profile: Profile;
  projects: Project[];
  onRead: () => void;
}

/** Durée de l'entrée au château (ms), alignée sur l'animation CSS `enter-castle`. */
const ENTER_DURATION = 1700;

/** La scène de jeu : monde défilant, décors, étoiles, points d'intérêt, cheval et sa meute, HUD. */
export function Game({ profile, projects, onRead }: GameProps) {
  const stage = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const far = useRef<HTMLDivElement>(null);
  const horse = useRef<HTMLDivElement>(null);
  const pack = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const refs = useMemo(() => ({ stage, world, far, horse, pack, progress }), []);

  const { view, controls } = useGame(profile, projects, refs);
  const land = landById(view.landId);
  const cvUrl = useCvUrl(profile);
  const isTouch = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches, []);

  const [muted, setMuted] = useState(sfx.muted);
  const toggleSound = useCallback(() => {
    const next = !sfx.muted;
    sfx.setMuted(next);
    setMuted(next);
    if (!next) sfx.unlock();
  }, []);

  // Bannière à l'entrée d'une terre.
  const [banner, setBanner] = useState<string | null>(null);
  useEffect(() => {
    if (!view.started) return;
    setBanner(view.landId);
    const t = window.setTimeout(() => setBanner(null), 2600);
    return () => window.clearTimeout(t);
  }, [view.landId, view.started]);

  useEffect(() => {
    stage.current?.focus();
  }, []);

  // Porte du château franchie : le cheval entre, puis le bilan du voyage s'affiche.
  const [finale, setFinale] = useState(false);
  useEffect(() => {
    if (!view.entering) {
      setFinale(false);
      return;
    }
    const t = window.setTimeout(() => setFinale(true), ENTER_DURATION);
    return () => window.clearTimeout(t);
  }, [view.entering]);

  return (
    <div ref={stage} className={clsx('stage', `sky-${land.terrain}`)} tabIndex={0} aria-label="Jeu : le voyage de la princesse">
      <div className="sun" aria-hidden />
      <div ref={far} className="layer layer-far" aria-hidden>
        <FarScenery />
      </div>

      <div ref={world} className="layer layer-world" style={{ width: WORLD_WIDTH }}>
        <div className="ground" aria-hidden>
          {LANDS.map((l, i) => (
            <div key={l.id} className={`ground-land ground-${l.terrain}`} style={{ left: i * LAND_WIDTH, width: LAND_WIDTH }} />
          ))}
          <div className="road" />
        </div>
        <NearScenery />

        {view.pois.map((poi) => (
          <PoiMarker key={poi.id} poi={poi} discovered={view.discovered.has(poi.id)} active={view.activePoi?.id === poi.id} />
        ))}

        {view.stars.map((s) => (
          <div key={s.id} className={clsx('star', s.high && 'star-high', view.collected.has(s.id) && 'is-collected')} style={{ left: s.x, bottom: `calc(var(--ground) + ${-s.y}px)` }}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.2 L18.5 21.7 L12 17.7 L5.5 21.7 L7.3 14.2 L1.5 9.2 L9.1 8.6 Z" />
            </svg>
          </div>
        ))}

        {/* Étincelles et « +1 » à l'endroit même de l'étoile ramassée */}
        {view.lastStar && (
          <div key={view.lastStar.id} className="star-burst" style={{ left: view.lastStar.x, bottom: `calc(var(--ground) + ${-view.lastStar.y}px)` }} aria-hidden>
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className="spark" style={{ '--a': `${i * 45}deg` } as CSSProperties} />
            ))}
            <span className={clsx('star-pop', view.combo.count > 1 && 'is-combo')}>{view.combo.count > 1 ? `Combo ×${view.combo.count} ✨` : '+1 ⭐'}</span>
          </div>
        )}
      </div>

      <div ref={pack} className="pack" data-state="idle">
        <Pack />
      </div>
      <div ref={horse} className="horse" data-state="idle">
        <Horse />
        <div className="hearts" aria-hidden>
          {['💗', '💖', '💕', '✨', '💗'].map((h, i) => (
            <span key={i} style={{ '--i': i } as CSSProperties}>
              {h}
            </span>
          ))}
        </div>
      </div>

      <Hud view={view} muted={muted} onRead={onRead} onReset={controls.reset} onToggleSound={toggleSound} progressRef={progress} />

      {banner && !view.activePoi && !view.entering && (
        <div className="land-banner" key={banner} role="status">
          <span className="land-banner-emoji" aria-hidden>
            {landById(banner).emoji}
          </span>
          <span className="title-script text-4xl">{landById(banner).name}</span>
          <span className="land-banner-sub">{landById(banner).subtitle}</span>
        </div>
      )}

      {!view.started && !view.activePoi && (
        <div className="intro-overlay">
          <p className="title-script text-6xl text-barbie-500 sm:text-7xl">{profile.nickname}</p>
          <p className="font-display text-xl font-bold text-barbie-900 sm:text-2xl">{profile.fullName}</p>
          <p className="text-barbie-700">{profile.title}</p>
          <p className="mt-4 rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-barbie-800 shadow-glow">
            {isTouch ? 'Touchez ▶ pour partir à l’aventure' : 'Appuyez sur → pour partir à l’aventure'}
          </p>
        </div>
      )}

      {view.activePoi && !view.entering && <PoiCard poi={view.activePoi} profile={profile} isTouch={isTouch} />}

      {view.entering && !finale && (
        <div className="enter-overlay" role="status">
          <span className="enter-overlay-emoji" aria-hidden>
            🏰
          </span>
          <span className="title-script text-5xl text-barbie-500">Bienvenue au château</span>
          <span className="enter-overlay-sub">La princesse et sa meute entrent au bal…</span>
        </div>
      )}

      {finale && <Finale view={view} cvUrl={cvUrl} onRead={onRead} onReplay={controls.reset} />}

      {isTouch && !view.entering && <TouchControls controls={controls} />}
    </div>
  );
}

function PoiMarker({ poi, discovered, active }: { poi: Poi; discovered: boolean; active: boolean }) {
  return (
    <div className={clsx('poi', `poi-${poi.kind}`, discovered && 'is-discovered', active && 'is-active')} style={{ left: poi.x }} aria-hidden>
      <div className="poi-sign">
        <span className="poi-emoji">{poi.emoji}</span>
        <span className="poi-label">{poi.label}</span>
      </div>
      <div className="poi-pole" />
      <div className="poi-hint">{discovered ? '✓' : '?'}</div>
    </div>
  );
}
