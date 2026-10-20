import { Boxes, Gauge, ShieldCheck, Wand2, type LucideIcon } from 'lucide-react';

export interface Pillar {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly text: string;
}

/** Les quatre piliers de ma façon de travailler. */
export const PILLARS: readonly Pillar[] = [
  { icon: Boxes, title: 'Microservices', text: 'Services découplés derrière une passerelle, une base par service, messagerie asynchrone.' },
  { icon: Wand2, title: 'Design patterns', text: 'Repository, injection de dépendances, hexagonal : du code maintenable et facile à reprendre.' },
  { icon: ShieldCheck, title: 'Zéro régression', text: 'Normes de code, typage strict, tests automatisés et pipelines CI/CD sur chaque livraison.' },
  { icon: Gauge, title: 'Performance', text: 'Applications rapides : cache, index, requêtes optimisées, images Docker légères.' },
];
