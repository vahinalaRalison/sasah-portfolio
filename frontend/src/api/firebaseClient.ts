import { initializeApp, type FirebaseApp } from 'firebase/app';
import { browserSessionPersistence, getAuth, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signOut, type Auth } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit as limitTo,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Firestore,
  type Timestamp,
} from 'firebase/firestore';
import { ApiError } from './errors';
import { base64Bytes, sortExperiences, sortProjects, sortSkills, splitChunks, type FirebaseConfig, type PortfolioApi } from './portfolioApi';
import type { ContactInput, ContactMessage, ContactReceipt, Experience, ExperienceInput, Profile, ProfileInput, Project, ProjectInput, Skill } from './types';

/*
 * Modèle Firestore (règles dans firestore.rules, à la racine du dépôt) :
 *   site/profile        { fullName, …, links, skills }            lecture publique, écriture admin
 *   experiences/{id}    { company, role, startDate, … }           idem
 *   projects/{id}       { slug, name, … }                         idem
 *   cv/meta, cv/chunk-N { filename, size, chunks } / { data }     idem (PDF en base64 par morceaux)
 *   messages/{id}       { name, email, subject, body, createdAt } création publique, lecture admin
 *   admins/{uid}        { }                                       qui a le droit d'écrire
 */

const CV_MAX_BYTES = 5 * 1024 * 1024;

/** Implémentation « sans serveur » de l'API : Firestore pour les données, Firebase Auth pour l'admin. */
export class FirebaseClient implements PortfolioApi {
  readonly needsEmail = true;
  private readonly app: FirebaseApp;
  private readonly db: Firestore;
  private readonly auth: Auth;
  private cvBlobUrl: string | null = null;

  constructor(config: FirebaseConfig) {
    this.app = initializeApp(config);
    this.db = getFirestore(this.app);
    this.auth = getAuth(this.app);
  }

  /* ---- Lecture publique ---- */

  async getProfile(): Promise<Profile> {
    const [site, experiences, cvMeta] = await Promise.all([
      getDoc(doc(this.db, 'site', 'profile')),
      getDocs(collection(this.db, 'experiences')),
      getDoc(doc(this.db, 'cv', 'meta')),
    ]);
    if (!site.exists()) throw new ApiError(404, 'Profil introuvable');
    const data = site.data() as Omit<Profile, 'experiences' | 'hasCv'>;
    return {
      ...data,
      skills: sortSkills(data.skills ?? []),
      experiences: sortExperiences(experiences.docs.map((d) => ({ id: Number(d.id), ...(d.data() as ExperienceInput) }))),
      hasCv: cvMeta.exists(),
    };
  }

  async getProjects(): Promise<Project[]> {
    const snap = await getDocs(collection(this.db, 'projects'));
    return sortProjects(snap.docs.map((d) => ({ id: Number(d.id), ...(d.data() as ProjectInput) })));
  }

