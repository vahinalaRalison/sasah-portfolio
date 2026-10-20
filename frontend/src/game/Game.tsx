import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Profile, Project } from '../api/types';
import { LANDS, landById } from '../journey/lands';
import { Horse } from './Horse';
import { Hud } from './Hud';
import { PoiCard } from './PoiCard';
import { FarScenery, NearScenery } from './Scenery';
import { TouchControls } from './TouchControls';
import { useGame } from './useGame';
import { LAND_WIDTH, WORLD_WIDTH, type Poi } from './world';
import './game.css';

interface GameProps {
  profile: Profile;
  projects: Project[];
  onRead: () => void;
}

/** La scène de jeu : monde défilant, décors, étoiles, points d'intérêt, cheval, HUD. */
export function Game({ profile, projects, onRead }: GameProps) {
  const stage = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const far = useRef<HTMLDivElement>(null);
  const horse = useRef<HTMLDivElement>(null);
  const refs = useMemo(() => ({ stage, world, far, horse }), []);

  const { view, controls } = useGame(profile, projects, refs);
  const land = landById(view.landId);
  const isTouch = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches, []);

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
      </div>

      <div ref={horse} className="horse" data-state="idle">
        <Horse />
      </div>

      <Hud view={view} onRead={onRead} onReset={controls.reset} />

      {banner && !view.activePoi && (
        <div className="land-banner" key={banner} role="status">
          <span className="land-banner-emoji" aria-hidden>
            {landById(banner).emoji}
          </span>
          <span className="title-script text-4xl">{landById(banner).name}</span>
          <span className="land-banner-sub">{landById(banner).subtitle}</span>
        </div>
      )}

      {!view.started && (
        <div className="intro-overlay">
          <p className="title-script text-6xl text-barbie-500 sm:text-7xl">{profile.nickname}</p>
          <p className="font-display text-xl font-bold text-barbie-900 sm:text-2xl">{profile.fullName}</p>
          <p className="text-barbie-700">{profile.title}</p>
          <p className="mt-4 rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-barbie-800 shadow-glow">
            {isTouch ? 'Touchez ▶ pour partir à l’aventure' : 'Appuyez sur → pour partir à l’aventure'}
          </p>
        </div>
      )}

      {view.activePoi && <PoiCard poi={view.activePoi} profile={profile} isTouch={isTouch} />}

      {view.lastStar && (
        <div key={view.lastStar.id} className="star-pop" aria-hidden>
          +1 ⭐
        </div>
      )}

      {isTouch && <TouchControls controls={controls} />}
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
