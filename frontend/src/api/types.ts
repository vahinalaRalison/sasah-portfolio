/** Contrats des API (miroir des entités des microservices). */

export type SkillCategory = 'backend' | 'frontend' | 'devops' | 'database' | 'architecture' | 'soft';

export interface Skill {
  name: string;
  category: SkillCategory;
  level: number;
}

export interface Experience {
  id: number;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  summary: string;
  highlights: string[];
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface Profile {
  fullName: string;
  nickname: string;
  title: string;
  tagline: string;
  bio: string;
  location: string;
  email: string;
  links: SocialLink[];
  skills: Skill[];
  experiences: Experience[];
  /** Vrai si un CV (PDF) est téléchargeable via l'API. */
  hasCv: boolean;
}

/** Champs du profil éditables depuis l'admin. */
export type ProfileInput = Omit<Profile, 'skills' | 'experiences' | 'hasCv'>;
export type ExperienceInput = Omit<Experience, 'id'>;

export interface Project {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  repoUrl: string | null;
  liveUrl: string | null;
  year: number;
  featured: boolean;
  emoji: string;
}

export type ProjectInput = Omit<Project, 'id'>;

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  body: string;
  createdAt: string;
}

export interface AdminSession {
  token: string;
  expiresAt: string;
}

export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  body: string;
  website?: string;
}

export interface ContactReceipt {
  id: number;
  createdAt: string;
}
