import clsx from 'clsx';
import { Crown, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '#about', label: 'À propos' },
  { href: '#skills', label: 'Compétences' },
  { href: '#experience', label: 'Parcours' },
  { href: '#projects', label: 'Projets' },
  { href: '#contact', label: 'Contact' },
];

export function Navbar({ nickname }: { nickname: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={clsx(
        'fixed inset-x-0 top-0 z-50 transition-all',
        scrolled ? 'bg-white/80 shadow-glow backdrop-blur' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2 font-display text-xl font-bold text-barbie-700">
          <Crown className="h-6 w-6 text-gold-500" aria-hidden />
          {nickname}
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-full px-4 py-2 font-semibold text-barbie-800 transition hover:bg-barbie-100 hover:text-barbie-600">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="rounded-full p-2 text-barbie-700 md:hidden"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <ul className="space-y-1 border-t border-barbie-100 bg-white/95 px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-2 font-semibold text-barbie-800 hover:bg-barbie-100">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
