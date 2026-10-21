import { createHmac, timingSafeEqual } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Authentification de l'espace admin : jeton signé HMAC-SHA256, sans état côté serveur.
 * Le même `ADMIN_SECRET` est partagé par les services : un jeton émis par profile-service
 * (seul à connaître le mot de passe) est accepté partout. Fichier dupliqué à l'identique
 * dans chaque service (pas de paquet partagé dans ce monorepo).
 */

/** Durée de vie d'un jeton : 12 h. */
export const TOKEN_TTL_SECONDS = 12 * 60 * 60;

interface TokenPayload {
  /** Expiration, en secondes Unix */
  exp: number;
  iat: number;
}

const b64url = (buf: Buffer | string): string => Buffer.from(buf).toString('base64url');

function sign(secret: string, data: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

export function signToken(secret: string, now = Date.now(), ttlSeconds = TOKEN_TTL_SECONDS): { token: string; expiresAt: string } {
  const iat = Math.floor(now / 1000);
  const payload: TokenPayload = { iat, exp: iat + ttlSeconds };
  const encoded = b64url(JSON.stringify(payload));
  return { token: `${encoded}.${sign(secret, encoded)}`, expiresAt: new Date(payload.exp * 1000).toISOString() };
}

export function verifyToken(secret: string, token: string, now = Date.now()): boolean {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return false;
  const expected = sign(secret, encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Partial<TokenPayload>;
    return typeof payload.exp === 'number' && payload.exp * 1000 > now;
  } catch {
    return false;
  }
}

/** Comparaison de secrets à temps constant (évite les attaques par chronométrage). */
export function secretsMatch(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Hook Fastify `preHandler` : exige `Authorization: Bearer <jeton>`.
 * Sans secret configuré, l'admin est désactivé (503) : rien n'est modifiable par accident.
 */
export function requireAdmin(secret: string | null) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!secret) {
      await reply.status(503).send({ title: 'Espace admin désactivé (ADMIN_SECRET absent)', status: 503 });
      return;
    }
    const header = request.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token || !verifyToken(secret, token)) {
      await reply.status(401).send({ title: 'Authentification requise', status: 401 });
    }
  };
}

/** Limiteur de tentatives de connexion en mémoire : `max` échecs par IP sur `windowMs`. */
export class LoginAttempts {
  private readonly failures = new Map<string, { count: number; first: number }>();

  constructor(
    private readonly max = 5,
    private readonly windowMs = 15 * 60 * 1000,
  ) {}

  blocked(ip: string, now = Date.now()): boolean {
    const entry = this.failures.get(ip);
    if (!entry) return false;
    if (now - entry.first > this.windowMs) {
      this.failures.delete(ip);
      return false;
    }
    return entry.count >= this.max;
  }

  fail(ip: string, now = Date.now()): void {
    const entry = this.failures.get(ip);
    if (!entry || now - entry.first > this.windowMs) this.failures.set(ip, { count: 1, first: now });
    else entry.count += 1;
  }

  succeed(ip: string): void {
    this.failures.delete(ip);
  }
}
