import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { ProfileService, dedupeSkills } from '../src/application/profileService.js';
import type { ProfileRepository } from '../src/domain/ports.js';
import type { CvFile, Experience, ProfileBase, Skill } from '../src/domain/profile.js';
import { LoginAttempts, signToken, verifyToken } from '../src/http/adminAuth.js';

const SECRET = 'une-cle-de-test-suffisamment-longue';
const PASSWORD = 'mot-de-passe-test';

/** Dépôt en mémoire : exerce les cas d'usage sans base. */
function memoryRepository() {
  let profile: ProfileBase = { fullName: 'Sarah', nickname: 'Sasah', title: 'Dev', tagline: '', bio: '', location: '', email: 'sarah@example.com', links: [] };
  let skills: Skill[] = [{ name: 'React', category: 'frontend', level: 5 }];
  let experiences: Experience[] = [{ id: 1, company: 'A', role: 'Dev', startDate: '2022-01', endDate: null, summary: '', highlights: [] }];
  let cv: CvFile | null = null;
  let nextId = 2;
  const repo: ProfileRepository = {
    findProfile: async () => profile,
    findSkills: async () => skills,
    findExperiences: async () => experiences,
    hasCv: async () => cv !== null,
    saveProfile: async (p) => void (profile = p),
    replaceSkills: async (s) => void (skills = [...s]),
    createExperience: async (e) => {
      const created = { id: nextId++, ...e };
      experiences.push(created);
      return created;
    },
    updateExperience: async (id, e) => {
      const i = experiences.findIndex((x) => x.id === id);
      if (i < 0) return null;
      experiences[i] = { id, ...e };
      return experiences[i]!;
    },
    deleteExperience: async (id) => {
      const before = experiences.length;
      experiences = experiences.filter((x) => x.id !== id);
      return experiences.length < before;
    },
    findCv: async () => cv,
    saveCv: async (f) => void (cv = { ...f, updatedAt: new Date().toISOString() }),
    deleteCv: async () => void (cv = null),
  };
  return repo;
}

function app(admin = { password: PASSWORD, secret: SECRET }) {
  return buildApp({ profileService: new ProfileService(memoryRepository()), corsOrigin: '*', logLevel: 'silent', admin });
}

const auth = () => ({ authorization: `Bearer ${signToken(SECRET).token}` });

describe('jetons admin', () => {
  it('signe et vérifie un jeton', () => {
    const { token } = signToken(SECRET);
    expect(verifyToken(SECRET, token)).toBe(true);
    expect(verifyToken('autre-secret-tout-aussi-long', token)).toBe(false);
    expect(verifyToken(SECRET, token.slice(0, -2) + 'xx')).toBe(false);
  });

  it('refuse un jeton expiré', () => {
    const { token } = signToken(SECRET, Date.now() - 20 * 3600 * 1000);
    expect(verifyToken(SECRET, token)).toBe(false);
  });

  it('bloque après cinq échecs puis oublie passé la fenêtre', () => {
    const attempts = new LoginAttempts(5, 1000);
    for (let i = 0; i < 5; i++) attempts.fail('ip', 0);
    expect(attempts.blocked('ip', 10)).toBe(true);
    expect(attempts.blocked('ip', 2000)).toBe(false);
  });
});

describe('dedupeSkills', () => {
  it('garde la dernière occurrence d’un même nom', () => {
    const out = dedupeSkills([
      { name: 'React', category: 'frontend', level: 3 },
      { name: ' react ', category: 'frontend', level: 5 },
    ]);
    expect(out).toEqual([{ name: 'react', category: 'frontend', level: 5 }]);
  });
});

