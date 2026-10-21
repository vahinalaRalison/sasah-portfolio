import { Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { Profile, ProfileInput } from '../api/types';
import { IDLE, type Status, fieldError, toErrorStatus } from './form';
import { Field, Panel, SaveBar } from './ui';

interface Props {
  profile: Profile;
  onChange: (profile: Profile) => void;
}

const toInput = (p: Profile): ProfileInput => ({
  fullName: p.fullName,
  nickname: p.nickname,
  title: p.title,
  tagline: p.tagline,
  bio: p.bio,
  location: p.location,
  email: p.email,
  links: p.links.map((l) => ({ ...l })),
});

/** Identité, bio et liens : tout ce qui apparaît dans le château de départ et le bal. */
export function ProfilePanel({ profile, onChange }: Props) {
  const [form, setForm] = useState<ProfileInput>(() => toInput(profile));
  const [status, setStatus] = useState<Status>(IDLE);

  const set = <K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setLink = (i: number, key: 'label' | 'url', value: string) =>
    setForm((f) => ({ ...f, links: f.links.map((l, j) => (j === i ? { ...l, [key]: value } : l)) }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: 'saving' });
    try {
      const saved = await api.updateProfile(form);
      onChange(saved);
      setStatus({ kind: 'saved' });
    } catch (err) {
      setStatus(toErrorStatus(err));
    }
  }

  return (
    <Panel title="🌸 Profil" intro="Nom, titre, bio et liens affichés sur le site.">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom complet" error={fieldError(status, 'fullName')}>
            <input className="input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required />
          </Field>
          <Field label="Surnom" hint="Le titre calligraphié du site" error={fieldError(status, 'nickname')}>
            <input className="input" value={form.nickname} onChange={(e) => set('nickname', e.target.value)} required />
          </Field>
          <Field label="Titre" error={fieldError(status, 'title')}>
            <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </Field>
          <Field label="Accroche" error={fieldError(status, 'tagline')}>
            <input className="input" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </Field>
          <Field label="Localisation" error={fieldError(status, 'location')}>
            <input className="input" value={form.location} onChange={(e) => set('location', e.target.value)} />
          </Field>
          <Field label="E-mail de contact" error={fieldError(status, 'email')}>
            <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </Field>
        </div>
        <Field label="Bio" error={fieldError(status, 'bio')}>
          <textarea className="input min-h-32" value={form.bio} onChange={(e) => set('bio', e.target.value)} />
        </Field>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-barbie-900">Liens (GitHub, GitLab, LinkedIn…)</legend>
          <div className="space-y-2">
            {form.links.map((link, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <input className="input sm:w-40" placeholder="Libellé" value={link.label} onChange={(e) => setLink(i, 'label', e.target.value)} aria-label="Libellé du lien" />
                <input className="input" placeholder="https://…" type="url" value={link.url} onChange={(e) => setLink(i, 'url', e.target.value)} aria-label="Adresse du lien" />
                <button type="button" className="rounded-full p-2 text-barbie-500 hover:bg-barbie-100" onClick={() => set('links', form.links.filter((_, j) => j !== i))} aria-label="Retirer ce lien">
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>
          {fieldError(status, 'links') && <p className="mt-1 text-xs font-semibold text-red-600">{fieldError(status, 'links')}</p>}
          <button type="button" className="btn-ghost mt-3 px-4 py-2 text-sm" onClick={() => set('links', [...form.links, { label: '', url: '' }])}>
            <Plus className="h-4 w-4" aria-hidden /> Ajouter un lien
          </button>
        </fieldset>

        <SaveBar status={status} />
      </form>
    </Panel>
  );
}
