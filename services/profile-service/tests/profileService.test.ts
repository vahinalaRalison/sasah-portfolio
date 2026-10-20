import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { ProfileService, sortExperiences, sortSkills } from '../src/application/profileService.js';
import type { ProfileRepository } from '../src/domain/ports.js';
import type { Experience, Skill } from '../src/domain/profile.js';

const skills: Skill[] = [
  { name: 'React', category: 'frontend', level: 5 },
  { name: 'Docker', category: 'devops', level: 5 },
  { name: 'Kubernetes', category: 'devops', level: 3 },
];

const experiences: Experience[] = [
  { id: 1, company: 'A', role: 'Dev', startDate: '2022-01', endDate: '2022-12', summary: '', highlights: [] },
  { id: 2, company: 'B', role: 'Lead', startDate: '2024-01', endDate: null, summary: '', highlights: [] },
  { id: 3, company: 'C', role: 'Dev', startDate: '2023-01', endDate: '2023-12', summary: '', highlights: [] },
];

/** Double de test du port : aucune base nécessaire. */
function fakeRepository(overrides: Partial<ProfileRepository> = {}): ProfileRepository {
  return {
    findProfile: async () => ({
      fullName: 'Sarah Mendrika',
      nickname: 'Sasah',
      title: 'Dev',
      tagline: '',
      bio: '',
      location: '',
      email: 'sarah@example.com',
      links: [],
    }),
    findSkills: async () => skills,
    findExperiences: async () => experiences,
    ...overrides,
  };
}

describe('sortSkills', () => {
  it('trie par niveau décroissant puis par nom', () => {
    expect(sortSkills(skills).map((s) => s.name)).toEqual(['Docker', 'React', 'Kubernetes']);
  });
});

describe('sortExperiences', () => {
  it('place le poste en cours en premier puis les plus récents', () => {
    expect(sortExperiences(experiences).map((e) => e.id)).toEqual([2, 3, 1]);
  });
});

describe('ProfileService', () => {
  it('agrège profil, compétences et expériences', async () => {
    const profile = await new ProfileService(fakeRepository()).getProfile();
    expect(profile.nickname).toBe('Sasah');
    expect(profile.skills).toHaveLength(3);
    expect(profile.experiences[0]?.company).toBe('B');
  });

  it('groupe les compétences par catégorie', async () => {
    const grouped = await new ProfileService(fakeRepository()).getSkillsByCategory();
    expect(Object.keys(grouped).sort()).toEqual(['devops', 'frontend']);
    expect(grouped.devops.map((s) => s.name)).toEqual(['Docker', 'Kubernetes']);
  });
});

describe('HTTP', () => {
  it('GET /api/profile renvoie 200 et le profil', async () => {
    const app = buildApp({ profileService: new ProfileService(fakeRepository()), corsOrigin: '*', logLevel: 'silent' });
    const res = await app.inject({ method: 'GET', url: '/api/profile' });
    expect(res.statusCode).toBe(200);
    expect(res.json().fullName).toBe('Sarah Mendrika');
    await app.close();
  });

  it('GET /api/profile renvoie 404 si le profil est absent', async () => {
    const service = new ProfileService(fakeRepository({ findProfile: async () => null }));
    const app = buildApp({ profileService: service, corsOrigin: '*', logLevel: 'silent' });
    const res = await app.inject({ method: 'GET', url: '/api/profile' });
    expect(res.statusCode).toBe(404);
    await app.close();
  });

  it('GET /api/profile/health renvoie 503 si la base est injoignable', async () => {
    const app = buildApp({
      profileService: new ProfileService(fakeRepository()),
      corsOrigin: '*',
      logLevel: 'silent',
      checkReadiness: async () => {
        throw new Error('db down');
      },
    });
    const res = await app.inject({ method: 'GET', url: '/api/profile/health' });
    expect(res.statusCode).toBe(503);
    await app.close();
  });
});
