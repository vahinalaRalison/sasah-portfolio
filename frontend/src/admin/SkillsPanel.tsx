import { Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { Profile, Skill, SkillCategory } from '../api/types';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../lib/format';
import { IDLE, type Status, toErrorStatus } from './form';
import { Panel, SaveBar, StatusLine } from './ui';

interface Props {
  profile: Profile;
  onChange: (profile: Profile) => void;
}

/** La liste complète des compétences est éditée puis enregistrée d'un bloc. */
export function SkillsPanel({ profile, onChange }: Props) {
  const [skills, setSkills] = useState<Skill[]>(() => profile.skills.map((s) => ({ ...s })));
  const [status, setStatus] = useState<Status>(IDLE);

  const update = (i: number, patch: Partial<Skill>) => setSkills((list) => list.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const remove = (i: number) => setSkills((list) => list.filter((_, j) => j !== i));
  const add = (category: SkillCategory) => setSkills((list) => [...list, { name: '', category, level: 4 }]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const cleaned = skills.filter((s) => s.name.trim());
    setStatus({ kind: 'saving' });
    try {
      const saved = await api.replaceSkills(cleaned);
      setSkills(saved.map((s) => ({ ...s })));
      onChange({ ...profile, skills: saved });
      setStatus({ kind: 'saved', message: `${saved.length} compétences enregistrées ✨` });
    } catch (err) {
      setStatus(toErrorStatus(err));
    }
  }

  return (
    <Panel title="🌲 Compétences" intro="Une ligne par compétence, niveau de 1 à 5 étoiles. Les lignes vides sont ignorées.">
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        {CATEGORY_ORDER.map((category) => {
          const rows = skills.map((s, i) => ({ s, i })).filter(({ s }) => s.category === category);
          return (
            <fieldset key={category} className="rounded-2xl border border-barbie-100 bg-white/60 p-4">
              <legend className="px-2 font-display text-lg font-bold text-barbie-900">{CATEGORY_LABELS[category]}</legend>
              <div className="space-y-2">
                {rows.map(({ s, i }) => (
                  <div key={i} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                    <input className="input" placeholder="Nom de la compétence" value={s.name} onChange={(e) => update(i, { name: e.target.value })} aria-label="Nom" />
                    <select className="input sm:w-44" value={s.category} onChange={(e) => update(i, { category: e.target.value as SkillCategory })} aria-label="Catégorie">
                      {CATEGORY_ORDER.map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_LABELS[c]}
                        </option>
                      ))}
                    </select>
                    <select className="input sm:w-36" value={s.level} onChange={(e) => update(i, { level: Number(e.target.value) })} aria-label="Niveau">
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {'★'.repeat(n)}
                          {'☆'.repeat(5 - n)}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="rounded-full p-2 text-barbie-500 hover:bg-barbie-100" onClick={() => remove(i)} aria-label="Retirer cette compétence">
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                ))}
                {rows.length === 0 && <p className="text-sm text-barbie-800/60">Aucune compétence dans cette catégorie.</p>}
              </div>
              <button type="button" className="btn-ghost mt-3 px-4 py-1.5 text-sm" onClick={() => add(category)}>
                <Plus className="h-4 w-4" aria-hidden /> Ajouter
              </button>
            </fieldset>
          );
        })}
        <SaveBar status={status} label="Enregistrer toutes les compétences" />
        {status.kind === 'idle' && <StatusLine status={status} />}
      </form>
    </Panel>
  );
}
