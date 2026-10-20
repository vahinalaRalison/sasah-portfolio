import type { Experience, Profile, Skill } from './profile.js';

/** Port (interface) : la couche application ne connaît que ce contrat. */
export interface ProfileRepository {
  findProfile(): Promise<Omit<Profile, 'skills' | 'experiences'> | null>;
  findSkills(): Promise<Skill[]>;
  findExperiences(): Promise<Experience[]>;
}
