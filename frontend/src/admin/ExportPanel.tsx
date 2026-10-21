import { Download } from 'lucide-react';
import type { Profile, Project } from '../api/types';
import { buildFallbackJson } from './fallbackExport';
import { Panel } from './ui';

interface Props {
  profile: Profile;
  projects: Project[];
}

/**
 * Le site statique (Firebase) n'a pas d'API : il affiche les données de secours embarquées.
 * Cet export les régénère depuis la base ; il suffit de remplacer le fichier et de commiter.
 */
export function ExportPanel({ profile, projects }: Props) {
  function download() {
    const blob = new Blob([buildFallbackJson(profile, projects)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fallback.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Panel title="📦 Export pour le site statique" intro="Le site hébergé sur Firebase n'interroge pas l'API : il embarque une copie des données.">
      <ol className="list-decimal space-y-1 pl-5 text-sm text-barbie-900/85">
        <li>Téléchargez le fichier ci-dessous une fois vos modifications terminées.</li>
        <li>
          Remplacez <code>frontend/src/data/fallback.json</code> dans le dépôt.
        </li>
        <li>Commitez et poussez : le pipeline redéploie le site avec les bonnes données.</li>
      </ol>
      <button type="button" className="btn-royal mt-4 px-5 py-2 text-sm" onClick={download}>
        <Download className="h-4 w-4" aria-hidden /> Télécharger fallback.json
      </button>
    </Panel>
  );
}
