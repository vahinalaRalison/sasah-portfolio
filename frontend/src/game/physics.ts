import { HORSE_HITBOX, type Poi, type Star } from './world';

/** Entrées d'une frame. `jump` n'est vrai que sur la frame de l'appui (pas en maintien). */
export interface Input {
  readonly left: boolean;
  readonly right: boolean;
  readonly jump: boolean;
}

export interface Body {
  readonly x: number;
  /** 0 au sol, négatif en l'air */
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly onGround: boolean;
  readonly facing: 1 | -1;
}

export const PHYSICS = {
  accel: 2600,
  maxSpeed: 560,
  friction: 2400,
  gravity: 2900,
  jumpVelocity: 1160,
  maxDt: 1 / 30,
} as const;

export const INITIAL_BODY = (x: number): Body => ({ x, y: 0, vx: 0, vy: 0, onGround: true, facing: 1 });

/** Une étape de simulation, pure : même entrée → même sortie. */
export function step(body: Body, input: Input, dtRaw: number, bounds: { minX: number; maxX: number }): Body {
  const dt = Math.min(PHYSICS.maxDt, Math.max(0, dtRaw));
  let { x, y, vx, vy, onGround, facing } = body;

  // Horizontal : accélération, sinon frottement jusqu'à l'arrêt.
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (dir !== 0) {
    vx += dir * PHYSICS.accel * dt;
    facing = dir as 1 | -1;
  } else if (vx !== 0) {
    const decel = PHYSICS.friction * dt;
    vx = Math.abs(vx) <= decel ? 0 : vx - Math.sign(vx) * decel;
  }
  vx = Math.max(-PHYSICS.maxSpeed, Math.min(PHYSICS.maxSpeed, vx));

  // Vertical : saut depuis le sol, gravité en l'air, atterrissage.
  if (input.jump && onGround) {
    vy = -PHYSICS.jumpVelocity;
    onGround = false;
  }
  if (!onGround) {
    vy += PHYSICS.gravity * dt;
    y += vy * dt;
    if (y >= 0) {
      y = 0;
      vy = 0;
      onGround = true;
    }
  }

  x += vx * dt;
  if (x < bounds.minX) {
    x = bounds.minX;
    vx = 0;
  } else if (x > bounds.maxX) {
    x = bounds.maxX;
    vx = 0;
  }

  return { x, y, vx, vy, onGround, facing };
}

/** Étoiles touchées par la boîte du cheval (sabots en `body.y`, hauteur vers le haut). */
export function collectStars(body: Body, stars: readonly Star[], collected: ReadonlySet<string>): Star[] {
  const top = body.y - HORSE_HITBOX.height;
  const bottom = body.y;
  return stars.filter(
    (s) => !collected.has(s.id) && Math.abs(s.x - body.x) <= HORSE_HITBOX.halfWidth + 18 && s.y >= top - 18 && s.y <= bottom + 18,
  );
}

/** Point d'intérêt le plus proche dans le rayon, sinon null. */
export function nearestPoi(x: number, pois: readonly Poi[], radius: number): Poi | null {
  let best: Poi | null = null;
  let bestDist = radius;
  for (const p of pois) {
    const d = Math.abs(p.x - x);
    if (d <= bestDist) {
      best = p;
      bestDist = d;
    }
  }
  return best;
}

/** Position de caméra qui suit le cheval en douceur et reste dans le monde. */
export function followCamera(camera: number, body: Body, viewportWidth: number, worldWidth: number, lerp = 0.12): number {
  const lead = viewportWidth * (body.facing === 1 ? 0.38 : 0.62);
  const target = body.x - lead;
  const next = camera + (target - camera) * lerp;
  return Math.max(0, Math.min(worldWidth - viewportWidth, next));
}
