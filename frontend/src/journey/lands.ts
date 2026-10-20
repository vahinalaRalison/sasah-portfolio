/** Les terres traversées par le cheval blanc : une par section du portfolio. */

export type Terrain = 'castle' | 'meadow' | 'forest' | 'mountains' | 'treasure' | 'ball';

export interface Land {
  /** id de la section HTML (ancre) */
  readonly id: string;
  readonly name: string;
  readonly subtitle: string;
  readonly emoji: string;
  readonly terrain: Terrain;
  /** Texte affiché sur le panneau à l'arrivée du cheval */
  readonly discover: string;
}

export const LANDS: readonly Land[] = [
  { id: 'top', name: 'Le Château de Départ', subtitle: 'Bonjour, je suis', emoji: '🏰', terrain: 'castle', discover: 'Le voyage commence' },
  { id: 'about', name: 'La Prairie des Origines', subtitle: 'À propos de moi', emoji: '🌸', terrain: 'meadow', discover: 'Qui je suis' },
  { id: 'skills', name: 'La Forêt des Talents', subtitle: 'Compétences', emoji: '🌲', terrain: 'forest', discover: 'Ma baguette magique' },
  { id: 'experience', name: 'Les Monts du Parcours', subtitle: 'Expériences', emoji: '⛰️', terrain: 'mountains', discover: 'Mon chemin' },
  { id: 'projects', name: 'La Vallée des Trésors', subtitle: 'Projets', emoji: '💎', terrain: 'treasure', discover: 'Mes réalisations' },
  { id: 'contact', name: 'Le Château du Bal', subtitle: 'Contact', emoji: '👑', terrain: 'ball', discover: 'Écrivez-moi' },
];

export function landById(id: string): Land {
  return LANDS.find((l) => l.id === id) ?? LANDS[0]!;
}

export function landIndex(id: string): number {
  return Math.max(0, LANDS.findIndex((l) => l.id === id));
}
