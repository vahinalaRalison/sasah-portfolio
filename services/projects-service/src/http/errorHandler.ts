import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { ConflictError, NotFoundError } from '../domain/errors.js';

/** Traduction centralisée des erreurs métier en réponses HTTP (RFC 7807 simplifié). */
export function errorHandler(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply): void {
  if (error instanceof ZodError) {
    reply.status(400).send({ title: 'Requête invalide', status: 400, errors: error.flatten().fieldErrors });
    return;
  }
  if (error instanceof NotFoundError) {
    reply.status(404).send({ title: error.message, status: 404 });
    return;
  }
  if (error instanceof ConflictError) {
    reply.status(409).send({ title: error.message, status: 409, errors: { slug: [error.message] } });
    return;
  }
  const statusCode = 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500;
  if (statusCode >= 500) request.log.error(error);
  reply.status(statusCode).send({ title: statusCode >= 500 ? 'Erreur interne' : error.message, status: statusCode });
}
