import { ApiError } from './errors';
import { readFirebaseConfig, type FirebaseConfig, type PortfolioApi } from './portfolioApi';
import type {
  AdminSession,
  ContactInput,
  ContactMessage,
  ContactReceipt,
  Experience,
  ExperienceInput,
  Profile,
  ProfileInput,
  Project,
  ProjectInput,
  Skill,
} from './types';

export { ApiError };

/**
 * Adapter HTTP : seul module qui connaît `fetch` et la forme des erreurs API.
 * `baseUrl` est injectée (testable), `fetchImpl` aussi.
 */

export interface ApiClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

const TOKEN_KEY = 'sasah-admin-token';

export class ApiClient implements PortfolioApi {
  readonly needsEmail = false;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;
  /** Jeton admin envoyé en `Authorization: Bearer` quand il est défini. */
  private token: string | null = null;

  // `fetch` natif lié à `globalThis` : appelé comme méthode il lèverait « Illegal invocation ».
  constructor({ baseUrl, fetchImpl = globalThis.fetch.bind(globalThis), timeoutMs = 8000 }: ApiClientOptions) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  setToken(token: string | null): void {
    this.token = token;
  }

  private storeToken(token: string | null): void {
    this.token = token;
    try {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      else sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* stockage indisponible : la session ne survivra pas à un rechargement */
    }
  }

  /* ---- Public ---- */

  getProfile(): Promise<Profile> {
    return this.request<Profile>('/profile');
  }

  getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  sendContact(input: ContactInput): Promise<ContactReceipt> {
    return this.request<ContactReceipt>('/contact', { method: 'POST', body: JSON.stringify(input) });
  }

  /** URL publique du CV (servi par profile-service), si le profil en déclare un. */
  async cvUrl(): Promise<string | null> {
    const profile = await this.getProfile().catch(() => null);
    return profile?.hasCv ? `${this.baseUrl}/profile/cv` : null;
  }

  /* ---- Administration ---- */

  async login(password: string): Promise<void> {
    const session = await this.request<AdminSession>('/profile/auth/login', { method: 'POST', body: JSON.stringify({ password }) });
    this.storeToken(session.token);
  }

  /** Un jeton conservé peut être expiré : on le vérifie auprès de l'API. */
  async restoreSession(): Promise<boolean> {
    let token: string | null = null;
    try {
      token = sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return false;
    }
    if (!token) return false;
    this.token = token;
    try {
      await this.request<{ role: string }>('/profile/auth/me');
      return true;
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 503)) this.storeToken(null);
      return false;
    }
  }

  async logout(): Promise<void> {
    this.storeToken(null);
  }

  updateProfile(input: ProfileInput): Promise<Profile> {
    return this.request<Profile>('/profile', { method: 'PUT', body: JSON.stringify(input) });
  }

  replaceSkills(skills: Skill[]): Promise<Skill[]> {
    return this.request<Skill[]>('/profile/skills', { method: 'PUT', body: JSON.stringify(skills) });
  }

  createExperience(input: ExperienceInput): Promise<Experience> {
    return this.request<Experience>('/profile/experiences', { method: 'POST', body: JSON.stringify(input) });
  }

  updateExperience(id: number, input: ExperienceInput): Promise<Experience> {
    return this.request<Experience>(`/profile/experiences/${id}`, { method: 'PUT', body: JSON.stringify(input) });
  }

  deleteExperience(id: number): Promise<void> {
    return this.request<void>(`/profile/experiences/${id}`, { method: 'DELETE' });
  }

  uploadCv(filename: string, contentBase64: string): Promise<{ filename: string; size: number }> {
    return this.request('/profile/cv', { method: 'PUT', body: JSON.stringify({ filename, contentBase64 }) }, 60_000);
  }

  deleteCv(): Promise<void> {
    return this.request<void>('/profile/cv', { method: 'DELETE' });
  }

  createProject(input: ProjectInput): Promise<Project> {
    return this.request<Project>('/projects', { method: 'POST', body: JSON.stringify(input) });
  }

  updateProject(slug: string, input: ProjectInput): Promise<Project> {
    return this.request<Project>(`/projects/${slug}`, { method: 'PUT', body: JSON.stringify(input) });
  }

  deleteProject(slug: string): Promise<void> {
    return this.request<void>(`/projects/${slug}`, { method: 'DELETE' });
  }

  listMessages(limit = 100): Promise<ContactMessage[]> {
    return this.request<ContactMessage[]>(`/contact/messages?limit=${limit}`);
  }

  private async request<T>(path: string, init: RequestInit = {}, timeoutMs = this.timeoutMs): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          ...init.headers,
        },
        signal: controller.signal,
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { title?: string; errors?: Record<string, string[]> };
        throw new ApiError(response.status, payload.title ?? `Erreur ${response.status}`, payload.errors);
      }
      if (response.status === 204) return undefined as T;
      return (await response.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}

// `||` et non `??` : une variable définie mais vide (secret CI absent) retombe aussi sur /api.
export const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined) || '/api';
const firebaseConfig = readFirebaseConfig(import.meta.env.VITE_FIREBASE_CONFIG as string | undefined);

/**
 * Client Firebase chargé à la demande : le SDK (Firestore + Auth) n'est téléchargé que si le site
 * est configuré pour, jamais en mode microservices.
 */
function lazyFirebase(config: FirebaseConfig): PortfolioApi {
  let instance: Promise<PortfolioApi> | null = null;
  const load = () => (instance ??= import('./firebaseClient').then((m) => new m.FirebaseClient(config)));
  return {
    needsEmail: true,
    getProfile: () => load().then((a) => a.getProfile()),
    getProjects: () => load().then((a) => a.getProjects()),
    sendContact: (input) => load().then((a) => a.sendContact(input)),
    cvUrl: () => load().then((a) => a.cvUrl()),
    login: (password, email) => load().then((a) => a.login(password, email)),
    restoreSession: () => load().then((a) => a.restoreSession()),
    logout: () => load().then((a) => a.logout()),
    updateProfile: (input) => load().then((a) => a.updateProfile(input)),
    replaceSkills: (skills) => load().then((a) => a.replaceSkills(skills)),
    createExperience: (input) => load().then((a) => a.createExperience(input)),
    updateExperience: (id, input) => load().then((a) => a.updateExperience(id, input)),
    deleteExperience: (id) => load().then((a) => a.deleteExperience(id)),
    uploadCv: (filename, content) => load().then((a) => a.uploadCv(filename, content)),
    deleteCv: () => load().then((a) => a.deleteCv()),
    createProject: (input) => load().then((a) => a.createProject(input)),
    updateProject: (slug, input) => load().then((a) => a.updateProject(slug, input)),
    deleteProject: (slug) => load().then((a) => a.deleteProject(slug)),
    listMessages: (limit) => load().then((a) => a.listMessages(limit)),
  };
}

/** Source de données du site : Firestore si `VITE_FIREBASE_CONFIG` est définie, sinon les microservices. */
export const api: PortfolioApi = firebaseConfig ? lazyFirebase(firebaseConfig) : new ApiClient({ baseUrl: apiBaseUrl });
export const dataSource: 'firebase' | 'api' = firebaseConfig ? 'firebase' : 'api';
