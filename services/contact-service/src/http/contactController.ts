import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { ContactService } from '../application/contactService.js';
import { requireAdmin } from './adminAuth.js';

/** DTO d'entrée validé : le champ `website` est un pot de miel anti-robots (doit rester vide). */
export const contactBodySchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  subject: z.string().trim().min(3).max(120),
  body: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional(),
});

const inboxQuerySchema = z.object({ limit: z.coerce.number().int().min(1).max(500).default(100) });

export function registerContactRoutes(app: FastifyInstance, service: ContactService, adminSecret: string | null = null): void {
  app.post('/api/contact', async (request, reply) => {
    const { name, email, subject, body } = contactBodySchema.parse(request.body);
    const saved = await service.send({ name, email, subject, body });
    return reply.status(201).send({ id: saved.id, createdAt: saved.createdAt });
  });

  // Administration : lecture des messages reçus (jeton émis par profile-service).
  app.get('/api/contact/messages', { preHandler: requireAdmin(adminSecret) }, async (request) =>
    service.inbox(inboxQuerySchema.parse(request.query).limit),
  );
}
