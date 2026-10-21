import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';
import type { ProfileService } from './application/profileService.js';
import { registerAdminRoutes, type AdminOptions } from './http/adminController.js';
import { errorHandler } from './http/errorHandler.js';
import { registerProfileRoutes } from './http/profileController.js';

export interface AppDependencies {
  profileService: ProfileService;
  corsOrigin: string;
  /** Espace admin ; sans mot de passe ni secret, les routes d'édition répondent 503. */
  admin?: AdminOptions;
  logLevel?: string;
  /** Vérification de disponibilité des dépendances (base) pour /health. */
  checkReadiness?: () => Promise<void>;
}

/** Factory de l'application : reçoit ses dépendances, ne les construit jamais. */
export function buildApp(deps: AppDependencies): FastifyInstance {
  const app = Fastify({ logger: { level: deps.logLevel ?? 'info' } });

  app.register(cors, {
    origin: deps.corsOrigin === '*' ? true : deps.corsOrigin.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.setErrorHandler(errorHandler);

  app.get('/api/profile/health', async (_request, reply) => {
    try {
      await deps.checkReadiness?.();
      return { status: 'ok', service: 'profile-service' };
    } catch {
      return reply.status(503).send({ status: 'degraded', service: 'profile-service' });
    }
  });

  registerProfileRoutes(app, deps.profileService);
  registerAdminRoutes(app, deps.profileService, deps.admin ?? { password: null, secret: null });
  return app;
}
