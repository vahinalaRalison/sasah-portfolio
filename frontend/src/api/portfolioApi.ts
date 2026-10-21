import type { ContactInput, ContactMessage, ContactReceipt, Experience, ExperienceInput, Profile, ProfileInput, Project, ProjectInput, Skill } from './types';

/**
 * Contrat du front vis-à-vis de ses données. Deux implémentations :
 * - `ApiClient` (client.ts) : les microservices Fastify derrière la passerelle (Docker / Kubernetes) ;
 * - `FirebaseClient` (firebaseClient.ts) : Firestore + Firebase Auth, sans aucun serveur à gérer,
 *   activée quand `VITE_FIREBASE_CONFIG` est renseignée (site statique Firebase Hosting).
 */
export interface PortfolioApi {
  /** Vrai si la connexion admin demande un e-mail en plus du mot de passe (Firebase Auth). */
  readonly needsEmail: boolean;

  getProfile(): Promise<Profile>;
  getProjects(): Promise<Project[]>;
  sendContact(input: ContactInput): Promise<ContactReceipt>;
  /** URL du CV à offrir, ou null s'il n'y en a pas. */
  cvUrl(): Promise<string | null>;

  login(password: string, email?: string): Promise<void>;
  /** Rétablit une session existante (jeton ou session Firebase) ; vrai si connecté. */
  restoreSession(): Promise<boolean>;
  logout(): Promise<void>;

  updateProfile(input: ProfileInput): Promise<Profile>;
  replaceSkills(skills: Skill[]): Promise<Skill[]>;
  createExperience(input: ExperienceInput): Promise<Experience>;
  updateExperience(id: number, input: ExperienceInput): Promise<Experience>;
  deleteExperience(id: number): Promise<void>;
  uploadCv(filename: string, contentBase64: string): Promise<{ filename: string; size: number }>;
  deleteCv(): Promise<void>;
  createProject(input: ProjectInput): Promise<Project>;
  updateProject(slug: string, input: ProjectInput): Promise<Project>;
  deleteProject(slug: string): Promise<void>;
  listMessages(limit?: number): Promise<ContactMessage[]>;
}

/** Compétences : niveau décroissant puis ordre alphabétique (même règle que profile-service). */
export function sortSkills(skills: readonly Skill[]): Skill[] {
  return [...skills].sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));
}

/** Expériences : poste en cours d'abord, puis les plus récentes (même règle que profile-service). */
export function sortExperiences(experiences: readonly Experience[]): Experience[] {
  return [...experiences].sort((a, b) => {
    if (a.endDate === null && b.endDate !== null) return -1;
    if (b.endDate === null && a.endDate !== null) return 1;
    return b.startDate.localeCompare(a.startDate);
  });
}

/** Projets : mis en avant d'abord, puis du plus récent au plus ancien (même règle que projects-service). */
export function sortProjects(projects: readonly Project[]): Project[] {
  return [...projects].sort((a, b) => Number(b.featured) - Number(a.featured) || b.year - a.year || a.name.localeCompare(b.name));
}

/** Taille maximale d'un morceau de CV dans Firestore (un document ne peut dépasser 1 Mio). */
export const CV_CHUNK_SIZE = 700_000;

export function splitChunks(base64: string, size = CV_CHUNK_SIZE): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < base64.length; i += size) chunks.push(base64.slice(i, i + size));
  return chunks;
}

/** Taille en octets d'un contenu base64 (sans décoder). */
export function base64Bytes(base64: string): number {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  storageBucket?: string;
  messagingSenderId?: string;
}

/** Configuration lue de `VITE_FIREBASE_CONFIG` (JSON de la console Firebase) ; null si absente ou incomplète. */
export function readFirebaseConfig(raw: string | undefined): FirebaseConfig | null {
  if (!raw) return null;
  try {
    const cfg = JSON.parse(raw) as Partial<FirebaseConfig>;
    return cfg.apiKey && cfg.projectId && cfg.appId && cfg.authDomain ? (cfg as FirebaseConfig) : null;
  } catch {
    return null;
  }
}
