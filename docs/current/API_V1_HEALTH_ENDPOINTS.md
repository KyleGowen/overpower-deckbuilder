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

Unconditionally returns the **deep payload**, matching the pre-Phase-1
`/health` contract verbatim. No auth, no cookie required. This is what the
EC2 blue/green deploy gate in [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml)
(`jq -r '.database.status'`), nginx LB probes, and external uptime monitors
depend on.

Access control on DB internals lives on `/health/deep` (ADMIN-gated) now;
`/health` is the legacy alias that ops tooling already treats as anonymous.
`Cache-Control: no-store` still prevents CloudFront / browsers from caching
any of the deep payload's fields.

New callers that want the lean public payload should use `/health/live`.

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

- Unit: [`tests/unit/health-check-enhanced.test.ts`](../../tests/unit/health-check-enhanced.test.ts)
  registers its own mock `/health` handler with the pre-Phase-1 shape; it
  still passes because `static-health.routes.ts` serves that shape verbatim
  on `/health`.
- Manual smoke (matches the EC2 deploy-gate curl):

  ```bash
  curl -s http://localhost:8085/health        | jq '.status, .database.status'   # expect "OK" / "OK"
  curl -s http://localhost:8085/health/live   | jq '.database'                   # expect null (lean)
  curl -si http://localhost:8085/health/deep  # expect 403 anonymously
  ```

## See also

- [`OPS_TLS_AND_HTTPS.md`](OPS_TLS_AND_HTTPS.md) — production is HTTPS.
- [`.cursorrules`](../../.cursorrules) — the health-check helper snippet.
