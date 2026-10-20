import type { ContactMessage, NewContactMessage } from './message.js';

export interface ContactRepository {
  save(message: NewContactMessage): Promise<ContactMessage>;
  countRecentByEmail(email: string, sinceMinutes: number): Promise<number>;
}
