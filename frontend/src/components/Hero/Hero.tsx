import { Heart, Sparkles as SparklesIcon } from 'lucide-react';
import { useState } from 'react';
import type { Profile } from '../../api/types';
import { FairyScene } from './FairyScene';
import { Sparkles } from './Sparkles';

/**
 * Hero : scène de conte de fées animée (cheval blanc, princesse, prince).
 * Si une illustration `public/scene/scene.png` existe, elle remplace la scène SVG.
 */
export function Hero({ profile }: { profile: Profile }) {
  const [hasImage, setHasImage] = useState(true);

  return (
    <header id="top" className="relative overflow-hidden pt-24">
      <Sparkles count={28} />

      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-10 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
        <div className="relative z-10 animate-rise text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-sm font-semibold text-barbie-700 shadow-sm backdrop-blur">
            <SparklesIcon className="h-4 w-4 text-gold-500" aria-hidden />
            Bonjour, je suis
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold leading-tight text-barbie-900 sm:text-6xl lg:text-7xl">
            <span className="title-script block text-6xl sm:text-7xl lg:text-8xl">{profile.nickname}</span>
            <span className="block text-2xl font-medium text-barbie-700 sm:text-3xl">{profile.fullName}</span>
          </h1>
          <p className="mt-4 bg-gradient-to-r from-barbie-600 via-royal-500 to-barbie-500 bg-[length:200%_auto] bg-clip-text font-display text-xl font-bold text-transparent animate-shimmer sm:text-2xl">
            {profile.title}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-lg text-barbie-800/80 lg:mx-0">{profile.tagline}</p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <a href="#projects" className="btn-royal">
              Voir mes projets <Heart className="h-4 w-4" aria-hidden />
            </a>
            <a href="#contact" className="btn-ghost">
              Me contacter
            </a>
          </div>
        </div>

        <div className="relative animate-float">
          {hasImage ? (
            <img
              src="/scene/scene.png"
              alt="Une princesse et un prince charmant sur un cheval blanc"
              className="mx-auto w-full max-w-2xl drop-shadow-2xl"
              onError={() => setHasImage(false)}
            />
          ) : (
            <FairyScene />
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-barbie-50 to-transparent" />
    </header>
  );
}
