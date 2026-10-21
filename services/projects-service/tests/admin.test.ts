import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { ProjectService } from '../src/application/projectService.js';
import type { ProjectRepository } from '../src/domain/ports.js';
import type { Project } from '../src/domain/project.js';
import { signToken } from '../src/http/adminAuth.js';

const SECRET = 'une-cle-de-test-suffisamment-longue';

function memoryRepository(): ProjectRepository {
  let projects: Project[] = [
    { id: 1, slug: 'star', name: 'Star', tagline: '', description: '', stack: ['React'], repoUrl: null, liveUrl: null, year: 2024, featured: true, emoji: '⭐' },
  ];
  let nextId = 2;
  return {
    findAll: async () => projects,
    findBySlug: async (slug) => projects.find((p) => p.slug === slug) ?? null,
    create: async (input) => {
      const created = { id: nextId++, ...input };
      projects.push(created);
      return created;
    },
    update: async (slug, input) => {
      const i = projects.findIndex((p) => p.slug === slug);
      if (i < 0) return null;
      projects[i] = { id: projects[i]!.id, ...input };
      return projects[i]!;
    },
    delete: async (slug) => {
      const before = projects.length;
      projects = projects.filter((p) => p.slug !== slug);
      return projects.length < before;
    },
  };
}

const auth = () => ({ authorization: `Bearer ${signToken(SECRET).token}` });
const app = (adminSecret: string | null = SECRET) =>
  buildApp({ projectService: new ProjectService(memoryRepository()), corsOrigin: '*', logLevel: 'silent', adminSecret });

const input = { slug: 'nouveau', name: 'Nouveau', tagline: 'Un projet', description: '', stack: ['Laravel'], repoUrl: '', liveUrl: 'https://exemple.fr', year: 2026, featured: false, emoji: '🌸' };

describe('HTTP admin projets', () => {
  it('refuse sans jeton et répond 503 sans secret', async () => {
    const a = app();
    expect((await a.inject({ method: 'POST', url: '/api/projects', payload: input })).statusCode).toBe(401);
    await a.close();
    const off = app(null);
    expect((await off.inject({ method: 'POST', url: '/api/projects', headers: auth(), payload: input })).statusCode).toBe(503);
    await off.close();
  });

  it('crée un projet (URL vide → null) et refuse un slug en double', async () => {
    const a = app();
    const created = await a.inject({ method: 'POST', url: '/api/projects', headers: auth(), payload: input });
    expect(created.statusCode).toBe(201);
    expect(created.json().repoUrl).toBeNull();
    expect(created.json().liveUrl).toBe('https://exemple.fr');
    const dup = await a.inject({ method: 'POST', url: '/api/projects', headers: auth(), payload: input });
    expect(dup.statusCode).toBe(409);
    const list = await a.inject({ method: 'GET', url: '/api/projects' });
    expect(list.json()).toHaveLength(2);
    await a.close();
  });

  it('valide le corps', async () => {
    const a = app();
    const bad = await a.inject({ method: 'POST', url: '/api/projects', headers: auth(), payload: { ...input, slug: 'Pas Valide', year: 1800 } });
    expect(bad.statusCode).toBe(400);
    expect(Object.keys(bad.json().errors).sort()).toEqual(['slug', 'year']);
    await a.close();
  });

  it('modifie puis supprime un projet', async () => {
    const a = app();
    const updated = await a.inject({ method: 'PUT', url: '/api/projects/star', headers: auth(), payload: { ...input, slug: 'star', name: 'Star 2' } });
    expect(updated.statusCode).toBe(200);
    expect(updated.json().name).toBe('Star 2');
    expect((await a.inject({ method: 'PUT', url: '/api/projects/absent', headers: auth(), payload: input })).statusCode).toBe(404);
    expect((await a.inject({ method: 'DELETE', url: '/api/projects/star', headers: auth() })).statusCode).toBe(204);
    expect((await a.inject({ method: 'GET', url: '/api/projects/star' })).statusCode).toBe(404);
    await a.close();
  });
});
