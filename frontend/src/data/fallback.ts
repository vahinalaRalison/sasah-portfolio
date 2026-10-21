import type { Profile, Project } from '../api/types';
import data from './fallback.json';

/**
 * Données de secours : affichées si l'API est injoignable (ex. Firebase Hosting seul).
 * Le fichier JSON se régénère depuis l'espace admin (« Exporter pour le site statique »),
 * puis se commite : le site statique reflète alors les données de la base.
 */
export const fallbackProfile: Profile = data.profile as Profile;
export const fallbackProjects: Project[] = data.projects as Project[];
