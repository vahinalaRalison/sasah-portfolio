import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { Profile, Project } from '../api/types';
import { INITIAL_BODY, collectStars, followCamera, nearestPoi, step, type Body, type Input } from './physics';
import { NO_COMBO, comboExpired, nextCombo, type Combo } from './score';
import { sfx } from './sound';
import { CASTLE_DOOR_X, LAND_WIDTH, START_X, WORLD_WIDTH, buildPois, buildStars, landAt, type Poi, type Star } from './world';

const STORAGE_KEY = 'sasah-game-v1';
const POI_RADIUS = 150;
/** Les chiens rattrapent le cheval avec un léger retard (fraction comblée par frame à 60 i/s). */
const PACK_LERP = 0.14;
/** Durée de la pose (cheval cabré, chiens qui aboient), en ms. */
const POSE_DURATION = 1400;
/** Sans commande pendant ce délai, la meute s'occupe et le cheval broute. */
const IDLE_LONG_AFTER = 6000;
/** Marge (px monde) au-delà de l'écran avant de cesser de rendre une terre. */
const LAND_MARGIN = 400;

/** Éléments DOM déplacés chaque frame hors React (performance). */
export interface GameRefs {
  world: RefObject<HTMLDivElement>;
  far: RefObject<HTMLDivElement>;
  horse: RefObject<HTMLDivElement>;
  pack: RefObject<HTMLDivElement>;
  stage: RefObject<HTMLDivElement>;
  /** Barre de progression du royaume (variable CSS --p) */
  progress: RefObject<HTMLDivElement>;
  /** Conteneurs des terres (proches et lointaines), portant data-land ; rendus seulement à l'écran */
  lands: RefObject<(HTMLElement | SVGElement)[]>;
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
  /** Dernière étoile ramassée (pour l'animation « +1 » à sa position) */
  lastStar: Star | null;
  /** Combo d'étoiles en cours */
  combo: Combo;
  started: boolean;
  /** Vrai quand le cheval franchit la porte du château du bal : fin du voyage. */
  entering: boolean;
}

export type ControlKey = 'left' | 'right' | 'jump' | 'pose';

