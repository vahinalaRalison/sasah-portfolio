import { useEffect, useState } from 'react';

export interface ResourceState<T> {
  data: T;
  loading: boolean;
  /** `true` si les données affichées proviennent du fallback local. */
  offline: boolean;
}

/**
 * Hook générique « API avec repli » : charge via `loader`, sinon utilise `fallback`.
 * Le site reste complet même quand les microservices sont indisponibles.
 */
export function useResource<T>(loader: () => Promise<T>, fallback: T): ResourceState<T> {
  const [state, setState] = useState<ResourceState<T>>({ data: fallback, loading: true, offline: false });

  useEffect(() => {
    let cancelled = false;
    loader()
      .then((data) => !cancelled && setState({ data, loading: false, offline: false }))
      .catch(() => !cancelled && setState({ data: fallback, loading: false, offline: true }));
    return () => {
      cancelled = true;
    };
    // `loader` et `fallback` sont stables (modules), pas de re-fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
