import type pg from 'pg';
import type { ProfileRepository } from '../domain/ports.js';
import type { Experience, Profile, Skill, SkillCategory, SocialLink } from '../domain/profile.js';

interface ProfileRow {
  full_name: string;
  nickname: string;
  title: string;
  tagline: string;
  bio: string;
  location: string;
  email: string;
  links: SocialLink[];
}

interface SkillRow {
  name: string;
  category: SkillCategory;
  level: number;
}

interface ExperienceRow {
  id: number;
  company: string;
  role: string;
  start_date: string;
  end_date: string | null;
  summary: string;
  highlights: string[];
}

/** Adapter PostgreSQL du port `ProfileRepository`. */
export class PgProfileRepository implements ProfileRepository {
  constructor(private readonly pool: pg.Pool) {}

  async findProfile(): Promise<Omit<Profile, 'skills' | 'experiences'> | null> {
    const { rows } = await this.pool.query<ProfileRow>(
      'SELECT full_name, nickname, title, tagline, bio, location, email, links FROM profile LIMIT 1',
    );
    const row = rows[0];
    if (!row) return null;
    return {
      fullName: row.full_name,
      nickname: row.nickname,
      title: row.title,
      tagline: row.tagline,
      bio: row.bio,
      location: row.location,
      email: row.email,
      links: row.links,
    };
  }

  async findSkills(): Promise<Skill[]> {
    const { rows } = await this.pool.query<SkillRow>('SELECT name, category, level FROM skills');
    return rows.map((r) => ({ name: r.name, category: r.category, level: r.level }));
  }

  async findExperiences(): Promise<Experience[]> {
    const { rows } = await this.pool.query<ExperienceRow>(
      `SELECT id, company, role, to_char(start_date, 'YYYY-MM') AS start_date,
              to_char(end_date, 'YYYY-MM') AS end_date, summary, highlights
       FROM experiences`,
    );
    return rows.map((r) => ({
      id: r.id,
      company: r.company,
      role: r.role,
      startDate: r.start_date,
      endDate: r.end_date,
      summary: r.summary,
      highlights: r.highlights,
    }));
  }
}
