import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { ProjectService, filterProjects, sortProjects } from '../src/application/projectService.js';
import type { ProjectRepository } from '../src/domain/ports.js';
import type { Project } from '../src/domain/project.js';

const base = { tagline: '', description: '', repoUrl: null, liveUrl: null, emoji: '✨' };
const projects: Project[] = [
  { ...base, id: 1, slug: 'old', name: 'Old', stack: ['PHP'], year: 2022, featured: false },
  { ...base, id: 2, slug: 'star', name: 'Star', stack: ['React', 'Docker'], year: 2024, featured: true },
  { ...base, id: 3, slug: 'new', name: 'New', stack: ['Docker'], year: 2025, featured: false },
];

const repository: ProjectRepository = {
  findAll: async () => projects,
  findBySlug: async (slug) => projects.find((p) => p.slug === slug) ?? null,
  create: async (input) => ({ id: 99, ...input }),
  update: async (slug, input) => (projects.some((p) => p.slug === slug) ? { id: 1, ...input } : null),
  delete: async (slug) => projects.some((p) => p.slug === slug),
};

describe('sortProjects', () => {
  it('met en avant les projets featured puis les plus récents', () => {
    expect(sortProjects(projects).map((p) => p.slug)).toEqual(['star', 'new', 'old']);
  });
});

describe('filterProjects', () => {
  it('filtre par technologie sans tenir compte de la casse', () => {
    expect(filterProjects(projects, { tech: 'docker' }).map((p) => p.id)).toEqual([2, 3]);
  });
  it('filtre par featured', () => {
    expect(filterProjects(projects, { featured: true }).map((p) => p.id)).toEqual([2]);
  });
});

describe('ProjectService', () => {
  it('liste les technologies dédupliquées et triées', async () => {
    expect(await new ProjectService(repository).listTechnologies()).toEqual(['Docker', 'PHP', 'React']);
  });
  it('lève NotFound pour un slug inconnu', async () => {
    await expect(new ProjectService(repository).getBySlug('nope')).rejects.toThrow('Projet introuvable');
  });
});

describe('HTTP', () => {
  const app = buildApp({ projectService: new ProjectService(repository), corsOrigin: '*', logLevel: 'silent' });

  it('GET /api/projects?featured=true', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/projects?featured=true' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveLength(1);
  });

  it('GET /api/projects?featured=maybe renvoie 400', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/projects?featured=maybe' });
    expect(res.statusCode).toBe(400);
  });

  it('GET /api/projects/:slug renvoie 404 si inconnu', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/projects/unknown' });
    expect(res.statusCode).toBe(404);
  });
});
