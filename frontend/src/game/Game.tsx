import clsx from 'clsx';
import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Profile, Project } from '../api/types';
import { useCvUrl } from '../hooks/useCvUrl';
import { Pack } from '../journey/Dogs';
import { LANDS, landById } from '../journey/lands';
import { Finale } from './Finale';
import { Horse } from './Horse';
import { Hud } from './Hud';
import { PoiCard } from './PoiCard';
import { FarScenery, NearLand } from './Scenery';
import { sfx } from './sound';
import { TouchControls } from './TouchControls';
import { useGame } from './useGame';
import { LAND_WIDTH, WORLD_WIDTH, type Poi, type Star } from './world';
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
  // Conteneurs des terres (proches puis lointaines) : la boucle ne rend que ceux à l'écran.
  const lands = useRef<(HTMLElement | SVGElement)[]>([]);
  const refs = useMemo(() => ({ stage, world, far, horse, pack, progress, lands }), []);
  const registerLand = useCallback(
    (slot: number) => (el: HTMLElement | SVGElement | null) => {
      if (el) lands.current[slot] = el;
    },
    [],
  );

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

  // Étoiles et panneaux regroupés par terre (coordonnées relatives à la terre).
  const byLand = useMemo(() => {
    const groups = LANDS.map(() => ({ stars: [] as Star[], pois: [] as Poi[] }));
    for (const s of view.stars) groups[Math.min(LANDS.length - 1, Math.floor(s.x / LAND_WIDTH))]!.stars.push(s);
    for (const p of view.pois) groups[Math.min(LANDS.length - 1, Math.floor(p.x / LAND_WIDTH))]!.pois.push(p);
    return groups;
  }, [view.stars, view.pois]);

  return (
    <div ref={stage} className={clsx('stage', `sky-${land.terrain}`)} tabIndex={0} aria-label="Jeu : le voyage de la princesse">
      <div className="sun" aria-hidden />
      <div ref={far} className="layer layer-far" aria-hidden>
        <FarScenery register={registerLand} slotOffset={LANDS.length} />
      </div>

      <div ref={world} className="layer layer-world" style={{ width: WORLD_WIDTH }}>
        <svg className="star-defs" aria-hidden>
          <defs>
            <radialGradient id="star-halo">
              <stop offset="0" stopColor="#ffe58a" stopOpacity="0.9" />
              <stop offset="1" stopColor="#f5c542" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="star-halo-pink">
              <stop offset="0" stopColor="#ffb3d9" stopOpacity="0.9" />
              <stop offset="1" stopColor="#ff5bb0" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
        <div className="ground" aria-hidden>
          {LANDS.map((l, i) => (
            <div key={l.id} className={`ground-land ground-${l.terrain}`} style={{ left: i * LAND_WIDTH, width: LAND_WIDTH }} />
          ))}
          <div className="road" />
        </div>

        {LANDS.map((l, i) => (
          <div key={l.id} ref={registerLand(i)} className="land" data-land={i} data-shown={i === 0 ? '1' : '0'} style={{ left: i * LAND_WIDTH }}>
            <NearLand terrain={l.terrain} />
            {byLand[i]!.pois.map((poi) => (
              <PoiMarker key={poi.id} poi={poi} x={poi.x - i * LAND_WIDTH} discovered={view.discovered.has(poi.id)} active={view.activePoi?.id === poi.id} />
            ))}
            <div className="stars" style={{ animationDelay: `${-i * 0.33}s` }}>
              {byLand[i]!.stars.map((s) => (
                <div key={s.id} className={clsx('star', s.high && 'star-high', view.collected.has(s.id) && 'is-collected')} style={{ left: s.x - i * LAND_WIDTH, bottom: `calc(var(--ground) + ${-s.y}px)` }}>
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <circle className="halo" cx="12" cy="12" r="15" />
                    <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.2 L18.5 21.7 L12 17.7 L5.5 21.7 L7.3 14.2 L1.5 9.2 L9.1 8.6 Z" />
                  </svg>
                </div>
              ))}
            </div>
            {/* Étincelles et « +1 » à l'endroit même de l'étoile ramassée */}
            {view.lastStar && Math.floor(view.lastStar.x / LAND_WIDTH) === i && (
              <div key={view.lastStar.id} className="star-burst" style={{ left: view.lastStar.x - i * LAND_WIDTH, bottom: `calc(var(--ground) + ${-view.lastStar.y}px)` }} aria-hidden>
                {Array.from({ length: 8 }, (_, k) => (
                  <span key={k} className="spark" style={{ '--a': `${k * 45}deg` } as CSSProperties} />
                ))}
                <span className={clsx('star-pop', view.combo.count > 1 && 'is-combo')}>{view.combo.count > 1 ? `Combo ×${view.combo.count} ✨` : '+1 ⭐'}</span>
              </div>
            )}
          </div>
        ))}
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

/** Panneau d'une terre ; mémorisé : seul l'état découvert/actif le fait re-rendre. */
const PoiMarker = memo(function PoiMarker({ poi, x, discovered, active }: { poi: Poi; x: number; discovered: boolean; active: boolean }) {
  return (
    <div className={clsx('poi', `poi-${poi.kind}`, discovered && 'is-discovered', active && 'is-active')} style={{ left: x }} aria-hidden>
      <div className="poi-sign">
        <span className="poi-emoji">{poi.emoji}</span>
        <span className="poi-label">{poi.label}</span>
      </div>
      <div className="poi-pole" />
      <div className="poi-hint">{discovered ? '✓' : '?'}</div>
    </div>
  );
});
