import { describe, expect, it, vi } from 'vitest';
import { ApiClient, ApiError } from './client';

function mockFetch(status: number, body: unknown): typeof fetch {
  return vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })) as unknown as typeof fetch;
}

describe('ApiClient', () => {
  it('appelle la bonne URL et renvoie le JSON', async () => {
    const fetchImpl = mockFetch(200, [{ id: 1 }]);
    const client = new ApiClient({ baseUrl: 'https://api.test/', fetchImpl });
    expect(await client.getProjects()).toEqual([{ id: 1 }]);
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.test/projects',
      expect.objectContaining({ headers: expect.objectContaining({ Accept: 'application/json' }) }),
    );
  });

  it('transforme une réponse 400 en ApiError avec les erreurs de champ', async () => {
    const client = new ApiClient({ baseUrl: '/api', fetchImpl: mockFetch(400, { title: 'Requête invalide', errors: { email: ['bad'] } }) });
    const err = await client.sendContact({ name: '', email: '', subject: '', body: '' }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
    expect((err as ApiError).fieldErrors.email).toEqual(['bad']);
  });
});
