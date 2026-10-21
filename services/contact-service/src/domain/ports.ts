import type { ContactMessage, NewContactMessage } from './message.js';

export interface ContactRepository {
  save(message: NewContactMessage): Promise<ContactMessage>;
  countRecentByEmail(email: string, sinceMinutes: number): Promise<number>;
  /** Derniers messages reçus, du plus récent au plus ancien. */
  findLatest(limit: number): Promise<ContactMessage[]>;
}
