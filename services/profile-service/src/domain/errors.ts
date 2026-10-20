export class NotFoundError extends Error {
  constructor(entity: string) {
    super(`${entity} introuvable`);
    this.name = 'NotFoundError';
  }
}
