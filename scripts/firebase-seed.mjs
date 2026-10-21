#!/usr/bin/env node
/**
 * Amorçage du mode « sans serveur » : crée le compte admin (Firebase Auth), l'inscrit dans
 * admins/{uid}, et importe les données de frontend/src/data/fallback.json dans Firestore
 * si la base est vide. À lancer une fois, depuis la racine du dépôt :
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=~/.config/sasah/firebase-service-account.json \
 *   node scripts/firebase-seed.mjs --email sarah@exemple.fr --password 'mot-de-passe'
 *
 * Prérequis (console Firebase, projet sasah-potforlio) : Firestore créé (mode natif),
 * Authentication → fournisseur « E-mail/Mot de passe » activé.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import admin from 'firebase-admin';

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]] : [])).filter((e) => e.length));
const email = args.email;
const password = args.password;
if (!email || !password || password.length < 8) {
  console.error('usage : node scripts/firebase-seed.mjs --email <e-mail> --password <8 caractères minimum>');
  process.exit(1);
}
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credentialsPath) {
  console.error('GOOGLE_APPLICATION_CREDENTIALS doit pointer vers la clé du compte de service Firebase.');
  process.exit(1);
}

const key = JSON.parse(readFileSync(credentialsPath, 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(key), projectId: key.project_id });
const db = admin.firestore();
const auth = admin.auth();

// 1. Compte admin
let user;
try {
  user = await auth.getUserByEmail(email);
  await auth.updateUser(user.uid, { password });
  console.log(`compte existant mis à jour : ${email}`);
} catch {
  user = await auth.createUser({ email, password, emailVerified: true });
  console.log(`compte créé : ${email}`);
}
await db.doc(`admins/${user.uid}`).set({ email, createdAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
console.log(`admins/${user.uid} inscrit`);

// 2. Données initiales (uniquement si la base est vide)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fallback = JSON.parse(readFileSync(path.join(root, 'frontend/src/data/fallback.json'), 'utf8'));
const profileRef = db.doc('site/profile');
if ((await profileRef.get()).exists) {
  console.log('site/profile existe déjà : données conservées');
} else {
  const { experiences, hasCv: _hasCv, ...profile } = fallback.profile;
  const batch = db.batch();
  batch.set(profileRef, profile);
  for (const exp of experiences) {
    const { id, ...data } = exp;
    batch.set(db.doc(`experiences/${id}`), data);
  }
  for (const project of fallback.projects) {
    const { id, ...data } = project;
    batch.set(db.doc(`projects/${id}`), data);
  }
  await batch.commit();
  console.log(`importé : profil, ${experiences.length} expériences, ${fallback.projects.length} projets`);
}
console.log('terminé ✨  Connexion : https://sasah-potforlio.web.app/admin');
process.exit(0);
