import { describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
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
