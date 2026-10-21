import { Inbox, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { ContactMessage } from '../api/types';
import { IDLE, type Status, toErrorStatus } from './form';
import { Panel, StatusLine } from './ui';

const formatDate = (iso: string) => new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

/** Les messages reçus au bal (formulaire de contact), du plus récent au plus ancien. */
export function MessagesPanel() {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [status, setStatus] = useState<Status>(IDLE);

  const load = useCallback(async () => {
    setStatus({ kind: 'saving' });
    try {
      setMessages(await api.listMessages());
      setStatus(IDLE);
    } catch (err) {
      setStatus(toErrorStatus(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Panel title="💌 Messages reçus" intro="Les invitations envoyées depuis le bal.">
      <div className="mb-4 flex items-center gap-3">
        <button type="button" className="btn-ghost px-4 py-1.5 text-sm" onClick={load} disabled={status.kind === 'saving'}>
          <RefreshCw className="h-4 w-4" aria-hidden /> Actualiser
        </button>
        <StatusLine status={status} />
      </div>
      {messages && messages.length === 0 && (
        <p className="inline-flex items-center gap-2 text-sm text-barbie-800/70">
          <Inbox className="h-4 w-4" aria-hidden /> Aucun message pour l'instant.
        </p>
      )}
      <ul className="space-y-3">
        {messages?.map((m) => (
          <li key={m.id} className="rounded-2xl border border-barbie-100 bg-white/60 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-lg font-bold text-barbie-900">{m.subject}</p>
              <time className="text-xs text-barbie-800/60" dateTime={m.createdAt}>
                {formatDate(m.createdAt)}
              </time>
            </div>
            <p className="text-sm text-barbie-700">
              {m.name} ·{' '}
              <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`} className="font-semibold hover:underline">
                {m.email}
              </a>
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-barbie-900/85">{m.body}</p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
