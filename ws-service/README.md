# WS-Service (WebSocket Microservice)

Microservice NestJS dédié à la gestion des WebSockets via Socket.IO. Ce service fait partie de l'écosystème de microservices de l'application **Spend-Back**.

## 🚀 Fonctionnalités

- **NestJS** : Framework TypeScript robuste.
- **Socket.IO** : Communication en temps réel via WebSockets.
- **Yarn PnP** : Gestion des dépendances Plug'n'Play pour des performances accrues.
- **Multi-stage Docker** : Image optimisée pour la production.

## 🛠️ Installation

Ce projet utilise **Yarn Berry** avec PnP. Assurez-vous d'avoir activé `corepack`.

```bash
corepack enable
yarn install
```

## 💻 Développement

Lancer le service en mode développement avec rechargement automatique :

```bash
yarn dev
```

Le service écoute par défaut sur le port **3001**.

## 🐳 Docker (Production)

### Construction de l'image
```bash
docker build -t ws-service .
```

### Lancement du container
```bash
docker run -p 3001:3001 ws-service
```

## 🧹 Lint & Format

```bash
# Vérifier les erreurs de syntaxe
yarn lint

# Formater le code avec Prettier
yarn format
```

## 🧪 Tests Unitaires

Ce microservice suit une stratégie de tests unitaires stricte sans bootstrap de l'application NestJS :

- Fichiers : `*.unit.spec.ts`
- Commande : `yarn test` (si configurée)

> [!IMPORTANT]
> Ne jamais utiliser `Test.createTestingModule` pour les tests unitaires. Instanciez les classes manuellement pour garantir le découplage.