describe('HTTP admin', () => {
  it('connexion : 401 sur mauvais mot de passe, jeton sur le bon', async () => {
    const a = app();
    const bad = await a.inject({ method: 'POST', url: '/api/profile/auth/login', payload: { password: 'nope' } });
    expect(bad.statusCode).toBe(401);
    const ok = await a.inject({ method: 'POST', url: '/api/profile/auth/login', payload: { password: PASSWORD } });
    expect(ok.statusCode).toBe(200);
    expect(verifyToken(SECRET, ok.json().token)).toBe(true);
    await a.close();
  });

  it('503 quand l’admin n’est pas configuré', async () => {
    const a = app({ password: null as unknown as string, secret: null as unknown as string });
    const login = await a.inject({ method: 'POST', url: '/api/profile/auth/login', payload: { password: PASSWORD } });
    expect(login.statusCode).toBe(503);
    const put = await a.inject({ method: 'PUT', url: '/api/profile/skills', payload: [] });
    expect(put.statusCode).toBe(503);
    await a.close();
  });

  it('refuse les écritures sans jeton', async () => {
    const a = app();
    const res = await a.inject({ method: 'PUT', url: '/api/profile/skills', payload: [] });
    expect(res.statusCode).toBe(401);
    await a.close();
  });

  it('met à jour le profil et valide les champs', async () => {
    const a = app();
    const body = { fullName: 'Sarah Mendrika', nickname: 'Sasah', title: 'Dev senior', tagline: '', bio: '', location: 'Paris', email: 'sarah@example.com', links: [] };
    const ok = await a.inject({ method: 'PUT', url: '/api/profile', headers: auth(), payload: body });
    expect(ok.statusCode).toBe(200);
    expect(ok.json().location).toBe('Paris');
    const bad = await a.inject({ method: 'PUT', url: '/api/profile', headers: auth(), payload: { ...body, email: 'pas-un-mail' } });
    expect(bad.statusCode).toBe(400);
    expect(bad.json().errors.email).toBeDefined();
    await a.close();
  });

  it('remplace les compétences', async () => {
    const a = app();
    const res = await a.inject({
      method: 'PUT',
      url: '/api/profile/skills',
      headers: auth(),
      payload: [
        { name: 'Laravel', category: 'backend', level: 5 },
        { name: 'Docker', category: 'devops', level: 4 },
      ],
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().map((s: Skill) => s.name)).toEqual(['Laravel', 'Docker']);
    await a.close();
  });

  it('crée, modifie et supprime une expérience', async () => {
    const a = app();
    const exp = { company: 'B', role: 'Lead', startDate: '2024-01', endDate: null, summary: 'x', highlights: ['a'] };
    const created = await a.inject({ method: 'POST', url: '/api/profile/experiences', headers: auth(), payload: exp });
    expect(created.statusCode).toBe(201);
    const id = created.json().id;
    const updated = await a.inject({ method: 'PUT', url: `/api/profile/experiences/${id}`, headers: auth(), payload: { ...exp, role: 'CTO' } });
    expect(updated.json().role).toBe('CTO');
    const wrong = await a.inject({ method: 'PUT', url: `/api/profile/experiences/${id}`, headers: auth(), payload: { ...exp, endDate: '2023-01' } });
    expect(wrong.statusCode).toBe(400);
    const deleted = await a.inject({ method: 'DELETE', url: `/api/profile/experiences/${id}`, headers: auth() });
    expect(deleted.statusCode).toBe(204);
    const missing = await a.inject({ method: 'DELETE', url: `/api/profile/experiences/${id}`, headers: auth() });
    expect(missing.statusCode).toBe(404);
    await a.close();
  });

  it('enregistre un CV PDF, le sert, puis le supprime', async () => {
    const a = app();
    const none = await a.inject({ method: 'GET', url: '/api/profile/cv' });
    expect(none.statusCode).toBe(404);
    const pdf = Buffer.from('%PDF-1.4 contenu de test');
    const notPdf = await a.inject({ method: 'PUT', url: '/api/profile/cv', headers: auth(), payload: { filename: 'cv.pdf', contentBase64: Buffer.from('hello').toString('base64') } });
    expect(notPdf.statusCode).toBe(400);
    const up = await a.inject({ method: 'PUT', url: '/api/profile/cv', headers: auth(), payload: { filename: 'cv sarah.pdf', contentBase64: pdf.toString('base64') } });
    expect(up.statusCode).toBe(200);
    const profile = await a.inject({ method: 'GET', url: '/api/profile' });
    expect(profile.json().hasCv).toBe(true);
    const get = await a.inject({ method: 'GET', url: '/api/profile/cv' });
    expect(get.statusCode).toBe(200);
    expect(get.headers['content-type']).toBe('application/pdf');
    expect(get.rawPayload.equals(pdf)).toBe(true);
    const del = await a.inject({ method: 'DELETE', url: '/api/profile/cv', headers: auth() });
    expect(del.statusCode).toBe(204);
    await a.close();
  });
});
