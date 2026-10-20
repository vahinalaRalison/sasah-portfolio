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

export interface Profile {
  readonly fullName: string;
  readonly nickname: string;
  readonly title: string;
  readonly tagline: string;
  readonly bio: string;
  readonly location: string;
  readonly email: string;
  readonly links: readonly SocialLink[];
  readonly skills: readonly Skill[];
  readonly experiences: readonly Experience[];
}
