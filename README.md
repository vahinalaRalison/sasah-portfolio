# 👑 Sasah Portfolio — Princess Edition

Portfolio de **Sarah Mendrika**, développeuse fullstack senior, sur un thème Barbie / princesse :
un cheval blanc, une princesse indépendante et ses quatre cotons de Tuléar (un mâle, trois femelles)
animés dans un décor de conte de fées.

Architecture **microservices**, chaque brique dans son **conteneur Docker**, base **PostgreSQL**
(une base par service), pipeline **GitHub Actions**, déploiement **Kubernetes** (API) + **Firebase Hosting** (front), le tout sur des offres gratuites.

```
                 ┌────────────────────────────┐
  Internet ───▶  │  gateway (nginx)  :8080    │
                 └──────┬───────────┬─────────┘
          /             │           │ /api/*
   ┌──────▼──────┐  ┌───▼──────────────┐ ┌──────────────────┐ ┌──────────────────┐
   │  frontend   │  │ profile-service  │ │ projects-service │ │ contact-service  │
   │ React+Vite  │  │ Fastify + TS     │ │ Fastify + TS     │ │ Fastify + TS     │
   └─────────────┘  └───┬──────────────┘ └───┬──────────────┘ └───┬──────────────┘
                        │ profile_db          │ projects_db        │ contact_db
                     ┌──▼─────────────────────▼────────────────────▼───┐
                     │                 PostgreSQL 16                   │
                     └─────────────────────────────────────────────────┘
```

## Services

| Service            | Rôle                                               | Port interne | Base          |
|--------------------|----------------------------------------------------|--------------|---------------|
| `gateway`          | Reverse proxy nginx, routage `/api/*` et `/` (variable `RESOLVER` : DNS Docker ou kube-dns) | 80 | — |
| `frontend`         | SPA React (hero animé, compétences, projets, contact) | 80         | —             |
| `profile-service`  | Profil, compétences, expériences                   | 3001         | `profile_db`  |
| `projects-service` | Projets du portfolio                               | 3002         | `projects_db` |
| `contact-service`  | Réception des messages du formulaire de contact    | 3003         | `contact_db`  |
| `postgres`         | PostgreSQL 16, une base par service                | 5432         | —             |

## Design patterns utilisés

- **Database per service** : chaque microservice possède sa base, aucun partage de schéma.
- **API Gateway** : un seul point d'entrée nginx, le front ne connaît pas les services.
- **Architecture hexagonale** par service : `domain` (entités + ports) → `application` (cas d'usage) → `infrastructure` (PostgreSQL) → `http` (contrôleurs).
- **Repository pattern** : les cas d'usage dépendent d'une interface, l'implémentation PostgreSQL est injectée.
- **Dependency Injection** via une composition root (`src/index.ts`) et une factory `buildApp(deps)` → tests sans base.
- **Singleton** pour le pool PostgreSQL, **Factory** pour l'application Fastify.
- **DTO + validation** `zod` en entrée (API) et sur la configuration (fail-fast au démarrage).
- **Adapter** côté front : `api/client.ts` isole `fetch`, avec **fallback** sur des données statiques si l'API est indisponible (le site reste utilisable sur Firebase Hosting seul).
- **Migrations idempotentes** exécutées au démarrage de chaque service.

## Démarrage local

```bash
cp .env.example .env
make up          # build + lance tout
make logs
```

- Site : http://localhost:8080
- API : http://localhost:8080/api/profile — /api/projects — /api/contact (POST)
- Health : http://localhost:8080/api/profile/health

Mode développement front avec hot-reload :

```bash
cd frontend && npm install && npm run dev   # http://localhost:5173, proxy /api → gateway
```

## Tests et qualité

```bash
make test        # tests unitaires de chaque service (vitest) + typecheck
make lint
```

## Pipeline CI/CD (`.github/workflows/ci.yml`)

1. **test** : lint + typecheck + tests unitaires pour chaque service et le front (matrice).
2. **build** : images Docker poussées sur **GitHub Container Registry** (`ghcr.io`, gratuit).
3. **deploy-frontend** : `firebase deploy --only hosting` (plan Spark, gratuit).
4. **deploy-k8s** : `kubectl apply -k infra/k8s/overlays/prod` sur le cluster cible.

### Secrets GitHub à créer

| Secret                     | Usage                                                                 |
|----------------------------|-----------------------------------------------------------------------|
| `FIREBASE_SERVICE_ACCOUNT` | JSON du compte de service Firebase (`firebase init hosting:github`)   |
| `FIREBASE_PROJECT_ID`      | ID du projet Firebase                                                 |
| `KUBE_CONFIG`              | kubeconfig (base64) du cluster Kubernetes                             |
| `VITE_API_URL`             | URL publique de la gateway (ex. `https://api.sasah.dev`)              |

### Hébergement gratuit

- **Front** : Firebase Hosting (Spark).
- **Kubernetes** : Oracle Cloud *Always Free* (OKE, 4 OCPU ARM / 24 Go) ou un cluster `kind`/`k3s` sur une VM gratuite. Les manifests sont dans `infra/k8s` (Kustomize, base + overlay prod).
- **Images** : GHCR, gratuit pour les dépôts publics.

## Publier sur GitHub

```bash
git remote add origin git@github.com:vahinalaRalison/sasah-portfolio.git
git push -u origin main
```

## Personnaliser le contenu

Les données initiales (profil, compétences, expériences, projets) sont dans les migrations SQL
`services/*/migrations/002_seed.sql` et dupliquées en fallback dans `frontend/src/data/fallback.ts`.
## Le jeu (`frontend/src/game/`)

Par défaut le portfolio est un jeu de plateforme : le cheval blanc emmène la princesse, escortée de sa
meute, à travers six terres. **← →** (ou Q / D) pour avancer et reculer, **↑** ou **Espace** pour sauter,
boutons tactiles sur mobile. On ramasse des **étoiles** (les roses demandent un saut) et on découvre
les **points d'intérêt** (panneaux) : chaque terre dévoile une partie du profil (bio, compétences par
catégorie, expériences, projets, contact). La carte d'information est fichée sous le HUD, à position et
taille fixes : seul son contenu change (et défile). Position et progression sont sauvegardées dans
`localStorage`. Au bout du voyage, franchir la **porte du château du bal** fait entrer la princesse et sa
meute : un **bilan** donne un titre honorifique selon les étoiles ramassées (d'Apprentie Princesse à Reine
du Royaume), puis le jeu bascule en mode lecture.

