import { NotFoundError } from '../domain/errors.js';
import type { ProfileRepository } from '../domain/ports.js';
import type { CvFile, Experience, ExperienceInput, Profile, ProfileBase, Skill, SkillCategory } from '../domain/profile.js';

/**
 * Cas d'usage du profil. Dépend uniquement du port `ProfileRepository`
 * (injection de dépendance) : testable sans base de données.
 */
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  async getProfile(): Promise<Profile> {
    const [base, skills, experiences, hasCv] = await Promise.all([
      this.repository.findProfile(),
      this.repository.findSkills(),
      this.repository.findExperiences(),
      this.repository.hasCv(),
    ]);
    if (!base) throw new NotFoundError('Profil');
    return { ...base, skills: sortSkills(skills), experiences: sortExperiences(experiences), hasCv };
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

  /* ---- Administration ---- */

  async updateProfile(input: ProfileBase): Promise<Profile> {
    await this.repository.saveProfile(input);
    return this.getProfile();
  }

  async replaceSkills(skills: readonly Skill[]): Promise<Skill[]> {
    await this.repository.replaceSkills(dedupeSkills(skills));
    return sortSkills(await this.repository.findSkills());
  }

  async addExperience(input: ExperienceInput): Promise<Experience> {
    return this.repository.createExperience(input);
  }

  async updateExperience(id: number, input: ExperienceInput): Promise<Experience> {
    const updated = await this.repository.updateExperience(id, input);
    if (!updated) throw new NotFoundError('Expérience');
    return updated;
  }

  async removeExperience(id: number): Promise<void> {
    if (!(await this.repository.deleteExperience(id))) throw new NotFoundError('Expérience');
  }

  async getCv(): Promise<CvFile> {
    const cv = await this.repository.findCv();
    if (!cv) throw new NotFoundError('CV');
    return cv;
  }

  async saveCv(filename: string, content: Buffer): Promise<void> {
    await this.repository.saveCv({ filename, content, size: content.byteLength });
  }

  async removeCv(): Promise<void> {
    await this.repository.deleteCv();
  }
}

/** Compétences : niveau décroissant puis ordre alphabétique (stable). */
export function sortSkills(skills: readonly Skill[]): Skill[] {
  return [...skills].sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));
}

/** Un même nom ne peut apparaître qu'une fois : la dernière occurrence l'emporte. */
export function dedupeSkills(skills: readonly Skill[]): Skill[] {
  const byName = new Map<string, Skill>();
  for (const s of skills) byName.set(s.name.trim().toLowerCase(), { ...s, name: s.name.trim() });
  return [...byName.values()];
}

/** Expériences : poste en cours d'abord, puis les plus récentes. */
export function sortExperiences(experiences: readonly Experience[]): Experience[] {
  return [...experiences].sort((a, b) => {
    if (a.endDate === null && b.endDate !== null) return -1;
    if (b.endDate === null && a.endDate !== null) return 1;
    return b.startDate.localeCompare(a.startDate);
  });
}
