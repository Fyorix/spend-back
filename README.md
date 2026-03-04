# Spend App - Backend Architecture

Ce dépôt contient l'ensemble des microservices pour le backend de l'application **Spend**.

## 🏗️ Architecture des Microservices

L'architecture est basée sur des microservices NestJS communiquant en temps réel via un système **Redis Pub/Sub**.

### Liste des services et ports vers lesquels ils pointent :

| Service | Port par défaut | Description |
| :--- | :---: | :--- |
| **ws-service** | `3001` | Service de gestion des WebSockets (émetteur central). |
| **geolocalisation-service** | `3002` | Service de gestion de la géolocalisation. |
| **file-service** | `3003` | Service de gestion des fichiers. |
| **user-service** | `3004` | Service de gestion des utilisateurs. |
| **account-service** | `3005` | Service de gestion des comptes. |

---

## 📡 Système Pub/Sub (Redis)

Le système de communication temps réel utilise Redis comme "message broker".

### 1. Publication (Pub)
Chaque microservice (comme `file-service` ou `geolocalisation-service`) possède un `RedisPubService`. 
Lorsqu'un événement survient (ex: upload d'un fichier, mise à jour de position), le service publie un message sur un canal Redis spécifique.

### 2. Abonnement (Sub)
Le **ws-service** est abonné à tous les canaux pertinents. Lorsqu'il reçoit un message Redis :
1. Il délègue le traitement à un `HandlerRegistry`.
2. Le handler correspondant utilise le `WsEmitterService` pour renvoyer l'événement aux clients WebSockets (Socket.io) concernés.

### 🧪 Canaux Redis utilisés :
- `notification` : Pour les notifications globales ou ciblées.
- `file_events` : Pour les mises à jour sur l'état des fichiers (upload terminé, erreur).
- `geolocation_updates` : Pour le suivi en temps réel des positions.
- `user_events` : Pour les changements d'état utilisateur.
- `broadcast` : Pour les messages à destination de TOUS les utilisateurs.

---

## ⚙️ Développement (Local)

### 🛠️ Installation

Le projet utilise désormais **Yarn Workspaces** avec un linker `node-modules` pour une gestion centralisée et robuste des dépendances.

1. **Installation globale** (depuis la racine) :
   ```bash
   yarn install
   ```

2. **Configuration VS Code** :
   Ouvrez le fichier `spend-back.code-workspace` dans VS Code pour une expérience multi-services optimale (linting, types, etc.).

### 🚀 Lancement des services

Vous pouvez lancer tous les services en même temps ou individuellement :

**Tout lancer en simultané :**
```bash
yarn dev:all
```
Ce script utilise `concurrently` pour démarrer tous les microservices en mode `watch`.

**Lancer un service spécifique :**
```bash
# Via workspace (depuis la racine)
yarn workspace [nom-du-service] dev

# Ou en entrant dans le dossier
cd [nom-du-service]
yarn dev
```

### 🧪 Tests
```bash
# Lancer les tests de TOUS les services
yarn test:all

# Lancer les tests d'un service spécifique
yarn workspace [nom-du-service] test
```

### ✨ Linting
```bash
# Linter et corriger TOUS les services
yarn lint:all

# Linter un service spécifique
yarn workspace [nom-du-service] lint
```

### 📦 Gestion des dépendances

Avec **Yarn Workspaces**, les dépendances sont centralisées. Vous avez deux façons d'ajouter un package :

**1. Depuis la racine (Recommandé) :**
```bash
# Ajouter à un microservice spécifique
yarn workspace [nom-du-ms] add [package]

# Ajouter une devDependency
yarn workspace [nom-du-ms] add -D [package]
```

**2. Depuis le dossier du microservice :**
```bash
cd [nom-du-ms]
yarn add [package]
```

**3. Ajouter un package à TOUS les microservices :**
```bash
yarn workspaces foreach add [package]
```

---


## 🚀 Bonnes pratiques

- **Ports** : Assurez-vous que les ports dans `src/config/env.config.ts` n'entrent pas en conflit.
- **Handlers** : Pour chaque nouveau canal Redis ajouté, créez un handler correspondant dans le `ws-service` et enregistrez-le dans le `HandlersModule`.
- **Typage** : Utilisez toujours l'interface `RedisEvent<T>` pour garantir la cohérence des messages entre les services.
