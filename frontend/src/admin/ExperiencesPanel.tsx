import { Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { Experience, ExperienceInput, Profile } from '../api/types';
import { formatMonth } from '../lib/format';
import { IDLE, type Status, fieldError, linesToList, listToLines, toErrorStatus } from './form';
import { Field, Panel, SaveBar } from './ui';

interface Props {
  profile: Profile;
  onChange: (profile: Profile) => void;
}

const EMPTY: ExperienceInput = { company: '', role: '', startDate: '', endDate: null, summary: '', highlights: [] };

/** Les expériences : une carte par poste, édition en place, ajout en haut. */
export function ExperiencesPanel({ profile, onChange }: Props) {
  const [draft, setDraft] = useState(false);

  const replace = (list: Experience[]) => onChange({ ...profile, experiences: list });

  return (
    <Panel title="⛰️ Expériences" intro="Du poste le plus récent au plus ancien. Un poste sans date de fin est affiché « aujourd'hui ».">
      {!draft ? (
        <button type="button" className="btn-royal mb-5 px-5 py-2 text-sm" onClick={() => setDraft(true)}>
          <Plus className="h-4 w-4" aria-hidden /> Ajouter une expérience
        </button>
      ) : (
        <div className="mb-5">
          <ExperienceForm
            initial={EMPTY}
            submitLabel="Créer"
            onCancel={() => setDraft(false)}
            onSave={async (input) => {
              const created = await api.createExperience(input);
              replace([created, ...profile.experiences]);
              setDraft(false);
            }}
          />
        </div>
      )}
      <div className="space-y-4">
        {profile.experiences.map((exp) => (
          <ExperienceForm
            key={exp.id}
            initial={exp}
            heading={`${exp.role} · ${exp.company} · ${formatMonth(exp.startDate)} → ${formatMonth(exp.endDate)}`}
            onSave={async (input) => {
              const updated = await api.updateExperience(exp.id, input);
              replace(profile.experiences.map((e) => (e.id === exp.id ? updated : e)));
            }}
            onDelete={async () => {
              await api.deleteExperience(exp.id);
              replace(profile.experiences.filter((e) => e.id !== exp.id));
            }}
          />
        ))}
        {profile.experiences.length === 0 && <p className="text-sm text-barbie-800/60">Aucune expérience pour l'instant.</p>}
      </div>
    </Panel>
  );
}

interface FormProps {
  initial: ExperienceInput;
  heading?: string;
  submitLabel?: string;
  onSave: (input: ExperienceInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel?: () => void;
}

function ExperienceForm({ initial, heading, submitLabel = 'Enregistrer', onSave, onDelete, onCancel }: FormProps) {
  const [form, setForm] = useState<ExperienceInput>({ ...initial, highlights: [...initial.highlights] });
  const [current, setCurrent] = useState(initial.endDate === null);
  const [highlights, setHighlights] = useState(listToLines(initial.highlights));
  const [status, setStatus] = useState<Status>(IDLE);

  const set = <K extends keyof ExperienceInput>(key: K, value: ExperienceInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: 'saving' });
    try {
      await onSave({ ...form, endDate: current ? null : form.endDate, highlights: linesToList(highlights) });
      setStatus({ kind: 'saved' });
    } catch (err) {
      setStatus(toErrorStatus(err));
    }
  }

  async function remove() {
    if (!onDelete || !window.confirm('Supprimer cette expérience ?')) return;
    setStatus({ kind: 'saving' });
    try {
      await onDelete();
    } catch (err) {
      setStatus(toErrorStatus(err));
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-barbie-100 bg-white/60 p-4" noValidate>
      {heading && <h3 className="mb-3 font-display text-lg font-bold text-barbie-900">{heading}</h3>}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Entreprise" error={fieldError(status, 'company')}>
          <input className="input" value={form.company} onChange={(e) => set('company', e.target.value)} required />
        </Field>
        <Field label="Poste" error={fieldError(status, 'role')}>
          <input className="input" value={form.role} onChange={(e) => set('role', e.target.value)} required />
        </Field>
        <Field label="Début" error={fieldError(status, 'startDate')}>
          <input className="input" type="month" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} required />
        </Field>
        <Field label="Fin" error={fieldError(status, 'endDate')}>
          <div className="flex items-center gap-3">
            <input className="input" type="month" value={form.endDate ?? ''} onChange={(e) => set('endDate', e.target.value || null)} disabled={current} />
            <label className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold">
              <input type="checkbox" checked={current} onChange={(e) => setCurrent(e.target.checked)} /> Poste actuel
            </label>
          </div>
        </Field>
      </div>
      <Field label="Résumé" className="mt-3" error={fieldError(status, 'summary')}>
        <textarea className="input min-h-20" value={form.summary} onChange={(e) => set('summary', e.target.value)} />
      </Field>
      <Field label="Points forts" hint="Un par ligne, affichés en pastilles" className="mt-3" error={fieldError(status, 'highlights')}>
        <textarea className="input min-h-20" value={highlights} onChange={(e) => setHighlights(e.target.value)} />
      </Field>
      <SaveBar status={status} label={submitLabel}>
        {onCancel && (
          <button type="button" className="btn-ghost px-4 py-2 text-sm" onClick={onCancel}>
            Annuler
          </button>
        )}
        {onDelete && (
          <button type="button" className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50" onClick={remove}>
            <Trash2 className="h-4 w-4" aria-hidden /> Supprimer
          </button>
        )}
      </SaveBar>
    </form>
  );
}
