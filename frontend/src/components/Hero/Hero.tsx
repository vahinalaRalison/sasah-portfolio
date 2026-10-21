import { Heart, Map, Sparkles as SparklesIcon } from 'lucide-react';
import type { Profile } from '../../api/types';
import { KingdomMap } from '../../journey/KingdomMap';
import { landById } from '../../journey/lands';
import { Sparkles } from './Sparkles';

interface HeroProps {
  profile: Profile;
  progress: number;
  activeLand: string;
}

/** Château de départ : présentation et carte du royaume à parcourir. */
export function Hero({ profile, progress, activeLand }: HeroProps) {
  const land = landById('top');

  return (
    <header id="top" className="relative overflow-hidden pt-24">
      <Sparkles count={14} />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-10 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
        <div className="relative z-10 animate-rise text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-sm font-semibold text-barbie-700 shadow-sm">
            <SparklesIcon className="h-4 w-4 text-gold-500" aria-hidden />
            {land.emoji} {land.name} · {land.subtitle}
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold leading-tight text-barbie-900 sm:text-6xl lg:text-7xl">
            <span className="title-script block text-6xl sm:text-7xl lg:text-8xl">{profile.nickname}</span>
            <span className="block text-2xl font-medium text-barbie-700 sm:text-3xl">{profile.fullName}</span>
          </h1>
          <p className="mt-4 bg-gradient-to-r from-barbie-600 via-royal-500 to-barbie-500 bg-clip-text font-display text-xl font-bold text-transparent sm:text-2xl">
            {profile.title}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-lg text-barbie-800/80 lg:mx-0">{profile.tagline}</p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-barbie-800/70 lg:mx-0">
            Faites défiler : le cheval blanc emmène la princesse, escortée de ses quatre cotons de Tuléar, de terre en terre, et chacune
            dévoile un morceau de mon histoire.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <a href="#about" className="btn-royal">
              Commencer le voyage <Map className="h-4 w-4" aria-hidden />
            </a>
            <a href="#projects" className="btn-ghost">
              Aller aux trésors <Heart className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>

        <div className="relative animate-float">
          <KingdomMap progress={progress} activeLand={activeLand} />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-barbie-50 to-transparent" />
    </header>
  );
}
