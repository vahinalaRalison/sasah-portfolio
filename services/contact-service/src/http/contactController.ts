import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { ContactService } from '../application/contactService.js';

/** DTO d'entrée validé : le champ `website` est un pot de miel anti-robots (doit rester vide). */
export const contactBodySchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  subject: z.string().trim().min(3).max(120),
  body: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional(),
});

export function registerContactRoutes(app: FastifyInstance, service: ContactService): void {
  app.post('/api/contact', async (request, reply) => {
    const { name, email, subject, body } = contactBodySchema.parse(request.body);
    const saved = await service.send({ name, email, subject, body });
    return reply.status(201).send({ id: saved.id, createdAt: saved.createdAt });
  });
}
