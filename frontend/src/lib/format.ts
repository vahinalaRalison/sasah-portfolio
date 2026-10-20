import type { SkillCategory } from '../api/types';

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

/** `2024-01` → `janv. 2024` ; `null` → `aujourd'hui`. */
export function formatMonth(value: string | null): string {
  if (!value) return "aujourd'hui";
  const [year, month] = value.split('-');
  const index = Number(month) - 1;
  return `${MONTHS[index] ?? ''} ${year ?? ''}`.trim();
}

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  backend: 'Back-end',
  frontend: 'Front-end',
  devops: 'DevOps & Cloud',
  database: 'Données',
  architecture: 'Architecture',
  soft: 'Qualité',
};

export const CATEGORY_ORDER: SkillCategory[] = ['architecture', 'backend', 'frontend', 'database', 'devops', 'soft'];

export function groupBy<T, K extends string>(items: readonly T[], key: (item: T) => K): Partial<Record<K, T[]>> {
  const out: Partial<Record<K, T[]>> = {};
  for (const item of items) (out[key(item)] ??= []).push(item);
  return out;
}
