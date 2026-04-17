# API v1 — Access + Refresh Token Flow

Phase 2 §6.1.1–§6.1.4 of the external API client plan. Introduces refresh tokens and a real logout revoke path on top of the existing Bearer JWT access token.

**HTTPS prerequisite:** this flow depends on Phase 0 ([`OPS_TLS_AND_HTTPS.md`](OPS_TLS_AND_HTTPS.md)). Access JWTs and refresh tokens over HTTP can be captured by an on-path observer; do not enable refresh in an environment where `curl -sI http://host/` does not return a `301` to HTTPS.

## Endpoints

| Method | Path                    | Auth             | Notes                                                      |
| ------ | ----------------------- | ---------------- | ---------------------------------------------------------- |
| POST   | `/api/v1/auth/login`    | public           | Returns `accessToken` + `refreshToken` (when enabled)      |
| POST   | `/api/v1/auth/refresh`  | refresh in body  | Rotates refresh, returns new `accessToken` + `refreshToken`|
| POST   | `/api/v1/auth/logout`   | refresh in body  | Revokes the current refresh row (best-effort)              |
| GET    | `/api/v1/auth/me`       | Bearer (access)  | Unchanged                                                  |

## Request / response shapes

### `POST /auth/login`

```jsonc
// request
{ "username": "alice", "password": "…" }

// 200 response (envelope)
{
  "data": {
    "accessToken": "<jwt>",
    "tokenType": "Bearer",
    "expiresInSeconds": 900,
    "refreshToken": "<jwt>",
    "refreshExpiresInSeconds": 2592000,
    "user": { "id": "…", "username": "alice", "role": "USER" }
  },
  "meta": {},
  "errors": []
}
```

### `POST /auth/refresh`

Request body: `{ "refreshToken": "<previous>" }`. Response mirrors `/auth/login`; the old refresh row is revoked and a new one is issued with `rotated_from_jti` pointing at the parent.

Error codes: `REFRESH_INVALID` (bad JWT / unknown row), `REFRESH_EXPIRED` (row past `expires_at`), `REFRESH_REUSED` (token belongs to a row that was already rotated — the whole family is revoked).

### `POST /auth/logout`

Request body: `{ "refreshToken": "<current>" }` (optional). Always returns `{ "data": { "loggedOut": true }, ... }`. When the refresh token is valid, its row is revoked synchronously.

## Data model

`refresh_tokens` is the single source of truth:

```sql
id UUID PK
jti UUID UNIQUE          -- matches the JWT jti claim
user_id UUID FK users    -- cascade on user delete
expires_at TIMESTAMPTZ
revoked_at TIMESTAMPTZ?  -- non-null means revoked
created_at TIMESTAMPTZ
rotated_from_jti UUID?   -- chain pointer for family revocation
```

Schema migration: [`migrations/V275__Create_refresh_tokens.sql`](../../migrations/V275__Create_refresh_tokens.sql). Additive; a reversible drop migration is maintained out-of-tree and never executed by rollback.

## Env vars / kill switches

- `JWT_ACCESS_TTL` — access token TTL (default `15m`). Legacy `JWT_EXPIRES_IN` still honored.
- `JWT_REFRESH_TTL_SECONDS` — refresh token TTL in seconds (default 30 days).
- `JWT_SECRET` — required in production; used for both access and refresh JWTs (different issuer claim).
- `DISABLE_AUTH_REFRESH=1` — kill switch. Login returns the legacy shape (no `refreshToken`), `/auth/refresh` returns `501 REFRESH_DISABLED`, `/auth/logout` no-ops.

## Validation plan

### Automated (unit)

- `tests/unit/refreshTokenService.test.ts` — issue, verify, rotate, reuse revokes the whole family, expired rejects, unknown rejects.

### Automated (integration)

- `tests/integration/refresh-happy.test.ts`
- `tests/integration/refresh-expired.test.ts`
- `tests/integration/refresh-reuse-revokes-family.test.ts`
- `tests/integration/logout-revokes-refresh.test.ts`

All integration tests MUST follow the **Database Cleanup Requirements** rule in [`.cursorrules`](../../.cursorrules) — use `try/finally`, track created users/decks, and restore state regardless of test success.

### Manual smoke (Insomnia "Phase 2 smoke" folder)

1. `POST /auth/login` → capture `refreshToken`.
2. `POST /auth/refresh` with the captured token → new pair; old one is now revoked.
3. `POST /auth/refresh` again with the original (now rotated) token → `401 REFRESH_REUSED`.
4. `POST /auth/logout` with the latest `refreshToken` → `200`; a subsequent `/auth/refresh` with it returns `401`.

### Observability

- `SELECT count(*) FROM refresh_tokens WHERE revoked_at IS NULL AND expires_at > now();` tracks active sessions.
- pino logs show `route=POST /api/v1/auth/refresh` entries; correlate via `request_id`.

## Rollback plan

1. Set `DISABLE_AUTH_REFRESH=1` (fast path; no redeploy needed once SSM param is updated and app is restarted).
2. If the flag is insufficient: `git revert` the Phase 2 auth commit. The `refresh_tokens` table is additive and safe to leave in place.
3. The reversible drop migration `migrations/reversible/V###__drop_refresh_tokens.sql` exists as a last resort; never run it as part of normal rollback.

## Related docs

- [`API_V1.md`](../../API_V1.md) — public contract (updated with refresh fields).
- [`API_V1_RATE_LIMITS.md`](API_V1_RATE_LIMITS.md) — per-route budgets including `/auth/login` and `/auth/refresh`.
- [`API_V1_VALIDATION.md`](API_V1_VALIDATION.md) — body validation helpers used by these endpoints.
- [`API_V1_AUDIT_LOG.md`](API_V1_AUDIT_LOG.md) — how these requests show up in `api_access_log`.
