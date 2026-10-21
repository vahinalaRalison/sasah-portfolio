import clsx from 'clsx';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Status } from './form';

/** Briques de formulaire de l'admin, dans le style du site. */

export function Field({ label, hint, error, children, className }: { label: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <label className={clsx('block text-sm', className)}>
      <span className="mb-1 block font-semibold text-barbie-900">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-barbie-800/60">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}

export function StatusLine({ status }: { status: Status }) {
  if (status.kind === 'saving')
    return (
      <p className="inline-flex items-center gap-2 text-sm text-barbie-700">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Enregistrement…
      </p>
    );
  if (status.kind === 'saved')
    return (
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700" role="status">
        <CheckCircle2 className="h-4 w-4" aria-hidden /> {status.message ?? 'Enregistré ✨'}
      </p>
    );
  if (status.kind === 'error')
    return (
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-red-600" role="alert">
        <AlertTriangle className="h-4 w-4" aria-hidden /> {status.message}
      </p>
    );
  return null;
}

export function SaveBar({ status, label = 'Enregistrer', children }: { status: Status; label?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-2">
      <button type="submit" className="btn-royal px-5 py-2 text-sm" disabled={status.kind === 'saving'}>
        {label}
      </button>
      {children}
      <StatusLine status={status} />
    </div>
  );
}

export function Panel({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <section className="card">
      <h2 className="font-display text-2xl font-bold text-barbie-900">{title}</h2>
      {intro && <p className="mt-1 text-sm text-barbie-800/70">{intro}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
