import { z } from 'zod';

/**
 * Configuration validée au démarrage (fail-fast) : une variable manquante
 * ou invalide arrête le service immédiatement avec un message clair.
 */
const schema = z.object({
  PORT: z.coerce.number().int().positive().default(3003),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().default('*'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  /** Clé de vérification des jetons admin (émis par profile-service) ; absente = admin désactivé. */
  ADMIN_SECRET: z.string().min(8).optional(),
});

export type Config = z.infer<typeof schema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  // Une variable vide (ex. `ADMIN_SECRET=` dans .env) vaut « absente ».
  const cleaned = Object.fromEntries(Object.entries(env).filter(([, v]) => v !== ''));
  const parsed = schema.safeParse(cleaned);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`Configuration invalide — ${issues}`);
  }
  return parsed.data;
}
