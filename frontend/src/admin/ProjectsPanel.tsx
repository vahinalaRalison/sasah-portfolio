import { Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { Project, ProjectInput } from '../api/types';
import { IDLE, type Status, commaToList, fieldError, listToComma, toErrorStatus } from './form';
import { Field, Panel, SaveBar } from './ui';

interface Props {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

const EMPTY: ProjectInput = { slug: '', name: '', tagline: '', description: '', stack: [], repoUrl: null, liveUrl: null, year: new Date().getFullYear(), featured: false, emoji: '✨' };

/** Les trésors de la vallée : un formulaire par projet. */
export function ProjectsPanel({ projects, onChange }: Props) {
  const [draft, setDraft] = useState(false);

  return (
    <Panel title="💎 Projets" intro="Les projets « mis en avant » apparaissent en premier, puis du plus récent au plus ancien.">
      {!draft ? (
        <button type="button" className="btn-royal mb-5 px-5 py-2 text-sm" onClick={() => setDraft(true)}>
          <Plus className="h-4 w-4" aria-hidden /> Ajouter un projet
        </button>
      ) : (
        <div className="mb-5">
          <ProjectForm
            initial={EMPTY}
            submitLabel="Créer"
            onCancel={() => setDraft(false)}
            onSave={async (input) => {
              const created = await api.createProject(input);
              onChange([created, ...projects]);
              setDraft(false);
            }}
          />
        </div>
      )}
      <div className="space-y-4">
        {projects.map((p) => (
          <ProjectForm
            key={p.id}
            initial={p}
            heading={`${p.emoji} ${p.name} · ${p.year}`}
            onSave={async (input) => {
              const updated = await api.updateProject(p.slug, input);
              onChange(projects.map((x) => (x.id === p.id ? updated : x)));
            }}
            onDelete={async () => {
              await api.deleteProject(p.slug);
              onChange(projects.filter((x) => x.id !== p.id));
            }}
          />
        ))}
        {projects.length === 0 && <p className="text-sm text-barbie-800/60">Aucun projet pour l'instant.</p>}
      </div>
    </Panel>
  );
}

interface FormProps {
  initial: ProjectInput;
  heading?: string;
  submitLabel?: string;
  onSave: (input: ProjectInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel?: () => void;
}

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

function ProjectForm({ initial, heading, submitLabel = 'Enregistrer', onSave, onDelete, onCancel }: FormProps) {
  const [form, setForm] = useState<ProjectInput>({ ...initial, stack: [...initial.stack] });
  const [stack, setStack] = useState(listToComma(initial.stack));
  const [status, setStatus] = useState<Status>(IDLE);
  const isNew = !initial.slug;

  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: 'saving' });
    try {
      await onSave({ ...form, stack: commaToList(stack), repoUrl: form.repoUrl || null, liveUrl: form.liveUrl || null });
      setStatus({ kind: 'saved' });
    } catch (err) {
      setStatus(toErrorStatus(err));
    }
  }

  async function remove() {
    if (!onDelete || !window.confirm(`Supprimer le projet « ${form.name} » ?`)) return;
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
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_5rem]">
        <Field label="Nom" error={fieldError(status, 'name')}>
          <input
            className="input"
            value={form.name}
            onChange={(e) => {
              set('name', e.target.value);
              if (isNew) set('slug', slugify(e.target.value));
            }}
            required
          />
        </Field>
        <Field label="Identifiant (slug)" hint="Minuscules, chiffres et tirets" error={fieldError(status, 'slug')}>
          <input className="input" value={form.slug} onChange={(e) => set('slug', e.target.value)} required />
        </Field>
        <Field label="Emoji" error={fieldError(status, 'emoji')}>
          <input className="input text-center" value={form.emoji} onChange={(e) => set('emoji', e.target.value)} />
        </Field>
      </div>
      <Field label="Accroche" className="mt-3" error={fieldError(status, 'tagline')}>
        <input className="input" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
      </Field>
      <Field label="Description" className="mt-3" error={fieldError(status, 'description')}>
        <textarea className="input min-h-24" value={form.description} onChange={(e) => set('description', e.target.value)} />
      </Field>
      <Field label="Technologies" hint="Séparées par des virgules" className="mt-3" error={fieldError(status, 'stack')}>
        <input className="input" value={stack} onChange={(e) => setStack(e.target.value)} />
      </Field>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_6rem_auto]">
        <Field label="Dépôt (URL)" error={fieldError(status, 'repoUrl')}>
          <input className="input" type="url" value={form.repoUrl ?? ''} onChange={(e) => set('repoUrl', e.target.value || null)} placeholder="https://…" />
        </Field>
        <Field label="Site en ligne (URL)" error={fieldError(status, 'liveUrl')}>
          <input className="input" type="url" value={form.liveUrl ?? ''} onChange={(e) => set('liveUrl', e.target.value || null)} placeholder="https://…" />
        </Field>
        <Field label="Année" error={fieldError(status, 'year')}>
          <input className="input" type="number" min={1990} max={2100} value={form.year} onChange={(e) => set('year', Number(e.target.value))} />
        </Field>
        <label className="inline-flex items-center gap-2 self-end pb-2 text-sm font-semibold">
          <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} /> Mis en avant
        </label>
      </div>
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
