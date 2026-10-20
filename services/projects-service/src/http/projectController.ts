import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { ProjectService } from '../application/projectService.js';

const listQuerySchema = z.object({
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  tech: z.string().min(1).max(50).optional(),
});

const slugParamsSchema = z.object({ slug: z.string().regex(/^[a-z0-9-]{1,80}$/) });

export function registerProjectRoutes(app: FastifyInstance, service: ProjectService): void {
  app.get('/api/projects', async (request) => service.list(listQuerySchema.parse(request.query)));
  app.get('/api/projects/technologies', async () => service.listTechnologies());
  app.get('/api/projects/:slug', async (request) => service.getBySlug(slugParamsSchema.parse(request.params).slug));
}
