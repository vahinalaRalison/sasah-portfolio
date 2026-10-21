import { ConflictError, NotFoundError } from '../domain/errors.js';
import type { ProjectRepository } from '../domain/ports.js';
import type { Project, ProjectInput } from '../domain/project.js';

export interface ProjectFilters {
  readonly featured?: boolean;
  readonly tech?: string;
}

export class ProjectService {
  constructor(private readonly repository: ProjectRepository) {}

  async list(filters: ProjectFilters = {}): Promise<Project[]> {
    const projects = await this.repository.findAll();
    return sortProjects(filterProjects(projects, filters));
  }

  async getBySlug(slug: string): Promise<Project> {
    const project = await this.repository.findBySlug(slug);
    if (!project) throw new NotFoundError('Projet');
    return project;
  }

  /* ---- Administration ---- */

  async create(input: ProjectInput): Promise<Project> {
    if (await this.repository.findBySlug(input.slug)) throw new ConflictError(`Le slug « ${input.slug} » existe déjà`);
    return this.repository.create(input);
  }

  async update(slug: string, input: ProjectInput): Promise<Project> {
    if (input.slug !== slug && (await this.repository.findBySlug(input.slug))) {
      throw new ConflictError(`Le slug « ${input.slug} » existe déjà`);
    }
    const updated = await this.repository.update(slug, input);
    if (!updated) throw new NotFoundError('Projet');
    return updated;
  }

  async remove(slug: string): Promise<void> {
    if (!(await this.repository.delete(slug))) throw new NotFoundError('Projet');
  }

  /** Liste dédupliquée et triée des technologies utilisées (pour les filtres du front). */
  async listTechnologies(): Promise<string[]> {
    const projects = await this.repository.findAll();
    return [...new Set(projects.flatMap((p) => p.stack))].sort((a, b) => a.localeCompare(b));
  }
}

export function filterProjects(projects: readonly Project[], filters: ProjectFilters): Project[] {
  const tech = filters.tech?.trim().toLowerCase();
  return projects.filter((p) => {
    if (filters.featured !== undefined && p.featured !== filters.featured) return false;
    if (tech && !p.stack.some((s) => s.toLowerCase() === tech)) return false;
    return true;
  });
}

/** Projets mis en avant d'abord, puis du plus récent au plus ancien. */
export function sortProjects(projects: readonly Project[]): Project[] {
  return [...projects].sort((a, b) => Number(b.featured) - Number(a.featured) || b.year - a.year || a.name.localeCompare(b.name));
}
