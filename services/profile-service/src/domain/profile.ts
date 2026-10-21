/** Entités du domaine « profil ». Aucune dépendance technique ici. */

export type SkillCategory = 'backend' | 'frontend' | 'devops' | 'database' | 'architecture' | 'soft';

export interface Skill {
  readonly name: string;
  readonly category: SkillCategory;
  /** Niveau de 1 à 5 */
  readonly level: number;
}

export interface Experience {
  readonly id: number;
  readonly company: string;
  readonly role: string;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly summary: string;
  readonly highlights: readonly string[];
}

export interface SocialLink {
  readonly label: string;
  readonly url: string;
}

/** Champs éditables du profil (hors compétences et expériences). */
export interface ProfileBase {
  readonly fullName: string;
  readonly nickname: string;
  readonly title: string;
  readonly tagline: string;
  readonly bio: string;
  readonly location: string;
  readonly email: string;
  readonly links: readonly SocialLink[];
}

export interface Profile extends ProfileBase {
  readonly skills: readonly Skill[];
  readonly experiences: readonly Experience[];
  /** Vrai si un CV (PDF) est disponible au téléchargement. */
  readonly hasCv: boolean;
}

export type ExperienceInput = Omit<Experience, 'id'>;

/** CV au format PDF, stocké tel quel. */
export interface CvFile {
  readonly filename: string;
  readonly content: Buffer;
  readonly size: number;
  readonly updatedAt: string;
}
