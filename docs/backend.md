# Backend — Architecture

Stack : NestJS 11 + TypeORM + PostgreSQL + JWT (passport-jwt) + class-validator + Jest

```
server-login/src/
├── main.ts                     → Bootstrap, CORS, ValidationPipe global, exception filter
├── app.module.ts               → Module racine (Config, TypeORM, User, Auth, Admin)
├── app.controller.ts           → GET /api (health check)
├── app.service.ts
│
├── user/
│   ├── user.entity.ts          → Entité TypeORM (id, email, password, role, refreshToken)
│   ├── user.module.ts
│   └── user.service.ts         → CRUD user (findByEmail, findById, create, updateRefreshToken)
│
├── auth/
│   ├── auth.controller.ts      → Routes /api/auth/*
│   ├── auth.service.ts         → Login, Register, Refresh, Logout, Profile
│   ├── auth.module.ts          → JwtModule, PassportModule, strategies
│   ├── dto/                    → LoginDto, RegisterDto, RegisterAdminDto (class-validator)
│   ├── guards/                 → JwtAuthGuard, JwtRefreshGuard, RolesGuard
│   ├── strategies/             → JwtStrategy (access), JwtRefreshStrategy (refresh)
│   └── decorators/             → @CurrentUser, @Roles
│
├── admin/
│   ├── admin.controller.ts     → Routes /api/admin/* (protégées par rôle)
│   └── admin.module.ts
│
└── common/
    └── filters/
        └── http-exception.filter.ts → Transforme les erreurs HTTP en { code, message }
```

## Endpoints API (préfixe global `/api`)

| Méthode | Route                    | Auth          | Retour           |
| ------- | ------------------------ | ------------- | ---------------- |
| POST    | /api/auth/register       | -             | User             |
| POST    | /api/auth/login          | -             | { user, tokens } |
| POST    | /api/auth/refresh        | Refresh token | AuthTokens       |
| POST    | /api/auth/logout         | Access token  | { message }      |
| GET     | /api/auth/profile        | Access token  | User             |
| POST    | /api/auth/register-admin | Admin         | User             |
| GET     | /api/admin/dashboard     | Admin         | { message }      |
| GET     | /api/admin/users-area    | Admin/User    | { message }      |
| GET     | /api                     | -             | "Hello World!"   |

## Sécurité

- Mots de passe hashés avec bcrypt (salt rounds: 10)
- Refresh token stocké hashé en base
- JWT access token : 15 min, refresh token : 7 jours
- ValidationPipe global : `whitelist: true`, `transform: true`
- CORS restreint à l'origine Angular (`http://localhost:4200`)
- TypeORM `synchronize: true` (dev uniquement — création auto des tables)

## Tests

```
npm test          → Jest (unitaires, *.spec.ts dans src/)
npm run test:e2e  → Jest + supertest (e2e, *.e2e-spec.ts dans test/)
npm run test:cov  → Couverture
```
