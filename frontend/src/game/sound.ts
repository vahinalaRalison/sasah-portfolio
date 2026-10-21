/**
 * Petits sons synthétisés (WebAudio, aucun fichier) : étoile, saut, panneau, wouf, fanfare.
 * Le contexte audio n'est créé qu'après un geste de l'utilisateur, comme l'exigent les navigateurs.
 */

const STORAGE_KEY = 'sasah-sound';

type Wave = OscillatorType;

interface Note {
  freq: number;
  /** Décalage de départ (s) */
  at: number;
  /** Durée (s) */
  dur: number;
  wave?: Wave;
  /** Fréquence d'arrivée pour un glissando */
  to?: number;
  gain?: number;
}

class Sfx {
  private ctx: AudioContext | null = null;
  private _muted = loadMuted();

  get muted(): boolean {
    return this._muted;
  }

  setMuted(muted: boolean): void {
    this._muted = muted;
    try {
      localStorage.setItem(STORAGE_KEY, muted ? 'off' : 'on');
    } catch {
      /* stockage indisponible */
    }
  }

  /** À appeler sur un geste utilisateur : débloque le contexte audio. */
  unlock(): void {
    if (this._muted) return;
    const ctx = this.context();
    if (ctx && ctx.state === 'suspended') void ctx.resume();
  }

  /** Étoile ramassée : blip de plus en plus aigu avec le combo. */
  star(combo: number): void {
    const base = 880 * Math.pow(1.06, Math.min(combo, 12));
    this.play([
      { freq: base, at: 0, dur: 0.09, wave: 'sine', gain: 0.18 },
      { freq: base * 1.5, at: 0.06, dur: 0.12, wave: 'sine', gain: 0.14 },
    ]);
  }

  jump(): void {
    this.play([{ freq: 320, to: 720, at: 0, dur: 0.18, wave: 'triangle', gain: 0.12 }]);
  }

  land(): void {
    this.play([{ freq: 180, to: 90, at: 0, dur: 0.08, wave: 'triangle', gain: 0.1 }]);
  }

  /** Panneau découvert : carillon à deux notes. */
  discover(): void {
    this.play([
      { freq: 659, at: 0, dur: 0.16, wave: 'sine', gain: 0.14 },
      { freq: 988, at: 0.12, dur: 0.28, wave: 'sine', gain: 0.14 },
    ]);
  }

  /** Les chiens aboient : courtes impulsions graves, légèrement décalées. */
  woof(count = 4): void {
    const notes: Note[] = [];
    for (let i = 0; i < count; i++) {
      notes.push({ freq: 220 + i * 30, to: 120, at: i * 0.11, dur: 0.07, wave: 'square', gain: 0.06 });
    }
    this.play(notes);
  }

  /** Le cheval hennit : vibrato descendant. */
  neigh(): void {
    this.play([
      { freq: 900, to: 1200, at: 0, dur: 0.12, wave: 'sawtooth', gain: 0.05 },
      { freq: 1200, to: 500, at: 0.12, dur: 0.3, wave: 'sawtooth', gain: 0.05 },
    ]);
  }

  /** Entrée au château : arpège royal. */
  fanfare(): void {
    const seq = [523, 659, 784, 1047, 784, 1047];
    this.play(seq.map((freq, i) => ({ freq, at: i * 0.13, dur: i === seq.length - 1 ? 0.6 : 0.16, wave: 'triangle' as Wave, gain: 0.12 })));
  }

  private context(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      this.ctx = new Ctor();
    } catch {
      return null;
    }
    return this.ctx;
  }

  private play(notes: Note[]): void {
    if (this._muted) return;
    const ctx = this.context();
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    for (const n of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = n.wave ?? 'sine';
      osc.frequency.setValueAtTime(n.freq, now + n.at);
      if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, now + n.at + n.dur);
      const g = n.gain ?? 0.12;
      gain.gain.setValueAtTime(0.0001, now + n.at);
      gain.gain.exponentialRampToValueAtTime(g, now + n.at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.at + n.dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + n.at);
      osc.stop(now + n.at + n.dur + 0.02);
    }
  }
}

function loadMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'off';
  } catch {
    return false;
  }
}

export const sfx = new Sfx();
