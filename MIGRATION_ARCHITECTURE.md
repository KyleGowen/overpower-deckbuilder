# API migration architecture (Excelsior)

Human-readable companion to [`src/api/.cursorrules`](src/api/.cursorrules). Describes how legacy routes and `/api/v1` share **services** while keeping HTTP adapters thin.

## Layer diagram

```mermaid
flowchart TB
  subgraph http [HTTP boundary]
    Legacy[src/routes legacy thin delegates]
    V1Routers[src/api/http *.http.ts]
  end
  subgraph app [Application layer]
    Services[src/api/services]
  end
  subgraph infra [Infrastructure]
    Repos[src/database repositories]
  end
  Legacy --> Services
  V1Routers --> Services
  Services --> Repos
```

## Layering rules (summary)

| Layer | Responsibility | Forbidden |
|-------|----------------|-----------|
| **HTTP / `*.http.ts`** | Routing, validate → **request models**, call **one** service method, map to **response DTO** / v1 envelope | Business rules, direct DB calls, inline request/response type definitions |
| **Services** | Business logic, orchestration, domain authz | `req` / `res`, HTTP status codes inside core logic |
| **Repositories** | SQL / persistence | HTTP concepts |
| **Request models** | One file per body/query/param contract | Ad hoc `req.body` typing as source of truth in routes |
| **Response DTOs** | One file per public response shape | Anonymous-only responses in route files |

**Admin:** Operations requiring `ADMIN` or cross-tenant access **must** be registered only under **`/api/v1/admin/...`**. Non-`/admin` handlers **must not** call admin-privileged service entry points. No client-supplied `isAdmin` / `role` flags.

**Passwords:** v1 login issues JWT **after** existing `AuthenticationService` / repository password verification. **No** hashing algorithm changes, bcrypt cost changes, or password storage migrations in this program.

## Route file grouping (`src/api/http/`)

1. **`auth.http.ts`** — `/auth/login`, `/auth/logout`, `/auth/me`, token behavior.
2. **`dbv-catalog.http.ts`** — Card catalog reads backing the Database View.
3. **`dbv-support.http.ts`** — Sets, deck-backgrounds, etc.
4. **`decks.http.ts`** (+ optional split) — User-scoped decks.
5. **`collections.http.ts`**, **`guest-decks.http.ts`**, **`admin.http.ts`** — As migrations reach those domains.

Registration: `registerApiV1Routes(app, deps)` in [`src/api/http/registerApiV1Routes.ts`](src/api/http/registerApiV1Routes.ts).

## Documentation

- **Legacy:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **v1:** [API_V1.md](API_V1.md) (sole place for `/api/v1` contract)
- **Checklist:** [API_MIGRATION_CHECKLIST.md](API_MIGRATION_CHECKLIST.md)

## Testing (mandatory)

- **Services + DTO mappers:** unit tests (`tests/unit/`).
- **Each `*.http.ts`:** full unit coverage (every route, success + key error branches, mocked deps).
- **Each `*.http.ts`:** ≥1 integration test (e.g. Supertest, real middleware + envelope).
- **Legacy + v1:** when both exist, integration tests should keep behavior aligned until cutover.

## JWT configuration

- **`JWT_SECRET`:** required when `NODE_ENV=production`; optional in development/test with a documented dev default (never use the default in production).
- **`JWT_EXPIRES_IN`:** optional (e.g. `2h`). Align TTL with product policy.
- **Deploy:** add `JWT_SECRET` to GitHub Actions secrets (or your secret store) and append to server `.env` on deploy—do not commit secrets.

## Optional standalone API process

To run **only** the JSON API on another port, compose the same **`RegisterApiV1Deps`** as [`src/index.ts`](src/index.ts), create an `express()` app with `express.json()` (and any shared security middleware you need), then `app.use('/api/v1', createApiV1Router(deps))` and `listen(process.env.API_STANDALONE_PORT)`. **`createApiV1Router`** is exported from [`src/api/http/registerApiV1Routes.ts`](src/api/http/registerApiV1Routes.ts) alongside **`registerApiV1Routes`**. No default npm script is required; document the port in ops runbooks when used.
