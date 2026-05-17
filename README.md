# Reutilisable

Application d'authentification — stack Angular 21 + NestJS 11.

Deux projets indépendants (pas de monorepo) :

```
login/           → Frontend Angular 21
server-login/    → Backend NestJS 11
```

---

## Prérequis

- Node.js >= 22
- PostgreSQL (accessible avec les identifiants dans `.env`)
- npm (inclus avec Node.js)

---

## Installation

```bash
# Backend
cd server-login
npm install
cp .env .env.local   # ajuster si besoin

# Frontend
cd ../login
npm install
```

### Configuration backend

Copier `server-login/.env` et adapter selon votre environnement PostgreSQL :

| Variable              | Valeur par défaut |
| --------------------- | ----------------- |
| `DB_HOST`             | `localhost`       |
| `DB_PORT`             | `5432`            |
| `DB_NAME`             | `auth_db`         |
| `DB_USER`             | `postgres`        |
| `DB_PASS`             | `admin`           |
| `JWT_ACCESS_SECRET`   | requis            |
| `JWT_REFRESH_SECRET`  | requis            |
| `JWT_ACCESS_EXPIRES`  | `15m`             |
| `JWT_REFRESH_EXPIRES` | `7d`              |
| `PORT`                | `3000`            |

Les tables PostgreSQL sont créées automatiquement au démarrage (`synchronize: true`).

---

## Utilisateurs de test

Deux utilisateurs sont automatiquement créés au premier démarrage du backend :

| Email           | Mot de passe | Rôle  |
| --------------- | ------------ | ----- |
| `admin@app.com` | `123456`     | admin |
| `user@app.com`  | `123456`     | user  |

---

## Lancer l'application

```bash
# Terminal 1 — Backend (http://localhost:3000)
cd server-login
npm run start:dev

# Terminal 2 — Frontend (http://localhost:4200)
cd login
npm start
```

Ouvrir `http://localhost:4200` et se connecter avec un des utilisateurs de test.

---

## Commandes disponibles

### Frontend (`login/`)

| Commande        | Action                                        |
| --------------- | --------------------------------------------- |
| `npm start`     | Serveur de développement (:4200, live reload) |
| `npm run build` | Build de production → `dist/`                 |
| `npm test`      | Tests unitaires (Vitest)                      |

### Backend (`server-login/`)

| Commande            | Action                                       |
| ------------------- | -------------------------------------------- |
| `npm run start:dev` | Serveur de développement (:3000, watch mode) |
| `npm run build`     | Compilation → `dist/`                        |
| `npm test`          | Tests unitaires (Jest)                       |
| `npm run test:e2e`  | Tests d'intégration (supertest)              |
| `npm run test:cov`  | Couverture de code                           |
| `npm run lint`      | Lint ESLint (+ fix automatique)              |
| `npm run format`    | Formatage Prettier                           |

---

## Architecture

### Backend (`server-login/`)

```
src/
├── main.ts              → Point d'entrée, configuration globale
├── app.module.ts        → Module racine (DB, JWT, validation)
├── user/                → Entité User + service TypeORM
├── auth/                → Auth complète (JWT, guards, strategies)
├── admin/               → Endpoints réservés aux admins
└── common/              → Filtres, helpers transverses
```

L'API est préfixée par `/api` (ex : `POST /api/auth/login`).

### Frontend (`login/`)

```
src/
├── main.ts              → Bootstrap Angular (standalone)
├── app/
│   ├── app.ts           → Composant racine
│   ├── app.routes.ts    → Routes lazy loadées
│   ├── app.config.ts    → Providers globaux
│   ├── auth/            → Store, services, guards, interceptors
│   └── pages/           → Pages (login, forbidden)
```

Architecture standalone (pas de `NgModule`). État géré avec `@ngrx/signals`.

---

## Flux d'authentification

1. L'utilisateur se connecte → `POST /api/auth/login`
2. Le backend renvoie `{ user, tokens }` avec access token + refresh token
3. Les tokens sont stockés dans `sessionStorage`
4. Le refresh token est stocké hashé en base de données côté backend
5. À chaque requête, un intercepteur attache `Authorization: Bearer <token>`
6. En cas d'expiration, le store tente un refresh automatique
7. Au démarrage de l'app, `restoreSession()` valide/renew la session

---

## Tests

```bash
# Backend : tests unitaires + e2e
cd server-login
npm test
npm run test:e2e

# Frontend : tests unitaires
cd login
npm test
```
