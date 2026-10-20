import type { ContactInput, ContactReceipt, Profile, Project } from './types';

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

  // `fetch` natif lié à `globalThis` : appelé comme méthode il lèverait « Illegal invocation ».
  constructor({ baseUrl, fetchImpl = globalThis.fetch.bind(globalThis), timeoutMs = 8000 }: ApiClientOptions) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  getProfile(): Promise<Profile> {
    return this.request<Profile>('/profile');
  }

  getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  sendContact(input: ContactInput): Promise<ContactReceipt> {
    return this.request<ContactReceipt>('/contact', { method: 'POST', body: JSON.stringify(input) });
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        ...init,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...init.headers },
        signal: controller.signal,
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { title?: string; errors?: Record<string, string[]> };
        throw new ApiError(response.status, payload.title ?? `Erreur ${response.status}`, payload.errors);
      }
      return (await response.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}

export const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';
export const api = new ApiClient({ baseUrl: apiBaseUrl });
