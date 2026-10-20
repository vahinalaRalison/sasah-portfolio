# Déploiement Kubernetes

Manifests Kustomize : `base/` (générique) + `overlays/prod/` (images GHCR, CORS, domaine).

## Cluster gratuit

- **Oracle Cloud Always Free** : OKE avec 4 OCPU ARM / 24 Go, gratuit à vie. Installer `ingress-nginx` et `cert-manager`.
- **Alternative** : `k3s` sur une VM gratuite (Oracle, Google e2-micro) ou `kind` en local pour tester.

```bash
# Test local
kind create cluster --name sasah
kubectl apply -k infra/k8s/overlays/prod
```

## Première mise en place

1. Remplacer `OWNER` dans `overlays/prod/kustomization.yaml` par ton compte GitHub et `api.sasah.example` par ton domaine.
2. Créer les secrets (voir commentaires dans `overlays/prod/kustomization.yaml`).
3. Ajouter le secret GitHub `KUBE_CONFIG` : `base64 -w0 ~/.kube/config`.
4. Pousser sur `main` : le pipeline construit les images puis applique l'overlay.

## Vérifier

```bash
kubectl -n sasah get pods
kubectl -n sasah logs deploy/profile-service
curl https://api.<ton-domaine>/api/profile/health
```
