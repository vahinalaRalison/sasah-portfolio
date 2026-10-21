import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';

/** Session admin : connexion, restauration au chargement, déconnexion (jeton API ou session Firebase). */
export function useAdminSession() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  const logout = useCallback(() => {
    void api.logout();
    setAuthenticated(false);
  }, []);

  const login = useCallback(async (password: string, email?: string) => {
    await api.login(password, email);
    setAuthenticated(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .restoreSession()
      .then((ok) => !cancelled && setAuthenticated(ok))
      .catch(() => !cancelled && setAuthenticated(false))
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { authenticated, checking, login, logout };
}
