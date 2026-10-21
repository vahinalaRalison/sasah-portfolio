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

/**
 * Adapter HTTP : seul module qui connaît `fetch` et la forme des erreurs API.
 * `baseUrl` est injectée (testable), `fetchImpl` aussi.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export class ApiClient {
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

  /** URL publique du CV (servi par profile-service). */
  cvUrl(): string {
    return `${this.baseUrl}/profile/cv`;
  }

  /* ---- Administration ---- */

  login(password: string): Promise<AdminSession> {
    return this.request<AdminSession>('/profile/auth/login', { method: 'POST', body: JSON.stringify({ password }) });
  }

  checkSession(): Promise<{ role: string }> {
    return this.request<{ role: string }>('/profile/auth/me');
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
export const api = new ApiClient({ baseUrl: apiBaseUrl });
