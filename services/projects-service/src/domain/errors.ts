export class NotFoundError extends Error {
  constructor(entity: string) {
    super(`${entity} introuvable`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}
