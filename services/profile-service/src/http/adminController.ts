import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { ProfileService } from '../application/profileService.js';
import { LoginAttempts, requireAdmin, secretsMatch, signToken } from './adminAuth.js';

export interface AdminOptions {
  /** Mot de passe de connexion ; null = admin désactivé */
  password: string | null;
  /** Clé de signature des jetons ; null = admin désactivé */
  secret: string | null;
}

const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'format AAAA-MM attendu');

export const profileBodySchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  nickname: z.string().trim().min(1).max(40),
  title: z.string().trim().min(2).max(120),
  tagline: z.string().trim().max(200),
  bio: z.string().trim().max(3000),
  location: z.string().trim().max(80),
  email: z.string().trim().email().max(120),
  links: z.array(z.object({ label: z.string().trim().min(1).max(40), url: z.string().trim().url().max(300) })).max(10),
});

export const skillsBodySchema = z
  .array(
    z.object({
      name: z.string().trim().min(1).max(80),
      category: z.enum(['backend', 'frontend', 'devops', 'database', 'architecture', 'soft']),
      level: z.number().int().min(1).max(5),
    }),
  )
  .max(100);

export const experienceBodySchema = z
  .object({
    company: z.string().trim().min(1).max(120),
    role: z.string().trim().min(1).max(120),
    startDate: month,
    endDate: month.nullable(),
    summary: z.string().trim().max(2000),
    highlights: z.array(z.string().trim().min(1).max(200)).max(12),
  })
  .refine((e) => e.endDate === null || e.endDate >= e.startDate, { message: 'la fin précède le début', path: ['endDate'] });

/** CV : PDF encodé en base64 (pas de multipart, donc aucune dépendance de plus), 5 Mo max. */
export const CV_MAX_BYTES = 5 * 1024 * 1024;
export const cvBodySchema = z.object({
  filename: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/\.pdf$/i, 'le fichier doit être un PDF'),
  contentBase64: z.string().min(1),
});

const idParams = z.object({ id: z.coerce.number().int().positive() });
const loginBody = z.object({ password: z.string().min(1).max(200) });

/** Routes d'administration : connexion, édition du profil, des compétences, des expériences et du CV. */
export function registerAdminRoutes(app: FastifyInstance, service: ProfileService, options: AdminOptions): void {
  const attempts = new LoginAttempts();
  const admin = requireAdmin(options.secret);

  app.post('/api/profile/auth/login', async (request, reply) => {
    if (!options.password || !options.secret) {
      return reply.status(503).send({ title: 'Espace admin désactivé (ADMIN_PASSWORD absent)', status: 503 });
    }
    if (attempts.blocked(request.ip)) {
      return reply.status(429).send({ title: 'Trop de tentatives, réessayez dans quelques minutes', status: 429 });
    }
    const { password } = loginBody.parse(request.body);
    if (!secretsMatch(password, options.password)) {
      attempts.fail(request.ip);
      return reply.status(401).send({ title: 'Mot de passe incorrect', status: 401 });
    }
    attempts.succeed(request.ip);
    return signToken(options.secret);
  });

  app.get('/api/profile/auth/me', { preHandler: admin }, async () => ({ role: 'admin' }));

  app.put('/api/profile', { preHandler: admin }, async (request) => service.updateProfile(profileBodySchema.parse(request.body)));

  app.put('/api/profile/skills', { preHandler: admin }, async (request) => service.replaceSkills(skillsBodySchema.parse(request.body)));

  app.post('/api/profile/experiences', { preHandler: admin }, async (request, reply) => {
    const created = await service.addExperience(experienceBodySchema.parse(request.body));
    return reply.status(201).send(created);
  });

  app.put('/api/profile/experiences/:id', { preHandler: admin }, async (request) =>
    service.updateExperience(idParams.parse(request.params).id, experienceBodySchema.parse(request.body)),
  );

  app.delete('/api/profile/experiences/:id', { preHandler: admin }, async (request, reply) => {
    await service.removeExperience(idParams.parse(request.params).id);
    return reply.status(204).send();
  });

  // Public : téléchargement du CV (le cadeau de fin de voyage).
  app.get('/api/profile/cv', async (_request, reply) => {
    const cv = await service.getCv();
    return reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `inline; filename="${cv.filename.replace(/[^\w.-]/g, '_')}"`)
      .header('Content-Length', String(cv.size))
      .header('Cache-Control', 'no-cache')
      .send(cv.content);
  });

  app.put('/api/profile/cv', { preHandler: admin, bodyLimit: Math.ceil(CV_MAX_BYTES * 1.4) }, async (request) => {
    const { filename, contentBase64 } = cvBodySchema.parse(request.body);
    const content = Buffer.from(contentBase64, 'base64');
    if (content.byteLength > CV_MAX_BYTES) throw Object.assign(new Error('CV trop volumineux (5 Mo max)'), { statusCode: 413 });
    if (content.subarray(0, 5).toString('latin1') !== '%PDF-') throw Object.assign(new Error('Le fichier n’est pas un PDF'), { statusCode: 400 });
    await service.saveCv(filename, content);
    return { filename, size: content.byteLength };
  });

  app.delete('/api/profile/cv', { preHandler: admin }, async (_request, reply) => {
    await service.removeCv();
    return reply.status(204).send();
  });
}
