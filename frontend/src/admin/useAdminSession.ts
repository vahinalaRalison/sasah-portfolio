import { useCallback, useEffect, useState } from 'react';
import { ApiError, api } from '../api/client';

const KEY = 'sasah-admin-token';

function readToken(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** Session admin : jeton gardé le temps de l'onglet (sessionStorage) et injecté dans le client API. */
export function useAdminSession() {
  const [token, setToken] = useState<string | null>(() => {
    const t = readToken();
    api.setToken(t);
    return t;
  });
  const [checking, setChecking] = useState(token !== null);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* stockage indisponible */
    }
    api.setToken(null);
    setToken(null);
  }, []);

  const login = useCallback(async (password: string) => {
    const session = await api.login(password);
    try {
      sessionStorage.setItem(KEY, session.token);
    } catch {
      /* stockage indisponible : la session ne survivra pas à un rechargement */
    }
    api.setToken(session.token);
    setToken(session.token);
  }, []);

  // Un jeton conservé peut être expiré : on le vérifie une fois au chargement.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api
      .checkSession()
      .catch((err: unknown) => {
        if (!cancelled && err instanceof ApiError && (err.status === 401 || err.status === 503)) logout();
      })
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { token, checking, login, logout };
}
