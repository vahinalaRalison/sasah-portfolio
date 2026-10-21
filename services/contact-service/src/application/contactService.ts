import { TooManyRequestsError } from '../domain/errors.js';
import type { ContactMessage, NewContactMessage } from '../domain/message.js';
import type { ContactRepository } from '../domain/ports.js';

export interface ContactPolicy {
  /** Nombre maximal de messages par adresse sur la fenêtre glissante. */
  readonly maxPerWindow: number;
  readonly windowMinutes: number;
}

export const DEFAULT_POLICY: ContactPolicy = { maxPerWindow: 3, windowMinutes: 15 };

/** Observateur optionnel (notification e-mail, webhook…) : pattern Observer, découplé de l'enregistrement. */
export type MessageListener = (message: ContactMessage) => Promise<void> | void;

export class ContactService {
  private readonly listeners: MessageListener[] = [];

  constructor(
    private readonly repository: ContactRepository,
    private readonly policy: ContactPolicy = DEFAULT_POLICY,
  ) {}

  onMessage(listener: MessageListener): this {
    this.listeners.push(listener);
    return this;
  }

  /** Administration : boîte de réception. */
  async inbox(limit = 100): Promise<ContactMessage[]> {
    return this.repository.findLatest(Math.max(1, Math.min(500, limit)));
  }

  async send(input: NewContactMessage): Promise<ContactMessage> {
    const normalized = normalizeMessage(input);
    const recent = await this.repository.countRecentByEmail(normalized.email, this.policy.windowMinutes);
    if (recent >= this.policy.maxPerWindow) throw new TooManyRequestsError();

    const saved = await this.repository.save(normalized);
    await Promise.allSettled(this.listeners.map((l) => l(saved)));
    return saved;
  }
}

export function normalizeMessage(input: NewContactMessage): NewContactMessage {
  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    subject: input.subject.trim(),
    body: input.body.trim(),
  };
}
