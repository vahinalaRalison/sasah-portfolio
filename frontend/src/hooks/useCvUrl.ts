import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Profile } from '../api/types';

/** Emplacement du CV sur le site statique (sans API) : `frontend/public/cv.pdf`. */
const STATIC_CV = '/cv.pdf';

/**
 * URL du CV à offrir en fin de jeu : celui de l'API s'il existe, sinon le PDF statique
 * s'il est présent (l'hébergeur renvoie index.html pour une page absente, d'où le test du type).
 */
export function useCvUrl(profile: Profile): string | null {
  const [url, setUrl] = useState<string | null>(() => (profile.hasCv ? api.cvUrl() : null));

  useEffect(() => {
    if (profile.hasCv) {
      setUrl(api.cvUrl());
      return;
    }
    let cancelled = false;
    fetch(STATIC_CV, { method: 'HEAD' })
      .then((res) => {
        const isPdf = res.ok && (res.headers.get('content-type') ?? '').includes('pdf');
        if (!cancelled) setUrl(isPdf ? STATIC_CV : null);
      })
      .catch(() => !cancelled && setUrl(null));
    return () => {
      cancelled = true;
    };
  }, [profile.hasCv]);

  return url;
}
