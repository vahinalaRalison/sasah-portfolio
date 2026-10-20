import { api } from '../api/client';
import type { Profile, Project } from '../api/types';
import { fallbackProfile, fallbackProjects } from '../data/fallback';
import { useResource } from './useResource';

const loadProfile = (): Promise<Profile> => api.getProfile();
const loadProjects = (): Promise<Project[]> => api.getProjects();

export const useProfile = () => useResource(loadProfile, fallbackProfile);
export const useProjects = () => useResource(loadProjects, fallbackProjects);
