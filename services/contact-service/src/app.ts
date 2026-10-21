import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';
import type { ContactService } from './application/contactService.js';
import { registerContactRoutes } from './http/contactController.js';
import { errorHandler } from './http/errorHandler.js';

export interface AppDependencies {
  contactService: ContactService;
  corsOrigin: string;
  /** Secret des jetons admin ; null = boîte de réception désactivée (503). */
  adminSecret?: string | null;
  logLevel?: string;
  checkReadiness?: () => Promise<void>;
}

export function buildApp(deps: AppDependencies): FastifyInstance {
  const app = Fastify({ logger: { level: deps.logLevel ?? 'info' }, bodyLimit: 16 * 1024 });

  app.register(cors, {
    origin: deps.corsOrigin === '*' ? true : deps.corsOrigin.split(','),
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.setErrorHandler(errorHandler);

  app.get('/api/contact/health', async (_request, reply) => {
    try {
      await deps.checkReadiness?.();
      return { status: 'ok', service: 'contact-service' };
    } catch {
      return reply.status(503).send({ status: 'degraded', service: 'contact-service' });
    }
  });

  registerContactRoutes(app, deps.contactService, deps.adminSecret ?? null);
  return app;
}
