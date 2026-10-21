import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Profile } from '../api/types';

/** Emplacement du CV sur le site statique sans aucune source de données : `frontend/public/cv.pdf`. */
const STATIC_CV = '/cv.pdf';

/**
 * URL du CV à offrir en fin de jeu : celui de la source de données (API ou Firestore) s'il existe,
 * sinon le PDF statique s'il est présent (l'hébergeur renvoie index.html pour une page absente,
 * d'où le test du type de contenu).
 */
export function useCvUrl(profile: Profile): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fromSource = profile.hasCv ? api.cvUrl().catch(() => null) : Promise.resolve(null);
    fromSource
      .then(async (u) => {
        if (u) return u;
        const res = await fetch(STATIC_CV, { method: 'HEAD' });
        return res.ok && (res.headers.get('content-type') ?? '').includes('pdf') ? STATIC_CV : null;
      })
      .then((u) => !cancelled && setUrl(u))
      .catch(() => !cancelled && setUrl(null));
    return () => {
      cancelled = true;
    };
  }, [profile.hasCv]);

  return url;
}
