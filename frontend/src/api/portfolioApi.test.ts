import { describe, expect, it } from 'vitest';
import { base64Bytes, readFirebaseConfig, sortExperiences, sortProjects, sortSkills, splitChunks } from './portfolioApi';

describe('tri côté client (mêmes règles que les services)', () => {
  it('compétences : niveau décroissant puis nom', () => {
    const out = sortSkills([
      { name: 'React', category: 'frontend', level: 5 },
      { name: 'Docker', category: 'devops', level: 5 },
      { name: 'Kubernetes', category: 'devops', level: 3 },
    ]);
    expect(out.map((s) => s.name)).toEqual(['Docker', 'React', 'Kubernetes']);
  });
  it('expériences : poste en cours puis plus récentes', () => {
    const base = { company: '', role: '', summary: '', highlights: [] };
    const out = sortExperiences([
      { ...base, id: 1, startDate: '2022-01', endDate: '2022-12' },
      { ...base, id: 2, startDate: '2024-01', endDate: null },
      { ...base, id: 3, startDate: '2023-01', endDate: '2023-12' },
    ]);
    expect(out.map((e) => e.id)).toEqual([2, 3, 1]);
  });
  it('projets : mis en avant puis année décroissante', () => {
    const base = { tagline: '', description: '', stack: [], repoUrl: null, liveUrl: null, emoji: '' };
    const out = sortProjects([
      { ...base, id: 1, slug: 'a', name: 'A', year: 2022, featured: false },
      { ...base, id: 2, slug: 'b', name: 'B', year: 2024, featured: true },
      { ...base, id: 3, slug: 'c', name: 'C', year: 2025, featured: false },
    ]);
    expect(out.map((p) => p.slug)).toEqual(['b', 'c', 'a']);
  });
});

describe('CV en morceaux Firestore', () => {
  it('découpe et recompose sans perte', () => {
    const b64 = 'x'.repeat(1_500_001);
    const chunks = splitChunks(b64);
    expect(chunks).toHaveLength(3);
    expect(chunks.join('')).toBe(b64);
  });
  it('calcule la taille en octets du base64', () => {
    expect(base64Bytes(Buffer.from('hello').toString('base64'))).toBe(5);
    expect(base64Bytes(Buffer.from('hell').toString('base64'))).toBe(4);
    expect(base64Bytes(Buffer.from('hel').toString('base64'))).toBe(3);
  });
});

describe('readFirebaseConfig', () => {
  it('accepte une config complète et rejette le reste', () => {
    expect(readFirebaseConfig(undefined)).toBeNull();
    expect(readFirebaseConfig('pas du json')).toBeNull();
    expect(readFirebaseConfig('{"apiKey":"k"}')).toBeNull();
    expect(readFirebaseConfig('{"apiKey":"k","authDomain":"a","projectId":"p","appId":"i"}')?.projectId).toBe('p');
  });
});
