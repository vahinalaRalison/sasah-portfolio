import type pg from 'pg';
import type { ProfileRepository } from '../domain/ports.js';
import type { CvFile, Experience, ExperienceInput, ProfileBase, Skill, SkillCategory, SocialLink } from '../domain/profile.js';

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

interface CvRow {
  filename: string;
  content: Buffer;
  size: number;
  updated_at: Date;
}

const EXPERIENCE_COLUMNS = `id, company, role, to_char(start_date, 'YYYY-MM') AS start_date,
  to_char(end_date, 'YYYY-MM') AS end_date, summary, highlights`;

function toExperience(r: ExperienceRow): Experience {
  return {
    id: r.id,
    company: r.company,
    role: r.role,
    startDate: r.start_date,
    endDate: r.end_date,
    summary: r.summary,
    highlights: r.highlights,
  };
}

/** `2024-01` → premier jour du mois (colonne DATE). */
const monthToDate = (month: string | null): string | null => (month ? `${month}-01` : null);

/** Adapter PostgreSQL du port `ProfileRepository`. */
export class PgProfileRepository implements ProfileRepository {
  constructor(private readonly pool: pg.Pool) {}

  async findProfile(): Promise<ProfileBase | null> {
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
    const { rows } = await this.pool.query<ExperienceRow>(`SELECT ${EXPERIENCE_COLUMNS} FROM experiences`);
    return rows.map(toExperience);
  }

  async hasCv(): Promise<boolean> {
    const { rowCount } = await this.pool.query('SELECT 1 FROM profile_cv WHERE id = 1');
    return (rowCount ?? 0) > 0;
  }

  async saveProfile(p: ProfileBase): Promise<void> {
    await this.pool.query(
      `INSERT INTO profile (id, full_name, nickname, title, tagline, bio, location, email, links)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8::jsonb)
       ON CONFLICT (id) DO UPDATE SET
         full_name = EXCLUDED.full_name, nickname = EXCLUDED.nickname, title = EXCLUDED.title,
         tagline = EXCLUDED.tagline, bio = EXCLUDED.bio, location = EXCLUDED.location,
         email = EXCLUDED.email, links = EXCLUDED.links, updated_at = now()`,
      [p.fullName, p.nickname, p.title, p.tagline, p.bio, p.location, p.email, JSON.stringify(p.links)],
    );
  }

  async replaceSkills(skills: readonly Skill[]): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM skills');
      for (const s of skills) {
        await client.query('INSERT INTO skills (name, category, level) VALUES ($1, $2, $3)', [s.name, s.category, s.level]);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async createExperience(e: ExperienceInput): Promise<Experience> {
    const { rows } = await this.pool.query<ExperienceRow>(
      `INSERT INTO experiences (company, role, start_date, end_date, summary, highlights)
       VALUES ($1, $2, $3::date, $4::date, $5, $6)
       RETURNING ${EXPERIENCE_COLUMNS}`,
      [e.company, e.role, monthToDate(e.startDate), monthToDate(e.endDate), e.summary, e.highlights],
    );
    return toExperience(rows[0]!);
  }

  async updateExperience(id: number, e: ExperienceInput): Promise<Experience | null> {
    const { rows } = await this.pool.query<ExperienceRow>(
      `UPDATE experiences SET company = $2, role = $3, start_date = $4::date, end_date = $5::date, summary = $6, highlights = $7
       WHERE id = $1
       RETURNING ${EXPERIENCE_COLUMNS}`,
      [id, e.company, e.role, monthToDate(e.startDate), monthToDate(e.endDate), e.summary, e.highlights],
    );
    return rows[0] ? toExperience(rows[0]) : null;
  }

  async deleteExperience(id: number): Promise<boolean> {
    const { rowCount } = await this.pool.query('DELETE FROM experiences WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  }

  async findCv(): Promise<CvFile | null> {
    const { rows } = await this.pool.query<CvRow>('SELECT filename, content, size, updated_at FROM profile_cv WHERE id = 1');
    const row = rows[0];
    return row ? { filename: row.filename, content: row.content, size: row.size, updatedAt: row.updated_at.toISOString() } : null;
  }

  async saveCv(file: Omit<CvFile, 'updatedAt'>): Promise<void> {
    await this.pool.query(
      `INSERT INTO profile_cv (id, filename, content, size) VALUES (1, $1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET filename = EXCLUDED.filename, content = EXCLUDED.content, size = EXCLUDED.size, updated_at = now()`,
      [file.filename, file.content, file.size],
    );
  }

  async deleteCv(): Promise<void> {
    await this.pool.query('DELETE FROM profile_cv WHERE id = 1');
  }
}
