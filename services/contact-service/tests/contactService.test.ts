import { describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { signToken } from '../src/http/adminAuth.js';
import { ContactService, normalizeMessage } from '../src/application/contactService.js';
import type { ContactMessage, NewContactMessage } from '../src/domain/message.js';
import type { ContactRepository } from '../src/domain/ports.js';

function inMemoryRepository(): ContactRepository & { messages: ContactMessage[] } {
  const messages: ContactMessage[] = [];
  return {
    messages,
    save: async (m: NewContactMessage) => {
      const saved = { ...m, id: messages.length + 1, createdAt: new Date().toISOString() };
      messages.push(saved);
      return saved;
    },
    countRecentByEmail: async (email) => messages.filter((m) => m.email === email).length,
    findLatest: async (limit) => [...messages].reverse().slice(0, limit),
  };
}

const valid = { name: 'Prince Charmant', email: 'Prince@Castle.io ', subject: 'Invitation au bal', body: 'Voulez-vous danser avec moi ce soir ?' };

describe('normalizeMessage', () => {
  it('nettoie les espaces et met l’e-mail en minuscules', () => {
    expect(normalizeMessage(valid).email).toBe('prince@castle.io');
  });
});

describe('ContactService', () => {
  it('enregistre le message et notifie les observateurs', async () => {
    const listener = vi.fn();
    const service = new ContactService(inMemoryRepository()).onMessage(listener);
    const saved = await service.send(valid);
    expect(saved.id).toBe(1);
    expect(listener).toHaveBeenCalledWith(saved);
  });

  it('refuse au-delà du quota par adresse', async () => {
    const service = new ContactService(inMemoryRepository(), { maxPerWindow: 2, windowMinutes: 15 });
    await service.send(valid);
    await service.send(valid);
    await expect(service.send(valid)).rejects.toThrow(/Trop de messages/);
  });
});

describe('HTTP', () => {
  const app = buildApp({ contactService: new ContactService(inMemoryRepository()), corsOrigin: '*', logLevel: 'silent' });

  it('POST /api/contact renvoie 201', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/contact', payload: valid });
    expect(res.statusCode).toBe(201);
    expect(res.json().id).toBe(1);
  });

  it('POST /api/contact renvoie 400 sur e-mail invalide', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/contact', payload: { ...valid, email: 'pas-un-email' } });
    expect(res.statusCode).toBe(400);
    expect(res.json().errors.email).toBeDefined();
  });

  it('POST /api/contact renvoie 400 si le pot de miel est rempli', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/contact', payload: { ...valid, website: 'spam' } });
    expect(res.statusCode).toBe(400);
  });
});

describe('HTTP admin : boîte de réception', () => {
  const SECRET = 'une-cle-de-test-suffisamment-longue';

  it('exige un jeton puis liste les messages du plus récent au plus ancien', async () => {
    const repository = inMemoryRepository();
    const service = new ContactService(repository);
    const app = buildApp({ contactService: service, corsOrigin: '*', logLevel: 'silent', adminSecret: SECRET });
    await service.send(valid);
    await service.send({ ...valid, email: 'autre@castle.io', subject: 'Deuxième' });

    expect((await app.inject({ method: 'GET', url: '/api/contact/messages' })).statusCode).toBe(401);
    const res = await app.inject({ method: 'GET', url: '/api/contact/messages?limit=1', headers: { authorization: `Bearer ${signToken(SECRET).token}` } });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveLength(1);
    expect(res.json()[0].subject).toBe('Deuxième');
    await app.close();
  });

  it('répond 503 sans secret configuré', async () => {
    const app = buildApp({ contactService: new ContactService(inMemoryRepository()), corsOrigin: '*', logLevel: 'silent' });
    expect((await app.inject({ method: 'GET', url: '/api/contact/messages' })).statusCode).toBe(503);
    await app.close();
  });
});
