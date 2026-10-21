import clsx from 'clsx';
import { Crown, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LANDS, landIndex } from '../journey/lands';

interface NavbarProps {
  nickname: string;
  activeLand: string;
}

/** Navigation = jalons du voyage : la terre atteinte est surlignée, les terres passées cochées. */
export function Navbar({ nickname, activeLand }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reached = landIndex(activeLand);
  const links = LANDS.filter((l) => l.id !== 'top');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = (id: string) =>
    clsx(
      'flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition',
      id === activeLand ? 'bg-gradient-to-r from-barbie-500 to-royal-500 text-white shadow-glow' : 'text-barbie-800 hover:bg-barbie-100 hover:text-barbie-600',
      landIndex(id) < reached && id !== activeLand && 'opacity-70',
    );

  return (
    <nav className={clsx('fixed inset-x-0 top-0 z-50 transition-all', scrolled ? 'bg-white/90 shadow-glow' : 'bg-transparent')}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2 font-display text-xl font-bold text-barbie-700">
          <Crown className="h-6 w-6 text-gold-500" aria-hidden />
          {nickname}
        </a>

        <ol className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} className={linkClass(l.id)} aria-current={l.id === activeLand ? 'location' : undefined}>
                <span aria-hidden>{l.emoji}</span>
                {l.subtitle}
              </a>
            </li>
          ))}
        </ol>

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
        <ol className="space-y-1 border-t border-barbie-100 bg-white/95 px-4 py-3 md:hidden">
          {links.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} onClick={() => setOpen(false)} className={clsx(linkClass(l.id), 'rounded-xl px-4')}>
                <span aria-hidden>{l.emoji}</span>
                {l.name}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
