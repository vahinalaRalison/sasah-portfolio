import clsx from 'clsx';
import { Send } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { ApiError, api } from '../api/client';
import type { ContactInput } from '../api/types';

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string; fields: Record<string, string[]> };

const EMPTY: ContactInput = { name: '', email: '', subject: '', body: '', website: '' };

/** Formulaire de contact réutilisable (page de lecture et carte du jeu). */
export function ContactForm({ compact = false }: { compact?: boolean }) {
  const [form, setForm] = useState<ContactInput>(EMPTY);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const update = (field: keyof ContactInput) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: 'sending' });
    try {
      await api.sendContact(form);
      setForm(EMPTY);
      setStatus({ kind: 'sent' });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Impossible d'envoyer le message pour le moment.";
      setStatus({ kind: 'error', message, fields: err instanceof ApiError ? err.fieldErrors : {} });
    }
  }

  const fieldError = (name: string) => (status.kind === 'error' ? status.fields[name]?.[0] : undefined);

  return (
    <form onSubmit={onSubmit} className={clsx('space-y-3', !compact && 'card space-y-4')} noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nom" error={fieldError('name')}>
          <input className="input" value={form.name} onChange={update('name')} required minLength={2} maxLength={80} autoComplete="name" />
        </Field>
        <Field label="E-mail" error={fieldError('email')}>
          <input className="input" type="email" value={form.email} onChange={update('email')} required maxLength={120} autoComplete="email" />
        </Field>
      </div>
      <Field label="Sujet" error={fieldError('subject')}>
        <input className="input" value={form.subject} onChange={update('subject')} required minLength={3} maxLength={120} />
      </Field>
      <Field label="Message" error={fieldError('body')}>
        <textarea className={clsx('input', compact ? 'min-h-20' : 'min-h-32')} value={form.body} onChange={update('body')} required minLength={10} maxLength={2000} />
      </Field>
      {/* Pot de miel anti-robots : invisible, doit rester vide. */}
      <div className="hidden" aria-hidden>
        <label>
          Site web <input tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} />
        </label>
      </div>

      <button type="submit" className="btn-royal w-full justify-center" disabled={status.kind === 'sending'}>
        <Send className="h-4 w-4" aria-hidden />
        {status.kind === 'sending' ? 'Envoi…' : 'Envoyer'}
      </button>

      <p role="status" aria-live="polite" className="min-h-5 text-center text-sm font-semibold">
        {status.kind === 'sent' && <span className="text-royal-700">Message envoyé, merci ! ✨</span>}
        {status.kind === 'error' && <span className="text-barbie-700">{status.message}</span>}
      </p>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-barbie-800">
      {label}
      <div className="mt-1">{children}</div>
      {error && <span className="mt-1 block text-xs font-medium text-barbie-600">{error}</span>}
    </label>
  );
}
