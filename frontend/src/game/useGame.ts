import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { Profile, Project } from '../api/types';
import { INITIAL_BODY, collectStars, followCamera, nearestPoi, step, type Body, type Input } from './physics';
import { START_X, WORLD_WIDTH, buildPois, buildStars, landAt, type Poi, type Star } from './world';

const STORAGE_KEY = 'sasah-game-v1';
const POI_RADIUS = 150;

/** Éléments DOM déplacés chaque frame hors React (performance). */
export interface GameRefs {
  world: RefObject<HTMLDivElement>;
  far: RefObject<HTMLDivElement>;
  horse: RefObject<HTMLDivElement>;
  stage: RefObject<HTMLDivElement>;
}

/** État affiché par React : ne change que sur événement (terre, étoile, point d'intérêt). */
export interface GameView {
  landId: string;
  activePoi: Poi | null;
  discovered: ReadonlySet<string>;
  collected: ReadonlySet<string>;
  stars: Star[];
  pois: Poi[];
  totalStars: number;
  /** Dernière étoile ramassée (pour l'animation « +1 ») */
  lastStar: Star | null;
  started: boolean;
}

export interface GameControls {
  press(key: 'left' | 'right' | 'jump'): void;
  release(key: 'left' | 'right'): void;
  reset(): void;
}

interface Persisted {
  x: number;
  discovered: string[];
  collected: string[];
}

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Persisted) : null;
  } catch {
    return null;
  }
}

function savePersisted(p: Persisted): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* stockage indisponible : on joue sans sauvegarde */
  }
}

/**
 * Boucle de jeu : clavier/tactile → physique → DOM. React n'est notifié
 * que des événements discrets (changement de terre, étoile, point d'intérêt).
 */
export function useGame(profile: Profile, projects: Project[], refs: GameRefs): { view: GameView; controls: GameControls } {
  const pois = useMemo(() => buildPois(profile, projects), [profile, projects]);
  const stars = useMemo(() => buildStars(), []);

  const [view, setView] = useState<GameView>(() => {
    const saved = loadPersisted();
    return {
      landId: landAt(saved?.x ?? START_X).id,
      activePoi: null,
      discovered: new Set(saved?.discovered ?? []),
      collected: new Set(saved?.collected ?? []),
      stars,
      pois,
      totalStars: stars.length,
      lastStar: null,
      started: false,
    };
  });

  // Tout l'état « chaud » vit dans des refs : aucune re-rendu par frame.
  const body = useRef<Body>(INITIAL_BODY(loadPersisted()?.x ?? START_X));
  const camera = useRef(0);
  const keys = useRef({ left: false, right: false });
  const jumpQueued = useRef(false);
  const collected = useRef<Set<string>>(new Set(view.collected));
  const discovered = useRef<Set<string>>(new Set(view.discovered));
  const poisRef = useRef(pois);
  poisRef.current = pois;

  const controls = useMemo<GameControls>(
    () => ({
      press: (key) => {
        if (key === 'jump') jumpQueued.current = true;
        else keys.current[key] = true;
      },
      release: (key) => {
        keys.current[key] = false;
      },
      reset: () => {
        body.current = INITIAL_BODY(START_X);
        collected.current = new Set();
        discovered.current = new Set();
        savePersisted({ x: START_X, discovered: [], collected: [] });
        setView((v) => ({ ...v, landId: 'top', activePoi: null, discovered: new Set(), collected: new Set(), lastStar: null }));
      },
    }),
    [],
  );

  useEffect(() => {
    const stage = refs.stage.current;
    if (!stage) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      switch (e.code) {
        case 'ArrowRight':
        case 'KeyD':
          keys.current.right = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
        case 'KeyQ':
          keys.current.left = true;
          break;
        case 'ArrowUp':
        case 'Space':
        case 'KeyW':
        case 'KeyZ':
          if (!e.repeat) jumpQueued.current = true;
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.right = false;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'KeyQ') keys.current.left = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    let last = performance.now();
    let frame = 0;
    let lastLand = landAt(body.current.x).id;
    let lastPoi: string | null = null;
    let saveTimer = 0;
    let started = false;

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const dt = (now - last) / 1000;
      last = now;

      const input: Input = { left: keys.current.left, right: keys.current.right, jump: jumpQueued.current };
      jumpQueued.current = false;
      const prev = body.current;
      const next = step(prev, input, dt, { minX: 80, maxX: WORLD_WIDTH - 80 });
      body.current = next;

      const viewportWidth = stage.clientWidth;
      camera.current = followCamera(camera.current, next, viewportWidth, WORLD_WIDTH);

      // DOM direct : monde, parallaxe lointaine, cheval.
      const cam = Math.round(camera.current);
      if (refs.world.current) refs.world.current.style.transform = `translate3d(${-cam}px,0,0)`;
      if (refs.far.current) refs.far.current.style.transform = `translate3d(${-cam * 0.5}px,0,0)`;
      const horse = refs.horse.current;
      if (horse) {
        horse.style.transform = `translate3d(${Math.round(next.x - cam)}px,${Math.round(next.y)}px,0) scaleX(${next.facing})`;
        const speed = Math.abs(next.vx);
        horse.dataset.state = !next.onGround ? 'jump' : speed > 40 ? 'move' : 'idle';
        horse.style.setProperty('--cycle', `${Math.max(0.42, 1.1 - (speed / 560) * 0.68)}s`);
      }

      // Événements discrets → React.
      if (!started && (input.left || input.right || input.jump)) {
        started = true;
        setView((v) => ({ ...v, started: true }));
      }

      const land = landAt(next.x).id;
      const newly = collectStars(next, stars, collected.current);
      for (const s of newly) collected.current.add(s.id);
      const poi = nearestPoi(next.x, poisRef.current, POI_RADIUS);
      const poiId = poi?.id ?? null;
      if (poi && !discovered.current.has(poi.id)) discovered.current.add(poi.id);

      if (land !== lastLand || newly.length > 0 || poiId !== lastPoi) {
        lastLand = land;
        lastPoi = poiId;
        setView((v) => ({
          ...v,
          landId: land,
          activePoi: poi,
          collected: new Set(collected.current),
          discovered: new Set(discovered.current),
          lastStar: newly[newly.length - 1] ?? v.lastStar,
        }));
      }

      if (now - saveTimer > 1500 && (input.left || input.right)) {
        saveTimer = now;
        savePersisted({ x: next.x, discovered: [...discovered.current], collected: [...collected.current] });
      }
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      savePersisted({ x: body.current.x, discovered: [...discovered.current], collected: [...collected.current] });
    };
  }, [refs.stage, refs.world, refs.far, refs.horse, stars]);

  return { view, controls };
}
