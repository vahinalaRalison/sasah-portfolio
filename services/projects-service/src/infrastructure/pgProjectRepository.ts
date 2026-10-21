import type pg from 'pg';
import type { ProjectRepository } from '../domain/ports.js';
import type { Project, ProjectInput } from '../domain/project.js';

interface ProjectRow {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  repo_url: string | null;
  live_url: string | null;
  year: number;
  featured: boolean;
  emoji: string;
}

const COLUMNS = 'id, slug, name, tagline, description, stack, repo_url, live_url, year, featured, emoji';

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    stack: row.stack,
    repoUrl: row.repo_url,
    liveUrl: row.live_url,
    year: row.year,
    featured: row.featured,
    emoji: row.emoji,
  };
}

export class PgProjectRepository implements ProjectRepository {
  constructor(private readonly pool: pg.Pool) {}

  async findAll(): Promise<Project[]> {
    const { rows } = await this.pool.query<ProjectRow>(`SELECT ${COLUMNS} FROM projects`);
    return rows.map(toProject);
  }

  async findBySlug(slug: string): Promise<Project | null> {
    const { rows } = await this.pool.query<ProjectRow>(`SELECT ${COLUMNS} FROM projects WHERE slug = $1`, [slug]);
    return rows[0] ? toProject(rows[0]) : null;
  }

  async create(p: ProjectInput): Promise<Project> {
    const { rows } = await this.pool.query<ProjectRow>(
      `INSERT INTO projects (slug, name, tagline, description, stack, repo_url, live_url, year, featured, emoji)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING ${COLUMNS}`,
      [p.slug, p.name, p.tagline, p.description, p.stack, p.repoUrl, p.liveUrl, p.year, p.featured, p.emoji],
    );
    return toProject(rows[0]!);
  }

  async update(slug: string, p: ProjectInput): Promise<Project | null> {
    const { rows } = await this.pool.query<ProjectRow>(
      `UPDATE projects SET slug = $2, name = $3, tagline = $4, description = $5, stack = $6,
         repo_url = $7, live_url = $8, year = $9, featured = $10, emoji = $11
       WHERE slug = $1
       RETURNING ${COLUMNS}`,
      [slug, p.slug, p.name, p.tagline, p.description, p.stack, p.repoUrl, p.liveUrl, p.year, p.featured, p.emoji],
    );
    return rows[0] ? toProject(rows[0]) : null;
  }

  async delete(slug: string): Promise<boolean> {
    const { rowCount } = await this.pool.query('DELETE FROM projects WHERE slug = $1', [slug]);
    return (rowCount ?? 0) > 0;
  }
}
