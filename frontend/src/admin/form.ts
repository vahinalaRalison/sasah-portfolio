import { ApiError } from '../api/client';

/** État d'un formulaire admin et helpers de saisie (séparés des composants pour le rechargement à chaud). */

export type Status = { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved'; message?: string } | { kind: 'error'; message: string; fields: Record<string, string[]> };

export const IDLE: Status = { kind: 'idle' };

/** Transforme une erreur quelconque en statut affichable, avec les erreurs par champ de l'API. */
export function toErrorStatus(err: unknown): Status {
  if (err instanceof ApiError) return { kind: 'error', message: err.message, fields: err.fieldErrors };
  return { kind: 'error', message: err instanceof Error ? err.message : 'Erreur inattendue', fields: {} };
}

export function fieldError(status: Status, name: string): string | undefined {
  return status.kind === 'error' ? status.fields[name]?.[0] : undefined;
}

/** `a\nb` ↔ ['a', 'b'] pour les listes saisies une entrée par ligne. */
export const linesToList = (text: string): string[] =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
export const listToLines = (list: readonly string[]): string => list.join('\n');

/** `a, b` ↔ ['a', 'b'] pour les listes courtes séparées par des virgules. */
export const commaToList = (text: string): string[] =>
  text
    .split(',')
    .map((l) => l.trim())
    .filter(Boolean);
export const listToComma = (list: readonly string[]): string => list.join(', ');
