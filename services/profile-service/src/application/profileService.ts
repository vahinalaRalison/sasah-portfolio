import { NotFoundError } from '../domain/errors.js';
import type { ProfileRepository } from '../domain/ports.js';
import type { Experience, Profile, Skill, SkillCategory } from '../domain/profile.js';

/**
 * Cas d'usage du profil. Dépend uniquement du port `ProfileRepository`
 * (injection de dépendance) : testable sans base de données.
 */
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  async getProfile(): Promise<Profile> {
    const [base, skills, experiences] = await Promise.all([
      this.repository.findProfile(),
      this.repository.findSkills(),
      this.repository.findExperiences(),
    ]);
    if (!base) throw new NotFoundError('Profil');
    return { ...base, skills: sortSkills(skills), experiences: sortExperiences(experiences) };
  }

  async getSkillsByCategory(): Promise<Record<SkillCategory, Skill[]>> {
    const skills = sortSkills(await this.repository.findSkills());
    const grouped = {} as Record<SkillCategory, Skill[]>;
    for (const skill of skills) {
      (grouped[skill.category] ??= []).push(skill);
    }
    return grouped;
  }

  async getExperiences(): Promise<Experience[]> {
    return sortExperiences(await this.repository.findExperiences());
  }
}

/** Compétences : niveau décroissant puis ordre alphabétique (stable). */
export function sortSkills(skills: readonly Skill[]): Skill[] {
  return [...skills].sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));
}

/** Expériences : poste en cours d'abord, puis les plus récentes. */
export function sortExperiences(experiences: readonly Experience[]): Experience[] {
  return [...experiences].sort((a, b) => {
    if (a.endDate === null && b.endDate !== null) return -1;
    if (b.endDate === null && a.endDate !== null) return 1;
    return b.startDate.localeCompare(a.startDate);
  });
}
