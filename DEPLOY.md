# Mettre l'API en ligne et administrer le site en direct

Le front (jeu + mode lecture + `/admin`) est servi par **Firebase Hosting**. Pour que les données
affichées soient celles de la base et que l'espace admin fonctionne depuis n'importe où, l'API doit
tourner sur un serveur joignable en HTTPS. Une fois en place, plus aucun export statique n'est
nécessaire : une modification dans `/admin` est visible immédiatement sur le site.

Deux options : un **serveur Docker** (le plus simple, ci-dessous) ou **Kubernetes**
(voir `infra/k8s/README.md`, même pipeline).

## 1. Sur le serveur (une fois)

Prérequis : Docker + Docker Compose, un nginx avec Certbot (comme sur les serveurs RXG), un
sous-domaine `api.<ton-domaine>` qui pointe vers le serveur.

```bash
mkdir -p ~/sasah && cd ~/sasah
curl -fsSLO https://raw.githubusercontent.com/vahinalaRalison/sasah-portfolio/main/docker-compose.api.yml
mkdir -p infra/postgres/init
curl -fsSL https://raw.githubusercontent.com/vahinalaRalison/sasah-portfolio/main/infra/postgres/init/01-databases.sql \
  -o infra/postgres/init/01-databases.sql

cat > .env <<EOF
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=')
ADMIN_PASSWORD=<ton mot de passe admin, 8 caractères minimum>
ADMIN_SECRET=$(openssl rand -base64 32 | tr -d '/+=')
CORS_ORIGIN=https://sasah-potforlio.web.app,https://sasah-potforlio.firebaseapp.com
FRONTEND_URL=https://sasah-potforlio.web.app
GATEWAY_PORT=127.0.0.1:8081
EOF
chmod 600 .env

docker compose -f docker-compose.api.yml pull
docker compose -f docker-compose.api.yml up -d
curl http://127.0.0.1:8081/api/profile/health   # {"status":"ok",...}
```

Les images GHCR sont publiques : aucun `docker login` nécessaire. Les migrations (schéma, données
initiales, table du CV) s'appliquent au premier démarrage.

### Vhost nginx + TLS

```nginx
server {
    server_name api.<ton-domaine>;
    client_max_body_size 10m;          # envoi du CV depuis l'admin
    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo certbot --nginx -d api.<ton-domaine>
curl https://api.<ton-domaine>/api/profile/health
```

## 2. Dans GitHub (secrets du dépôt)

| Secret | Valeur | Rôle |
|---|---|---|
| `VITE_API_URL` | `https://api.<ton-domaine>/api` | Le front Firebase interroge cette API |
| `DEPLOY_HOST` | `api.<ton-domaine>` ou l'IP | Mise à jour automatique à chaque push |
| `DEPLOY_USER` | utilisateur SSH | idem |
| `DEPLOY_SSH_KEY` | clé privée SSH (ed25519) dédiée | idem |
| `DEPLOY_PATH` | `/home/<user>/sasah` | dossier contenant `docker-compose.api.yml` |

Les trois derniers sont facultatifs : sans eux, le job « Deploy API (serveur) » est ignoré et tu mets
à jour à la main avec `docker compose -f docker-compose.api.yml pull && … up -d`.

Puis un push sur `main` : le pipeline teste, construit les images, redéploie le front avec la bonne
URL d'API et met à jour le serveur.

## 3. Se connecter

Ouvrir **https://sasah-potforlio.web.app/admin** (ou en local http://localhost:8080/admin), saisir
`ADMIN_PASSWORD`. Tu es la seule à connaître ce mot de passe : il n'y a pas de comptes, un jeton signé
valable 12 h est gardé dans l'onglet, et cinq échecs bloquent l'adresse IP pendant 15 minutes.

Pour changer le mot de passe : modifier `ADMIN_PASSWORD` dans le `.env` du serveur puis
`docker compose -f docker-compose.api.yml up -d`.

## Sauvegarde

Toute la donnée est dans le volume `pgdata`. Sauvegarde :

```bash
docker compose -f docker-compose.api.yml exec -T postgres pg_dumpall -U sasah | gzip > sasah-$(date +%F).sql.gz
```
