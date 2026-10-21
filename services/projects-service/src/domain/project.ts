/** Entité « projet » du portfolio. */
export interface Project {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly stack: readonly string[];
  readonly repoUrl: string | null;
  readonly liveUrl: string | null;
  readonly year: number;
  readonly featured: boolean;
  /** Emoji ou icône décorative affichée sur la carte */
  readonly emoji: string;
}

/** Données d'un projet à créer ou modifier (l'identifiant est attribué par le dépôt). */
export type ProjectInput = Omit<Project, 'id'>;
