/** Combos d'étoiles et titre de fin de voyage : logique pure, testée dans score.test.ts. */

/** Délai (ms) entre deux étoiles pour prolonger un combo. */
export const COMBO_WINDOW = 1300;

export interface Combo {
  readonly count: number;
  /** Instant (ms) de la dernière étoile, 0 si aucune */
  readonly at: number;
}

export const NO_COMBO: Combo = { count: 0, at: 0 };

/** Une étoile de plus : le combo continue s'il est encore dans la fenêtre, sinon il repart à 1. */
export function nextCombo(combo: Combo, now: number, gained = 1, window = COMBO_WINDOW): Combo {
  const continues = combo.count > 0 && now - combo.at <= window;
  return { count: (continues ? combo.count : 0) + gained, at: now };
}

/** Vrai si le combo est expiré (plus rien à afficher). */
export function comboExpired(combo: Combo, now: number, window = COMBO_WINDOW): boolean {
  return combo.count === 0 || now - combo.at > window;
}

export interface Rank {
  readonly title: string;
  readonly emoji: string;
  readonly praise: string;
}

const RANKS: readonly (Rank & { min: number })[] = [
  { min: 1, title: 'Reine du Royaume', emoji: '👑', praise: 'Toutes les étoiles ! Le royaume est à vous.' },
  { min: 0.75, title: 'Grande-Duchesse des Étoiles', emoji: '💎', praise: 'Presque toutes les étoiles brillent pour vous.' },
  { min: 0.5, title: 'Princesse Aventurière', emoji: '🦄', praise: 'Un beau voyage, il reste des étoiles à cueillir.' },
  { min: 0.25, title: 'Princesse Exploratrice', emoji: '🌸', praise: 'Le chemin est tracé, les étoiles vous attendent.' },
  { min: 0, title: 'Apprentie Princesse', emoji: '🎀', praise: 'Chaque voyage commence par un premier pas.' },
];

/** Titre honorifique selon la part d'étoiles ramassées (0 étoile au total = plein titre). */
export function rankFor(collected: number, total: number): Rank {
  const ratio = total === 0 ? 1 : Math.max(0, Math.min(1, collected / total));
  const found = RANKS.find((r) => ratio >= r.min) ?? RANKS[RANKS.length - 1]!;
  return { title: found.title, emoji: found.emoji, praise: found.praise };
}
