/** Message reçu via le formulaire de contact. */
export interface ContactMessage {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly body: string;
  readonly createdAt: string;
}

/** Données d'entrée (DTO) d'un nouveau message, déjà validées. */
export type NewContactMessage = Pick<ContactMessage, 'name' | 'email' | 'subject' | 'body'>;
