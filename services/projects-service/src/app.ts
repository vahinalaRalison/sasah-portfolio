import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';
import type { ProjectService } from './application/projectService.js';
import { errorHandler } from './http/errorHandler.js';
import { registerProjectRoutes } from './http/projectController.js';

export interface AppDependencies {
  projectService: ProjectService;
  corsOrigin: string;
  /** Secret des jetons admin ; null = routes d'édition désactivées (503). */
  adminSecret?: string | null;
  logLevel?: string;
  checkReadiness?: () => Promise<void>;
}

export function buildApp(deps: AppDependencies): FastifyInstance {
  const app = Fastify({ logger: { level: deps.logLevel ?? 'info' } });

  app.register(cors, {
    origin: deps.corsOrigin === '*' ? true : deps.corsOrigin.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.setErrorHandler(errorHandler);

  app.get('/api/projects/health', async (_request, reply) => {
    try {
      await deps.checkReadiness?.();
      return { status: 'ok', service: 'projects-service' };
    } catch {
      return reply.status(503).send({ status: 'degraded', service: 'projects-service' });
    }
  });

  registerProjectRoutes(app, deps.projectService, deps.adminSecret ?? null);
  return app;
}
