# API v1 — Health endpoints (Phase 1)

## Why the split

The legacy single `/health` endpoint was public and included sensitive
introspection data (migration versions, guest user count, DB row counts,
memory usage) on every response. Phase 1 split it into a public liveness
probe and an admin-gated deep probe so uptime monitors and load balancers can
hit a safe URL while DB-level details are only returned to authenticated
operators.

See [`src/routes/static-health.routes.ts`](../../src/routes/static-health.routes.ts).

## Endpoints

### `GET /health/live`

- **Auth:** public.
- **Response:** `{ status, timestamp, uptime, version, environment, git }`.
- **Never** touches the database.
- `Cache-Control: no-store`.

Example:

```json
{
  "status": "OK",
  "timestamp": "2026-04-16T20:12:44.123Z",
  "uptime": 12345.678,
  "version": "1.0.0",
  "environment": "production",
  "git": { "shortCommit": "abc1234", "commitMessage": "...", "..." : "..." }
}
```

### `GET /health/deep`

- **Auth:** requires a valid session cookie and `role === 'ADMIN'`.
  Non-admins get `403 { success: false, error: 'Admin access required' }`.
- **Response:** live payload plus `resources.memory`, `resources.cpu`,
  `database.status`, `database.latency`, `database.guestUser`,
  `database.guestDecks`, `database.stats`, `database.migrations.latest`.
- `Cache-Control: no-store`.

### `GET /health` (back-compat)

Callers that have a `sessionId` cookie are treated like the legacy
`/health` and get the deep payload. Callers without a session cookie get the
live payload. This keeps the CI health-check script in
[`.cursorrules`](../../.cursorrules) working without modification.

## CloudFront / caching

Both endpoints emit `Cache-Control: no-store`. CloudFront's default behavior
respects origin cache-control, so these are never cached at the edge. Phase 3
catalog caching (see `API_V1_CATALOG_CACHING.md`) does **not** apply to
`/health/*`.

## Kill switch

`DISABLE_HEALTH_SPLIT=1` routes `/health/live` and `/health/deep` to the
combined legacy payload so a broken split does not brick uptime monitors.
The admin check is also bypassed while the kill switch is set — use only as
an emergency revert.

Revert: `git revert` the `static-health.routes.ts` commit to restore the
single-endpoint shape verbatim.

## Validation

- Integration: `tests/integration/remaining/health-split.test.ts` asserts:
  - `/health/live` → 200, no `database` field anonymously.
  - `/health/deep` → 403 anonymously; 200 with full payload as ADMIN.
  - `/health` → falls back to live anonymously; deep as ADMIN.
- Manual smoke:

  ```bash
  curl -s https://excelsior.cards/health/live | jq '{ status, version }'
  curl -si https://excelsior.cards/health/deep     # expect 403
  curl -b sessionId=<admin> https://excelsior.cards/health/deep | jq '.database.stats'
  ```

## See also

- [`OPS_TLS_AND_HTTPS.md`](OPS_TLS_AND_HTTPS.md) — production is HTTPS.
- [`.cursorrules`](../../.cursorrules) — the health-check helper snippet.
