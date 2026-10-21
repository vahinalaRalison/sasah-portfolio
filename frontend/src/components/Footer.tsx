import { Github, Gitlab, Linkedin, Settings, type LucideIcon } from 'lucide-react';
import type { Profile } from '../api/types';

const ICONS: Record<string, LucideIcon> = { GitHub: Github, GitLab: Gitlab, LinkedIn: Linkedin };

export function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="border-t border-barbie-100 bg-white/60 px-4 py-10 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
        <p className="title-script text-4xl">{profile.nickname}</p>
        <ul className="flex gap-3">
          {profile.links.map((link) => {
            const Icon = ICONS[link.label];
            return (
              <li key={link.label}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-barbie-100 text-barbie-700 transition hover:bg-barbie-500 hover:text-white"
                >
                  {Icon ? <Icon className="h-5 w-5" aria-hidden /> : link.label[0]}
                </a>
              </li>
            );
          })}
        </ul>
        <p className="text-sm text-barbie-800/70">
          © {new Date().getFullYear()} {profile.fullName} — microservices, PostgreSQL, Docker, Kubernetes &amp; Firebase, avec 💖
        </p>
        <a href="/admin" className="inline-flex items-center gap-1 text-xs text-barbie-800/40 transition hover:text-barbie-700">
          <Settings className="h-3 w-3" aria-hidden /> Espace admin
        </a>
      </div>
    </footer>
  );
}
