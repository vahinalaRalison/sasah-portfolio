import type pg from 'pg';
import type { ProjectRepository } from '../domain/ports.js';
import type { Project } from '../domain/project.js';

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
}
