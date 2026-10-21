import { FileText, Gift, Trash2, Upload } from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import { api } from '../api/client';
import type { Profile } from '../api/types';
import { IDLE, type Status, toErrorStatus } from './form';
import { Panel, StatusLine } from './ui';

interface Props {
  profile: Profile;
  onChange: (profile: Profile) => void;
}

const MAX_BYTES = 5 * 1024 * 1024;

/** Lit un fichier et renvoie son contenu en base64 (sans le préfixe data:). */
function readBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lecture du fichier impossible'));
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.readAsDataURL(file);
  });
}

/** Le CV : cadeau remis à qui termine le jeu. Un seul fichier PDF, remplacé à chaque envoi. */
export function CvPanel({ profile, onChange }: Props) {
  const [status, setStatus] = useState<Status>(IDLE);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setStatus({ kind: 'error', message: 'Le PDF dépasse 5 Mo', fields: {} });
      return;
    }
    setStatus({ kind: 'saving' });
    try {
      const saved = await api.uploadCv(file.name, await readBase64(file));
      onChange({ ...profile, hasCv: true });
      setStatus({ kind: 'saved', message: `${saved.filename} envoyé (${Math.round(saved.size / 1024)} Ko) 🎁` });
    } catch (err) {
      setStatus(toErrorStatus(err));
    }
  }

  async function remove() {
    if (!window.confirm('Retirer le CV ? Le cadeau de fin de jeu disparaîtra.')) return;
    setStatus({ kind: 'saving' });
    try {
      await api.deleteCv();
      onChange({ ...profile, hasCv: false });
      setStatus({ kind: 'saved', message: 'CV retiré' });
    } catch (err) {
      setStatus(toErrorStatus(err));
    }
  }

  return (
    <Panel title="🎁 CV, le cadeau du gagnant" intro="Qui franchit la porte du château du bal reçoit votre CV en cadeau. Format PDF, 5 Mo maximum.">
      <div className="flex flex-wrap items-center gap-4">
        {profile.hasCv ? (
          <a href={api.cvUrl()} target="_blank" rel="noreferrer" className="btn-ghost px-4 py-2 text-sm">
            <FileText className="h-4 w-4" aria-hidden /> Voir le CV actuel
          </a>
        ) : (
          <p className="inline-flex items-center gap-2 text-sm text-barbie-800/70">
            <Gift className="h-4 w-4" aria-hidden /> Aucun CV pour l'instant : le cadeau n'est pas encore sous le sapin.
          </p>
        )}
        <label className="btn-royal cursor-pointer px-4 py-2 text-sm">
          <Upload className="h-4 w-4" aria-hidden /> {profile.hasCv ? 'Remplacer le PDF' : 'Envoyer le PDF'}
          <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={onFile} disabled={status.kind === 'saving'} />
        </label>
        {profile.hasCv && (
          <button type="button" className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50" onClick={remove}>
            <Trash2 className="h-4 w-4" aria-hidden /> Retirer
          </button>
        )}
      </div>
      <div className="mt-3">
        <StatusLine status={status} />
      </div>
      <p className="mt-4 text-xs text-barbie-800/60">
        Pour le site statique (Firebase, sans API), déposez aussi le fichier dans <code>frontend/public/cv.pdf</code> : le jeu le propose alors en cadeau même hors ligne.
      </p>
    </Panel>
  );
}
