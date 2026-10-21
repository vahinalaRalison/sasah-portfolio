import type { Experience, Profile, Project, SkillCategory } from '../api/types';
import { LANDS, type Land } from '../journey/lands';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../lib/format';

/** Dimensions du monde (en pixels monde, indépendants de l'écran). */
export const LAND_WIDTH = 2400;
export const WORLD_WIDTH = LAND_WIDTH * LANDS.length;
/** Boîte de collision du cheval, relative à ses sabots (y négatif vers le haut). */
export const HORSE_HITBOX = { halfWidth: 70, height: 190 };
export const START_X = 260;
/** Position du château du bal dans sa terre, et sa porte (en px monde) : y arriver termine le voyage. */
export const BALL_CASTLE_X = 1900;
export const CASTLE_DOOR_X = (LANDS.length - 1) * LAND_WIDTH + BALL_CASTLE_X;

export type PoiKind = 'intro' | 'about' | 'pillars' | 'skills' | 'experience' | 'project' | 'contact';

export interface Poi {
  readonly id: string;
  readonly landId: string;
  readonly x: number;
  readonly kind: PoiKind;
  readonly label: string;
  readonly emoji: string;
  /** Données associées selon le type */
  readonly category?: SkillCategory;
  readonly experience?: Experience;
  readonly project?: Project;
}

export interface Star {
  readonly id: string;
  readonly x: number;
  /** Hauteur au-dessus du sol (négatif = vers le haut) */
  readonly y: number;
  /** Vrai si l'étoile demande un saut */
  readonly high: boolean;
}

export function landRange(land: Land): { x0: number; x1: number } {
  const i = LANDS.findIndex((l) => l.id === land.id);
  return { x0: i * LAND_WIDTH, x1: (i + 1) * LAND_WIDTH };
}

export function landAt(x: number): Land {
  const i = Math.min(LANDS.length - 1, Math.max(0, Math.floor(x / LAND_WIDTH)));
  return LANDS[i]!;
}

/** Répartit `count` points dans une terre, en laissant une marge à chaque bout. */
function spread(land: Land, count: number): number[] {
  const { x0 } = landRange(land);
  const margin = 420;
  const usable = LAND_WIDTH - margin * 2;
  if (count === 1) return [x0 + LAND_WIDTH / 2];
  return Array.from({ length: count }, (_, i) => Math.round(x0 + margin + (usable * i) / (count - 1)));
}

/** Construit les points d'intérêt à partir des données du profil et des projets. */
export function buildPois(profile: Profile, projects: Project[]): Poi[] {
  const pois: Poi[] = [];
  const land = (id: string) => LANDS.find((l) => l.id === id)!;

  const [introX] = spread(land('top'), 1);
  pois.push({ id: 'intro', landId: 'top', x: introX!, kind: 'intro', label: 'Bienvenue', emoji: '🏰' });

  const [aboutX, pillarsX] = spread(land('about'), 2);
  pois.push({ id: 'about', landId: 'about', x: aboutX!, kind: 'about', label: 'Qui je suis', emoji: '🌸' });
  pois.push({ id: 'pillars', landId: 'about', x: pillarsX!, kind: 'pillars', label: 'Ma façon de travailler', emoji: '🪄' });

  const categories = CATEGORY_ORDER.filter((c) => profile.skills.some((s) => s.category === c));
  spread(land('skills'), categories.length).forEach((x, i) => {
    const category = categories[i]!;
    pois.push({ id: `skills-${category}`, landId: 'skills', x, kind: 'skills', label: CATEGORY_LABELS[category], emoji: '🌲', category });
  });

  spread(land('experience'), Math.max(1, profile.experiences.length)).forEach((x, i) => {
    const experience = profile.experiences[i];
    if (experience) pois.push({ id: `exp-${experience.id}`, landId: 'experience', x, kind: 'experience', label: experience.company, emoji: '⛰️', experience });
  });

  spread(land('projects'), Math.max(1, projects.length)).forEach((x, i) => {
    const project = projects[i];
    if (project) pois.push({ id: `proj-${project.slug}`, landId: 'projects', x, kind: 'project', label: project.name, emoji: project.emoji, project });
  });

  const [contactX] = spread(land('contact'), 1);
  pois.push({ id: 'contact', landId: 'contact', x: contactX!, kind: 'contact', label: 'Le Bal', emoji: '👑' });

  return pois;
}

/** Générateur pseudo-aléatoire déterministe : même parcours d'étoiles à chaque partie. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Étoiles : des arcs au sol et des étoiles hautes à atteindre en sautant. */
export function buildStars(): Star[] {
  const rand = mulberry32(7);
  const stars: Star[] = [];
  let x = START_X + 500;
  let n = 0;
  while (x < WORLD_WIDTH - 500) {
    const pattern = rand();
    if (pattern < 0.45) {
      // arc de 5 étoiles au niveau du cavalier
      for (let i = 0; i < 5; i++) {
        const y = -120 - Math.sin((i / 4) * Math.PI) * 60;
        stars.push({ id: `s${n++}`, x: x + i * 70, y: Math.round(y), high: false });
      }
      x += 5 * 70 + 260;
    } else if (pattern < 0.8) {
      // étoile haute isolée (saut)
      stars.push({ id: `s${n++}`, x, y: -300 - Math.round(rand() * 40), high: true });
      x += 320;
    } else {
      // escalier : trois étoiles de plus en plus hautes
      for (let i = 0; i < 3; i++) stars.push({ id: `s${n++}`, x: x + i * 90, y: -150 - i * 75, high: i === 2 });
      x += 3 * 90 + 300;
    }
    x += Math.round(rand() * 120);
  }
  return stars;
}