Pour le plaisir : **↓** (ou S, ou le bouton ♥ sur mobile) fait cabrer le cheval, aboyer les chiens et
s'envoler des cœurs ; les étoiles enchaînées rapidement forment un **combo** ; sans commande pendant six
secondes, le cheval broute et la meute s'occupe (roulade, zoomies) ; des **sons synthétisés** (WebAudio,
aucun fichier) accompagnent sauts, étoiles, panneaux et fanfare, coupables depuis le HUD, qui affiche aussi
la progression dans le royaume.

- `world.ts` : dimensions, génération des points d'intérêt depuis les données et des étoiles (déterministe).
- `physics.ts` : simulation pure (accélération, frottement, gravité, saut, collisions), testée dans `physics.test.ts`.
- `useGame.ts` : boucle `requestAnimationFrame`, clavier/tactile, écriture directe du DOM (aucun rendu React par frame),
  événements discrets vers React (terre, étoile, point d'intérêt).
- `score.ts` : combos d'étoiles et titres de fin, testés dans `score.test.ts` ; `sound.ts` : synthèse des sons.
- `Horse.tsx` : cheval réaliste (membres articulés en deux segments, crinière, queue) animé en CSS selon `data-state` (idle/move/jump/rear/enter) et `data-idle`.
- `Finale.tsx` : bilan du voyage à l'entrée du château.
- `../journey/Dogs.tsx` : les quatre cotons de Tuléar (`Pack`), partagés avec le mode lecture ; ils suivent le cheval avec un léger retard.
- Sur petit écran, tout le monde (sol, décors, cheval, meute) est réduit par la variable CSS `--scale` (lue par `useGame`), les coordonnées restent en px monde.
- `Game.tsx`, `Scenery.tsx`, `PoiCard.tsx`, `Hud.tsx`, `TouchControls.tsx` : scène, décors, cartes, HUD, boutons.

Le bouton **Mode lecture** bascule vers la page classique (ci-dessous), et inversement avec **Jouer**.

## Le mode lecture (`frontend/src/journey/`)

`lands.ts` définit les six terres (nom, décor, section),
`useJourney` traduit le défilement en progression, `JourneyTrack` affiche le bandeau fixe avec le décor
de la terre active et le cheval qui galope, `KingdomMap` dessine la carte cliquable du hero et
`Section` révèle le contenu d'une terre à l'arrivée du cheval. Pour ajouter une terre : une entrée
dans `LANDS`, un décor dans `Terrain.tsx`, un point dans `KingdomMap.tsx` et une `<Section land="…">`.
