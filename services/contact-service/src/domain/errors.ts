export class NotFoundError extends Error {
  constructor(entity: string) {
    super(`${entity} introuvable`);
    this.name = 'NotFoundError';
  }
}

export class TooManyRequestsError extends Error {
  constructor() {
    super('Trop de messages envoyés, réessayez dans quelques minutes');
    this.name = 'TooManyRequestsError';
  }
}
