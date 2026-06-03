# Reutilisable

Application d'authentification — stack Angular 21 + NestJS 11.

Deux projets indépendants (pas de monorepo) :

```
login/           → Frontend Angular 21 (port 4200)
server-login/    → Backend NestJS 11 (port 3000)
```

Un workspace VS Code multi-projets est disponible à la racine : `reutilisable.code-workspace`.

---

## Prérequis

- Node.js >= 22
- PostgreSQL
- npm (inclus avec Node.js, packagemanager: npm@11.6.2)

---

## Installation

```bash
# Backend
cd server-login
npm install
cp .env .env.local   # ajuster selon votre PostgreSQL

# Frontend
cd ../login
npm install
```

### Configuration backend

Copier `.env` → `.env.local` et adapter les variables :

| Variable              | Défaut            |
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

Les tables PostgreSQL sont créées automatiquement au démarrage (`synchronize: true`, dev uniquement).

---

## Mock mode (défaut)

Le frontend fonctionne **sans backend réel** grâce à `MockAuthService`, injecté par défaut dans l'intercepteur (`auth.interceptor.ts`). Deux utilisateurs mock sont disponibles :

| Email           | Mot de passe |
| --------------- | ------------ |
| `admin@app.com` | `123456`     |
| `user@app.com`  | `123456`     |

Pour utiliser le vrai backend, remplacer `MockAuthService` → `AuthService` dans `auth.interceptor.ts`.

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

Ouvrir `http://localhost:4200` et se connecter avec un des utilisateurs mock.

---

## Commandes disponibles

### Frontend (`login/`)

| Commande              | Action                                       |
| --------------------- | -------------------------------------------- |
| `npm start`           | Serveur de développement (:4200, live reload) |
| `npm run build`       | Build production → `dist/login/browser`      |
| `npm run build --configuration development` | Build développement            |
| `npm test`            | Tests unitaires (Vitest)                     |

### Backend (`server-login/`)

| Commande            | Action                                       |
| ------------------- | -------------------------------------------- |
| `npm run start:dev` | Serveur de développement (:3000, watch mode) |
| `npm run build`     | Compilation → `dist/`                        |
| `npm test`          | Tests unitaires (Jest)                       |
| `npm run test:e2e`  | Tests d'intégration (supertest, `test/*.e2e-spec.ts`) |
| `npm run test:cov`  | Couverture de code                           |
| `npm run lint`      | Lint ESLint (+ fix automatique)              |
| `npm run format`    | Formatage Prettier                           |

---

## Architecture

### Backend (`server-login/`)

```
src/
├── main.ts              → Point d'entrée, CORS, ValidationPipe, filtre global
├── app.module.ts        → Module racine (DB, JWT, validation, i18n)
├── user/                → Entité User + CRUD TypeORM
├── auth/                → Login, Refresh, Logout, Profile, JWT guards, strategies
├── admin/               → Endpoints réservés (rôle admin/user)
└── common/              → HttpExceptionFilter (code + message)
```

L'API est préfixée par `/api` (ex : `POST /api/auth/login`).

### Frontend (`login/`)

```
src/
├── main.ts              → Bootstrap Angular (standalone)
├── environments/        → environment.ts (dev) / environment.prod.ts (prod)
└── app/
    ├── app.ts           → Composant racine (swithcer langue EN/FR)
    ├── app.config.ts    → Providers : router, HttpClient, interceptor, restoreSession()
    ├── app.routes.ts    → Routes lazy loadées
    ├── i18n/            → Service de traduction FR/EN (signal-based, localStorage)
    ├── auth/            → Store (@ngrx/signals), services, guards, interceptors
    └── pages/           → Pages (login, dashboard, admin, forbidden)
```

- Architecture standalone (pas de `NgModule`)
- État géré avec `@ngrx/signals`
- i18n FR/EN — commutation en haut à droite, persistance dans `localStorage`
- Intercepteur auth : attache le Bearer token + refresh automatique anti-cascade

---

## Flux d'authentification

1. L'utilisateur se connecte → `POST /api/auth/login`
2. Le backend renvoie `{ user, tokens }` avec access token + refresh token
3. Les tokens sont stockés dans `sessionStorage`
4. Le refresh token est stocké hashé en base de données côté backend
5. À chaque requête, un intercepteur attache `Authorization: Bearer <token>`
6. En cas d'expiration, le store tente un refresh automatique (anti-cascade)
7. Au démarrage de l'app, `restoreSession()` valide/renew la session

---

## Environnements

Deux fichiers d'environnement Angular sont remplacés automatiquement à la compilation :

| Fichier | Usage | `apiUrl` |
|---|---|---|
| `src/environments/environment.ts` | `npm start` / `npm run build --configuration development` | `http://localhost:3000/api` |
| `src/environments/environment.prod.ts` | `npm run build` (défaut) | `/api` |

Le backend NestJS charge `.env`, surchargeable par `.env.local` (déjà ignoré par git).

---

## Documentation

L'architecture détaillée est dans le dossier `docs/` :

- `docs/backend.md` — Routes API, sécurité, tests backend
- `docs/frontend.md` — Composants, guards, flux, tests frontend
- `docs/liaison.md` — Contrats d'interface frontend ↔ backend, gestion d'erreurs, refresh

---

## Style et conventions

- Backend : Prettier (`.prettierrc` : singleQuote, trailingComma all)
- Frontend : Prettier inline (`package.json` : singleQuote, printWidth 100)
- Backend ESLint : TypeScript-typed rules, `no-explicit-any` off
- Tests à côté des sources (`*.spec.ts`)
- Routes Angular lazy loadées via `loadComponent`
- Tous les formulaires utilisent `ReactiveFormsModule`
- Réponses d'erreur : `{ code: string, message: string }`