  async sendContact(input: ContactInput): Promise<ContactReceipt> {
    const message = { name: input.name.trim(), email: input.email.trim().toLowerCase(), subject: input.subject.trim(), body: input.body.trim() };
    const errors: Record<string, string[]> = {};
    if (message.name.length < 2 || message.name.length > 80) errors.name = ['2 à 80 caractères'];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message.email) || message.email.length > 120) errors.email = ['adresse invalide'];
    if (message.subject.length < 3 || message.subject.length > 120) errors.subject = ['3 à 120 caractères'];
    if (message.body.length < 10 || message.body.length > 2000) errors.body = ['10 à 2000 caractères'];
    if (input.website) errors.website = ['doit rester vide'];
    if (Object.keys(errors).length > 0) throw new ApiError(400, 'Requête invalide', errors);
    const ref = await addDoc(collection(this.db, 'messages'), { ...message, createdAt: serverTimestamp() });
    return { id: Number.parseInt(ref.id.replace(/\D/g, '').slice(0, 9) || '0', 10), createdAt: new Date().toISOString() };
  }

  async cvUrl(): Promise<string | null> {
    const meta = await getDoc(doc(this.db, 'cv', 'meta'));
    if (!meta.exists()) return null;
    if (this.cvBlobUrl) return this.cvBlobUrl;
    const { chunks } = meta.data() as { chunks: number };
    const parts = await Promise.all(Array.from({ length: chunks }, (_, i) => getDoc(doc(this.db, 'cv', `chunk-${i}`))));
    const base64 = parts.map((p) => (p.data() as { data: string } | undefined)?.data ?? '').join('');
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    this.cvBlobUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    return this.cvBlobUrl;
  }

  /* ---- Session admin ---- */

  async login(password: string, email?: string): Promise<void> {
    if (!email) throw new ApiError(400, 'E-mail requis', { email: ['requis'] });
    await setPersistence(this.auth, browserSessionPersistence);
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/too-many-requests') throw new ApiError(429, 'Trop de tentatives, réessayez plus tard');
      throw new ApiError(401, 'E-mail ou mot de passe incorrect');
    }
    if (!(await this.isAdmin())) {
      await signOut(this.auth);
      throw new ApiError(403, 'Ce compte n’est pas administrateur');
    }
  }

  restoreSession(): Promise<boolean> {
    return new Promise((resolve) => {
      const stop = onAuthStateChanged(this.auth, async (user) => {
        stop();
        resolve(user ? await this.isAdmin() : false);
      });
    });
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  private async isAdmin(): Promise<boolean> {
    const uid = this.auth.currentUser?.uid;
    if (!uid) return false;
    try {
      return (await getDoc(doc(this.db, 'admins', uid))).exists();
    } catch {
      return false;
    }
  }

  /* ---- Écriture admin (les règles Firestore vérifient le droit) ---- */

  async updateProfile(input: ProfileInput): Promise<Profile> {
    await this.write(() => updateDoc(doc(this.db, 'site', 'profile'), { ...input }));
    return this.getProfile();
  }

  async replaceSkills(skills: Skill[]): Promise<Skill[]> {
    const cleaned = sortSkills(dedupe(skills));
    await this.write(() => updateDoc(doc(this.db, 'site', 'profile'), { skills: cleaned }));
    return cleaned;
  }

  async createExperience(input: ExperienceInput): Promise<Experience> {
    const id = Date.now();
    await this.write(() => setDoc(doc(this.db, 'experiences', String(id)), input));
    return { id, ...input };
  }

  async updateExperience(id: number, input: ExperienceInput): Promise<Experience> {
    await this.write(() => setDoc(doc(this.db, 'experiences', String(id)), input));
    return { id, ...input };
  }

  async deleteExperience(id: number): Promise<void> {
    await this.write(() => deleteDoc(doc(this.db, 'experiences', String(id))));
  }

  async uploadCv(filename: string, contentBase64: string): Promise<{ filename: string; size: number }> {
    const size = base64Bytes(contentBase64);
    if (size > CV_MAX_BYTES) throw new ApiError(413, 'CV trop volumineux (5 Mo max)');
    if (!atob(contentBase64.slice(0, 8)).startsWith('%PDF')) throw new ApiError(400, 'Le fichier n’est pas un PDF');
    const chunks = splitChunks(contentBase64);
    await this.write(async () => {
      const batch = writeBatch(this.db);
      chunks.forEach((data, i) => batch.set(doc(this.db, 'cv', `chunk-${i}`), { data }));
      batch.set(doc(this.db, 'cv', 'meta'), { filename, size, chunks: chunks.length, updatedAt: serverTimestamp() });
      await batch.commit();
    });
    this.cvBlobUrl = null;
    return { filename, size };
  }

  async deleteCv(): Promise<void> {
    const meta = await getDoc(doc(this.db, 'cv', 'meta'));
    const chunks = meta.exists() ? (meta.data() as { chunks: number }).chunks : 0;
    await this.write(async () => {
      const batch = writeBatch(this.db);
      for (let i = 0; i < chunks; i++) batch.delete(doc(this.db, 'cv', `chunk-${i}`));
      batch.delete(doc(this.db, 'cv', 'meta'));
      await batch.commit();
    });
    this.cvBlobUrl = null;
  }

  async createProject(input: ProjectInput): Promise<Project> {
    if ((await this.getProjects()).some((p) => p.slug === input.slug)) throw new ApiError(409, `Le slug « ${input.slug} » existe déjà`, { slug: ['déjà utilisé'] });
    const id = Date.now();
    await this.write(() => setDoc(doc(this.db, 'projects', String(id)), input));
    return { id, ...input };
  }

  async updateProject(slug: string, input: ProjectInput): Promise<Project> {
    const projects = await this.getProjects();
    const current = projects.find((p) => p.slug === slug);
    if (!current) throw new ApiError(404, 'Projet introuvable');
    if (input.slug !== slug && projects.some((p) => p.slug === input.slug)) throw new ApiError(409, `Le slug « ${input.slug} » existe déjà`, { slug: ['déjà utilisé'] });
    await this.write(() => setDoc(doc(this.db, 'projects', String(current.id)), input));
    return { id: current.id, ...input };
  }

  async deleteProject(slug: string): Promise<void> {
    const current = (await this.getProjects()).find((p) => p.slug === slug);
    if (!current) throw new ApiError(404, 'Projet introuvable');
    await this.write(() => deleteDoc(doc(this.db, 'projects', String(current.id))));
  }

  async listMessages(limit = 100): Promise<ContactMessage[]> {
    const snap = await this.write(() => getDocs(query(collection(this.db, 'messages'), orderBy('createdAt', 'desc'), limitTo(limit))));
    return snap.docs.map((d, i) => {
      const m = d.data() as Omit<ContactMessage, 'id' | 'createdAt'> & { createdAt?: Timestamp };
      return { id: i + 1, name: m.name, email: m.email, subject: m.subject, body: m.body, createdAt: m.createdAt?.toDate().toISOString() ?? new Date().toISOString() };
    });
  }

  /** Traduit un refus des règles Firestore en erreur 401/403 lisible par l'admin. */
  private async write<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'permission-denied') throw new ApiError(this.auth.currentUser ? 403 : 401, this.auth.currentUser ? 'Accès refusé' : 'Authentification requise');
      throw err;
    }
  }
}

function dedupe(skills: readonly Skill[]): Skill[] {
  const byName = new Map<string, Skill>();
  for (const s of skills) if (s.name.trim()) byName.set(s.name.trim().toLowerCase(), { ...s, name: s.name.trim() });
  return [...byName.values()];
}
