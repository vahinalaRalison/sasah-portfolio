import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { ProjectService } from '../application/projectService.js';
import { requireAdmin } from './adminAuth.js';

const listQuerySchema = z.object({
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  tech: z.string().min(1).max(50).optional(),
});

const slug = z.string().regex(/^[a-z0-9-]{1,80}$/, 'minuscules, chiffres et tirets uniquement');
const slugParamsSchema = z.object({ slug });

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .transform((v) => (v === '' ? null : v))
  .pipe(z.string().url().nullable());

export const projectBodySchema = z.object({
  slug,
  name: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(160),
  description: z.string().trim().max(2000),
  stack: z.array(z.string().trim().min(1).max(40)).max(20),
  repoUrl: optionalUrl.nullable().default(null),
  liveUrl: optionalUrl.nullable().default(null),
  year: z.number().int().min(1990).max(2100),
  featured: z.boolean().default(false),
  emoji: z.string().trim().min(1).max(8).default('✨'),
});

export function registerProjectRoutes(app: FastifyInstance, service: ProjectService, adminSecret: string | null = null): void {
  app.get('/api/projects', async (request) => service.list(listQuerySchema.parse(request.query)));
  app.get('/api/projects/technologies', async () => service.listTechnologies());
  app.get('/api/projects/:slug', async (request) => service.getBySlug(slugParamsSchema.parse(request.params).slug));

  // Administration : jeton émis par profile-service, vérifié avec le même secret.
  const admin = requireAdmin(adminSecret);
  app.post('/api/projects', { preHandler: admin }, async (request, reply) => {
    const created = await service.create(projectBodySchema.parse(request.body));
    return reply.status(201).send(created);
  });
  app.put('/api/projects/:slug', { preHandler: admin }, async (request) =>
    service.update(slugParamsSchema.parse(request.params).slug, projectBodySchema.parse(request.body)),
  );
  app.delete('/api/projects/:slug', { preHandler: admin }, async (request, reply) => {
    await service.remove(slugParamsSchema.parse(request.params).slug);
    return reply.status(204).send();
  });
}
