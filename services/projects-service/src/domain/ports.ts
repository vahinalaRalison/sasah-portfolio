import type { Project, ProjectInput } from './project.js';

export interface ProjectRepository {
  findAll(): Promise<Project[]>;
  findBySlug(slug: string): Promise<Project | null>;
  create(input: ProjectInput): Promise<Project>;
  /** Met à jour le projet identifié par `slug` (le slug lui-même peut changer) ; null si absent. */
  update(slug: string, input: ProjectInput): Promise<Project | null>;
  delete(slug: string): Promise<boolean>;
}
