import type { CvFile, Experience, ExperienceInput, ProfileBase, Skill } from './profile.js';

/** Port (interface) : la couche application ne connaît que ce contrat. */
export interface ProfileRepository {
  findProfile(): Promise<ProfileBase | null>;
  findSkills(): Promise<Skill[]>;
  findExperiences(): Promise<Experience[]>;
  hasCv(): Promise<boolean>;

  saveProfile(profile: ProfileBase): Promise<void>;
  /** Remplace l'ensemble des compétences (l'admin édite la liste complète). */
  replaceSkills(skills: readonly Skill[]): Promise<void>;
  createExperience(input: ExperienceInput): Promise<Experience>;
  updateExperience(id: number, input: ExperienceInput): Promise<Experience | null>;
  deleteExperience(id: number): Promise<boolean>;
  findCv(): Promise<CvFile | null>;
  saveCv(file: Omit<CvFile, 'updatedAt'>): Promise<void>;
  deleteCv(): Promise<void>;
}
