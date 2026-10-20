import type pg from 'pg';
import type { ContactMessage, NewContactMessage } from '../domain/message.js';
import type { ContactRepository } from '../domain/ports.js';

interface MessageRow {
  id: number;
  name: string;
  email: string;
  subject: string;
  body: string;
  created_at: Date;
}

export class PgContactRepository implements ContactRepository {
  constructor(private readonly pool: pg.Pool) {}

  async save(message: NewContactMessage): Promise<ContactMessage> {
    const { rows } = await this.pool.query<MessageRow>(
      `INSERT INTO messages (name, email, subject, body)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, subject, body, created_at`,
      [message.name, message.email, message.subject, message.body],
    );
    const row = rows[0];
    if (!row) throw new Error('Insertion du message échouée');
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      subject: row.subject,
      body: row.body,
      createdAt: row.created_at.toISOString(),
    };
  }

  async countRecentByEmail(email: string, sinceMinutes: number): Promise<number> {
    const { rows } = await this.pool.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM messages
       WHERE email = $1 AND created_at > now() - ($2 || ' minutes')::interval`,
      [email, String(sinceMinutes)],
    );
    return Number(rows[0]?.count ?? 0);
  }
}
