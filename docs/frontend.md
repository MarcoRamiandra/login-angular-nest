# Frontend — Architecture

Stack : Angular 21 (standalone components) + @ngrx/signals + Tailwind CSS v4 + Vitest

```
login/src/
├── main.ts                     → Bootstrap (bootstrapApplication)
├── index.html
├── styles.css                  → Tailwind
├── app/
│   ├── app.ts                  → Composant racine (RouterOutlet)
│   ├── app.config.ts           → Providers : router, HttpClient, interceptor, restoreSession()
│   ├── app.routes.ts           → Routes lazy loadées (login, dashboard, admin, forbidden)
│   ├── app.spec.ts
│   │
│   ├── auth/                   ← Cœur de l'authentification
│   │   ├── store/auth.store.ts → État global (signalStore ngrx)
│   │   ├── services/
│   │   │   ├── auth.service.ts      → Appels HTTP vers /api/auth/*
│   │   │   ├── mock-auth.service.ts → Version mock avec utilisateurs hardcodés
│   │   │   └── token.service.ts     → sessionStorage (save/get/clear/isValid)
│   │   ├── guards/
│   │   │   ├── auth.guard.ts    → Redirige vers /login si non connecté
│   │   │   ├── login.guard.ts   → Redirige vers /dashboard si déjà connecté
│   │   │   └── role.guard.ts    → Vérifie le rôle (admin/user)
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts → Attache le Bearer token, gère le refresh 401
│   │   ├── models/
│   │   │   ├── User.model.ts        → { id, email, role }
│   │   │   ├── AuthTokens.model.ts  → { accessToken, refreshToken, expiresAt }
│   │   │   ├── LoginCredentials.model.ts → { email, password }
│   │   │   └── AuthStatus.model.ts  → codes d'erreur possibles
│   │   └── components/
│   │       └── logout-button/
│   │
│   └── pages/
│       ├── login/              → Formulaire de connexion (ReactiveForms)
│       ├── dashboard/
│       ├── admin/
│       └── forbidden/
```

## Flux principal

1. L'utilisateur arrive sur `/login`
2. `provideAppInitializer` → `restoreSession()` → valide le token stocké ou tente un refresh
3. Connexion : `AuthStore.login()` → `AuthService.login()` → `POST /api/auth/login`
4. Succès : tokens dans sessionStorage, état `success`, redirection vers `/dashboard`
5. Échec : état `error`, message affiché via `storeErrorMessage`
6. Chaque requête passe par `authInterceptor` qui ajoute `Authorization: Bearer`
7. Si 401 : tentative de refresh automatique (anti-cascade avec verrou)
8. Si refresh échoue : `expireSession()` → déconnexion + message "Session expirée"

## Tests

```
npm test     → Vitest (via @angular/build:unit-test)
```

Les tests sont en `.spec.ts` à côté des sources.
