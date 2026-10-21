import type { Profile, Project } from '../api/types';

/** Contenu du fichier `frontend/src/data/fallback.json` à partir des données en base. */
export function buildFallbackJson(profile: Profile, projects: Project[]): string {
  return JSON.stringify({ profile: { ...profile, hasCv: false }, projects }, null, 2) + '\n';
}
