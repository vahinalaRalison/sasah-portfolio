import { describe, expect, it } from 'vitest';
import { INITIAL_BODY, PHYSICS, collectStars, followCamera, nearestPoi, step } from './physics';
import type { Poi, Star } from './world';

const bounds = { minX: 0, maxX: 10_000 };
const idle = { left: false, right: false, jump: false };

function run(body = INITIAL_BODY(100), input = idle, frames = 1, dt = 1 / 60) {
  let b = body;
  for (let i = 0; i < frames; i++) b = step(b, input, dt, bounds);
  return b;
}

describe('step', () => {
  it('avance vers la droite et regarde à droite', () => {
    const b = run(INITIAL_BODY(100), { ...idle, right: true }, 30);
    expect(b.x).toBeGreaterThan(100);
    expect(b.facing).toBe(1);
    expect(b.vx).toBeLessThanOrEqual(PHYSICS.maxSpeed);
  });

  it('recule vers la gauche et regarde à gauche', () => {
    const b = run(INITIAL_BODY(500), { ...idle, left: true }, 30);
    expect(b.x).toBeLessThan(500);
    expect(b.facing).toBe(-1);
  });

  it("s'arrête par frottement quand on relâche", () => {
    const moving = run(INITIAL_BODY(100), { ...idle, right: true }, 30);
    const stopped = run(moving, idle, 120);
    expect(stopped.vx).toBe(0);
  });

  it('saute puis retombe au sol', () => {
    const inAir = run(INITIAL_BODY(100), { ...idle, jump: true }, 10);
    expect(inAir.y).toBeLessThan(0);
    expect(inAir.onGround).toBe(false);
    const landed = run(inAir, idle, 120);
    expect(landed.y).toBe(0);
    expect(landed.onGround).toBe(true);
  });

  it('ne peut pas sauter en l’air', () => {
    const inAir = run(INITIAL_BODY(100), { ...idle, jump: true }, 5);
    const again = step(inAir, { ...idle, jump: true }, 1 / 60, bounds);
    expect(again.vy).toBeGreaterThan(-PHYSICS.jumpVelocity);
  });

  it('reste dans les bornes du monde', () => {
    const b = run(INITIAL_BODY(10), { ...idle, left: true }, 60);
    expect(b.x).toBe(0);
    expect(b.vx).toBe(0);
  });

  it('atteint au moins 200 px de hauteur en sautant', () => {
    let b = INITIAL_BODY(100);
    let apex = 0;
    b = step(b, { ...idle, jump: true }, 1 / 60, bounds);
    for (let i = 0; i < 120; i++) {
      b = step(b, idle, 1 / 60, bounds);
      apex = Math.min(apex, b.y);
    }
    expect(apex).toBeLessThan(-200);
  });
});

describe('collectStars', () => {
  const stars: Star[] = [
    { id: 'low', x: 100, y: -120, high: false },
    { id: 'high', x: 100, y: -300, high: true },
    { id: 'far', x: 600, y: -120, high: false },
  ];

  it('ramasse les étoiles basses au sol, pas les hautes', () => {
    expect(collectStars(INITIAL_BODY(100), stars, new Set()).map((s) => s.id)).toEqual(['low']);
  });

  it('ramasse les hautes en l’air', () => {
    const body = { ...INITIAL_BODY(100), y: -150, onGround: false };
    expect(collectStars(body, stars, new Set(['low'])).map((s) => s.id)).toEqual(['high']);
  });
});

describe('nearestPoi', () => {
  const pois = [
    { id: 'a', x: 100 },
    { id: 'b', x: 400 },
  ] as Poi[];
  it('renvoie le plus proche dans le rayon', () => {
    expect(nearestPoi(380, pois, 150)?.id).toBe('b');
    expect(nearestPoi(250, pois, 100)).toBeNull();
  });
});

describe('followCamera', () => {
  it('reste dans les bornes du monde', () => {
    expect(followCamera(0, INITIAL_BODY(0), 1000, 5000)).toBe(0);
    expect(followCamera(4000, INITIAL_BODY(5000), 1000, 5000, 1)).toBe(4000);
  });
});
