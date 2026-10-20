import type { FastifyInstance } from 'fastify';
import type { ProfileService } from '../application/profileService.js';

/** Contrôleur : mappe les routes HTTP sur les cas d'usage, sans logique métier. */
export function registerProfileRoutes(app: FastifyInstance, service: ProfileService): void {
  app.get('/api/profile', async () => service.getProfile());
  app.get('/api/profile/skills', async () => service.getSkillsByCategory());
  app.get('/api/profile/experiences', async () => service.getExperiences());
}
