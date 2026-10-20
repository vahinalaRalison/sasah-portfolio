.PHONY: help up down build logs ps test lint install clean k8s-apply k8s-delete

SERVICES := profile-service projects-service contact-service
DOCKER   := docker compose

help: ## Affiche cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[35m%-14s\033[0m %s\n", $$1, $$2}'

up: ## Build + lance toute la stack (http://localhost:8080)
	$(DOCKER) up -d --build
	@echo ""
	@echo "  👑  Portfolio : http://localhost:$${GATEWAY_PORT:-8080}"
	@echo "  🔌  API       : http://localhost:$${GATEWAY_PORT:-8080}/api/profile"

down: ## Stoppe la stack
	$(DOCKER) down

build: ## Build toutes les images
	$(DOCKER) build

logs: ## Logs en continu
	$(DOCKER) logs -f --tail=100

ps: ## État des conteneurs
	$(DOCKER) ps

install: ## npm install dans chaque service et le front
	@for s in $(SERVICES); do (cd services/$$s && npm install); done
	@cd frontend && npm install

test: ## Typecheck + tests unitaires (services + front)
	@for s in $(SERVICES); do echo "== $$s"; (cd services/$$s && npm run typecheck && npm test) || exit 1; done
	@echo "== frontend"; cd frontend && npm run typecheck && npm test

lint: ## Lint de tous les projets
	@for s in $(SERVICES); do (cd services/$$s && npm run lint) || exit 1; done
	@cd frontend && npm run lint

clean: ## Supprime conteneurs, volumes et node_modules
	$(DOCKER) down -v
	@rm -rf frontend/node_modules frontend/dist
	@for s in $(SERVICES); do rm -rf services/$$s/node_modules services/$$s/dist; done

k8s-apply: ## Déploie sur le cluster courant (overlay prod)
	kubectl apply -k infra/k8s/overlays/prod

k8s-delete: ## Retire le déploiement
	kubectl delete -k infra/k8s/overlays/prod