export interface GameControls {
  press(key: ControlKey): void;
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

/** Échelle d'affichage du monde (variable CSS `--scale`, réduite sur petit écran). */
function readScale(stage: HTMLElement): number {
  const v = parseFloat(getComputedStyle(stage).getPropertyValue('--scale'));
  return Number.isFinite(v) && v > 0 ? v : 1;
}

/** Position de départ sûre : jamais sur la porte du château, sinon on y rentrerait aussitôt. */
function safeStart(x: number | undefined): number {
  return x === undefined || x >= CASTLE_DOOR_X - 200 ? START_X : x;
}

/**
 * Boucle de jeu : clavier/tactile → physique → DOM. React n'est notifié
 * que des événements discrets (changement de terre, étoile, point d'intérêt, entrée au château).
 */
export function useGame(profile: Profile, projects: Project[], refs: GameRefs): { view: GameView; controls: GameControls } {
  const pois = useMemo(() => buildPois(profile, projects), [profile, projects]);
  const stars = useMemo(() => buildStars(), []);

  const [view, setView] = useState<GameView>(() => {
    const saved = loadPersisted();
    return {
      landId: landAt(safeStart(saved?.x)).id,
      activePoi: null,
      discovered: new Set(saved?.discovered ?? []),
      collected: new Set(saved?.collected ?? []),
      stars,
      pois,
      totalStars: stars.length,
      lastStar: null,
      combo: NO_COMBO,
      started: false,
      entering: false,
    };
  });

  // Tout l'état « chaud » vit dans des refs : aucune re-rendu par frame.
  const body = useRef<Body>(INITIAL_BODY(safeStart(loadPersisted()?.x)));
  const camera = useRef(0);
  const keys = useRef({ left: false, right: false });
  const jumpQueued = useRef(false);
  const poseQueued = useRef(false);
  const collected = useRef<Set<string>>(new Set(view.collected));
  const discovered = useRef<Set<string>>(new Set(view.discovered));
  const entering = useRef(false);
  /** Vrai après un retour au départ : caméra et meute se replacent sans glisser. */
  const snap = useRef(false);
  const poisRef = useRef(pois);
  poisRef.current = pois;

  const controls = useMemo<GameControls>(
    () => ({
      press: (key) => {
        sfx.unlock();
        if (key === 'jump') jumpQueued.current = true;
        else if (key === 'pose') poseQueued.current = true;
        else keys.current[key] = true;
      },
      release: (key) => {
        keys.current[key] = false;
      },
      reset: () => {
        body.current = INITIAL_BODY(START_X);
        collected.current = new Set();
        discovered.current = new Set();
        entering.current = false;
        snap.current = true;
        savePersisted({ x: START_X, discovered: [], collected: [] });
        setView((v) => ({
          ...v,
          landId: 'top',
          activePoi: null,
          discovered: new Set(),
          collected: new Set(),
          lastStar: null,
          combo: NO_COMBO,
          entering: false,
        }));
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
        case 'ArrowDown':
        case 'KeyS':
          if (!e.repeat) poseQueued.current = true;
          break;
        default:
          return;
      }
      sfx.unlock();
      e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.right = false;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'KeyQ') keys.current.left = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Largeur et échelle lues sur redimensionnement seulement : les lire chaque image forcerait
    // un recalcul de style synchrone (toutes les animations CSS rendent le style « sale »).
    let scale = readScale(stage);
    let stageWidth = stage.clientWidth;
    const onResize = () => {
      scale = readScale(stage);
      stageWidth = stage.clientWidth;
    };
    window.addEventListener('resize', onResize);

    let last = performance.now();
    let frame = 0;
    let lastLand = landAt(body.current.x).id;
    let lastPoi: string | null = null;
    let saveTimer = 0;
    let started = false;
    let packX = body.current.x;
    let lastState = '';
    let lastIdle = '';
    let lastCycle = '';
    let lastFacing = 0;
    let lastProgress = '';
    let lastProgressAt = 0;
    let lastShown = '';
    let poseUntil = 0;
    let lastInputAt = performance.now();
    let combo: Combo = NO_COMBO;

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const dt = (now - last) / 1000;
      last = now;

      const stopped = entering.current;
      const input: Input = stopped ? { left: false, right: false, jump: false } : { left: keys.current.left, right: keys.current.right, jump: jumpQueued.current };
      const pose = !stopped && poseQueued.current;
      jumpQueued.current = false;
      poseQueued.current = false;
      const anyInput = input.left || input.right || input.jump || pose;
      if (anyInput) lastInputAt = now;

      const prev = body.current;
      const next = step(prev, input, dt, { minX: 80, maxX: CASTLE_DOOR_X + 10 });
      body.current = next;

      // Pose : cheval cabré et chiens qui aboient, tant qu'on ne repart pas.
      if (pose && next.onGround) {
        poseUntil = now + POSE_DURATION;
        sfx.neigh();
        sfx.woof();
      }
      if (input.left || input.right || !next.onGround) poseUntil = 0;
      const posing = now < poseUntil;

      if (input.jump && prev.onGround && !next.onGround) sfx.jump();
      if (!prev.onGround && next.onGround) sfx.land();

      const viewportWidth = stageWidth / scale;
      if (snap.current) {
        snap.current = false;
        packX = next.x;
        camera.current = followCamera(camera.current, next, viewportWidth, WORLD_WIDTH, 1);
      }
      camera.current = followCamera(camera.current, next, viewportWidth, WORLD_WIDTH);
      // Les chiens suivent le cheval avec un retard indépendant de la cadence.
      packX += (next.x - packX) * (1 - Math.pow(1 - PACK_LERP, Math.max(0, dt) * 60));

      // DOM direct : monde, parallaxe lointaine, cheval, meute, progression.
      const cam = Math.round(camera.current);
      if (refs.world.current) refs.world.current.style.transform = `translate3d(${-cam * scale}px,0,0) scale(${scale})`;
      if (refs.far.current) refs.far.current.style.transform = `translate3d(${-cam * 0.5 * scale}px,0,0) scale(${scale})`;
      // Barre de progression : au plus quatre fois par seconde (chaque écriture restyle la barre, ~2 ms).
      if (refs.progress.current && now - lastProgressAt > 250) {
        const progress = (next.x / WORLD_WIDTH).toFixed(3);
        if (progress !== lastProgress) {
          lastProgress = progress;
          lastProgressAt = now;
          refs.progress.current.style.setProperty('--p', progress);
        }
      }
      // Terres rendues : celles qui touchent l'écran (± une marge) ; la terre du cheval anime son décor.
      const shown = `${Math.floor((cam - LAND_MARGIN) / LAND_WIDTH)}:${Math.floor((cam + viewportWidth + LAND_MARGIN) / LAND_WIDTH)}:${Math.floor(next.x / LAND_WIDTH)}`;
      if (shown !== lastShown) {
        lastShown = shown;
        const [first, last, active] = shown.split(':').map(Number);
        for (const el of refs.lands.current ?? []) {
          const i = Number(el.dataset.land);
          el.dataset.shown = i >= first! && i <= last! ? '1' : '0';
          el.dataset.active = i === active ? '1' : '0';
        }
      }
      const speed = Math.abs(next.vx);
      const state = stopped ? 'enter' : !next.onGround ? 'jump' : speed > 40 ? 'move' : posing ? 'rear' : 'idle';
      const idle = !stopped && !posing && state === 'idle' && now - lastInputAt > IDLE_LONG_AFTER ? 'long' : '';
      // Durée de foulée en trois paliers : chaque changement de `--cycle` restyle le cheval entier (~9 ms).
      const cycle = speed < 200 ? '0.9s' : speed < 450 ? '0.65s' : '0.42s';
      const horse = refs.horse.current;
      if (horse) {
        horse.style.transform = `translate3d(${Math.round((next.x - cam) * scale)}px,${Math.round(next.y * scale)}px,0) scaleX(${next.facing})`;
        if (state !== lastState) horse.dataset.state = state;
        if (idle !== lastIdle) horse.dataset.idle = idle;
        if (cycle !== lastCycle) horse.style.setProperty('--cycle', cycle);
      }
      const pack = refs.pack.current;
      if (pack) {
        pack.style.transform = `translate3d(${Math.round((packX - cam) * scale)}px,0,0) scaleX(${next.facing})`;
        if (state !== lastState) pack.dataset.state = state === 'rear' ? 'bark' : state;
        if (idle !== lastIdle) pack.dataset.idle = idle;
        if (next.facing !== lastFacing) pack.dataset.facing = String(next.facing);
        if (cycle !== lastCycle) pack.style.setProperty('--cycle', cycle);
      }
      lastState = state;
      lastIdle = idle;
      lastCycle = cycle;
      lastFacing = next.facing;

      if (stopped) return;

      // Événements discrets → React.
      if (!started && anyInput) {
        started = true;
        setView((v) => ({ ...v, started: true }));
      }

      // Arrivée devant la porte du château du bal : on entre, le voyage est terminé.
      if (next.onGround && next.x >= CASTLE_DOOR_X - 24) {
        entering.current = true;
        keys.current.left = keys.current.right = false;
        savePersisted({ x: START_X, discovered: [...discovered.current], collected: [...collected.current] });
        sfx.fanfare();
        setView((v) => ({ ...v, activePoi: null, entering: true }));
        return;
      }

      const land = landAt(next.x).id;
      const newly = collectStars(next, stars, collected.current);
      for (const s of newly) collected.current.add(s.id);
      if (newly.length > 0) {
        combo = nextCombo(combo, now, newly.length);
        sfx.star(combo.count);
      } else if (combo.count > 0 && comboExpired(combo, now)) {
        combo = NO_COMBO;
        setView((v) => ({ ...v, combo: NO_COMBO }));
      }
      const poi = nearestPoi(next.x, poisRef.current, POI_RADIUS);
      const poiId = poi?.id ?? null;
      if (poi && !discovered.current.has(poi.id)) {
        discovered.current.add(poi.id);
        sfx.discover();
      }

      if (land !== lastLand || newly.length > 0 || poiId !== lastPoi) {
        lastLand = land;
        lastPoi = poiId;
        const currentCombo = combo;
        setView((v) => ({
          ...v,
          landId: land,
          activePoi: poi,
          collected: new Set(collected.current),
          discovered: new Set(discovered.current),
          lastStar: newly[newly.length - 1] ?? v.lastStar,
          combo: currentCombo,
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
      window.removeEventListener('resize', onResize);
      savePersisted({ x: entering.current ? START_X : body.current.x, discovered: [...discovered.current], collected: [...collected.current] });
    };
  }, [refs.stage, refs.world, refs.far, refs.horse, refs.pack, refs.progress, refs.lands, stars]);

  return { view, controls };
}
