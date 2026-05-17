# Liaison Frontend ↔ Backend

Ce document décrit comment les deux projets communiquent et les contrats qui les lient.

## Communication HTTP

```
Frontend (:4200)  ──HTTP──▶  Backend (:3000/api/auth/*)
                   ◀──JSON──
```

- Le frontend appelle toujours `http://localhost:3000/api/auth/*`
- Le backend a un préfixe global `/api` et un CORS qui autorise uniquement `http://localhost:4200`
- Les tokens JWT sont passés dans l'en-tête `Authorization: Bearer <token>`

## Contrats d'interface

### 1. Connexion — `POST /api/auth/login`

|          | Envoi                                 | Réponse                              |
| -------- | ------------------------------------- | ------------------------------------ |
| Frontend | `{ email: string, password: string }` | `{ user: User, tokens: AuthTokens }` |
| Backend  | `LoginDto` (email, password)          | `{ user: sanitize(user), tokens }`   |

### 2. Refresh — `POST /api/auth/refresh`

|          | Envoi                                          | Réponse                                    |
| -------- | ---------------------------------------------- | ------------------------------------------ |
| Frontend | Header: `Authorization: Bearer <refreshToken>` | `{ accessToken, refreshToken, expiresAt }` |
| Backend  | Extrait le refresh token du header JWT         | `tokens`                                   |

### 3. Profil — `GET /api/auth/profile`

|          | Envoi                                         | Réponse               |
| -------- | --------------------------------------------- | --------------------- |
| Frontend | Header: `Authorization: Bearer <accessToken>` | `{ id, email, role }` |
| Backend  | JwtAuthGuard valide le token                  | `sanitize(user)`      |

### 4. Déconnexion — `POST /api/auth/logout`

|          | Envoi                                                | Réponse               |
| -------- | ---------------------------------------------------- | --------------------- |
| Frontend | Header: `Authorization: Bearer <accessToken>`        | `{ message: string }` |
| Backend  | JwtAuthGuard + invalidation du refresh token en base | `{ message }`         |

## Modèles partagés

### User
```typescript
{ id: string, email: string, role: 'admin' | 'user' }
```

### AuthTokens
```typescript
{ accessToken: string, refreshToken: string, expiresAt: number }
```

### AuthError
```typescript
{ code: 'invalid_credentials' | 'session_expired' | 'unknown', message: string }
```

### LoginCredentials
```typescript
{ email: string, password: string }
```

## Gestion des erreurs

Quand le backend renvoie une erreur HTTP (401, 409, etc.), le **HttpExceptionFilter** transforme la réponse NestJS standard en `{ code, message }`. Le frontend reçoit cette réponse via `HttpClient` qui l'enveloppe dans un `HttpErrorResponse`. Le `AuthStore` désemballe l'objet pour extraire le `code` et le `message`, qui sont ensuite affichés dans le template du formulaire de connexion.

## Flux de refresh automatique

1. Une requête reçoit un 401
2. L'`authInterceptor` vérifie si un refresh est déjà en cours (verrou anti-cascade)
3. Si oui : la requête est mise en attente
4. Si non : il appelle `POST /api/auth/refresh` avec le refresh token
5. Succès : nouveaux tokens stockés, requêtes en attente débloquées, requête originale rejouée
6. Échec : `expireSession()` → déconnexion, message "Session expirée"

## Session persistante

Au démarrage de l'application Angular, `provideAppInitializer` appelle `restoreSession()` :
1. Rien en sessionStorage → état `idle`
2. Token valide → récupération du profil utilisateur
3. Token expiré → tentative de refresh, puis récupération du profil
