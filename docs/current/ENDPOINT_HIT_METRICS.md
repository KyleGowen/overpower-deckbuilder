# Endpoint hit metrics (`endpoint_hit_counts`)

Production traffic counts per **Express-registered route** (canonical key: `METHOD /path/pattern`, e.g. `GET /api/v1/catalog/characters`). Counts and `last_hit_at` are written **asynchronously** after the response finishes; see [`src/metrics/endpointHitMetrics.ts`](../../src/metrics/endpointHitMetrics.ts).

## Adding a new HTTP endpoint (checklist)

1. **Register the route on the Express `app`** in the normal way:
   - Legacy: a module under [`src/routes/`](../../src/routes/) wired from [`src/routes/index.ts`](../../src/routes/index.ts).
   - v1: a handler in [`src/api/http/*.http.ts`](../../src/api/http/) wired from [`registerApiV1Routes.ts`](../../src/api/http/registerApiV1Routes.ts) (mounted at `/api/v1`).
2. **No manual SQL seed per route.** On server startup (after DB init), the app calls `enumerateExpressRoutes(app)`, then `seedEndpointHitCounts()` to insert **one row per discovered route** with `hit_count = 0` and `last_hit_at = NULL` (existing rows are left unchanged via `ON CONFLICT DO NOTHING`), then **`pruneStaleEndpointHitCounts()`** to **`DELETE`** any table rows whose `endpoint_key` is **not** in the current enumeration. That removes metrics for routes that were removed from the Express app (e.g. after a migration to `/api/v1` or deleting a legacy handler). If enumeration returns an empty list, pruning is skipped so the table is not wiped by a bad stack walk.
3. **Deploy / restart** the Node process after adding or removing routes so the table matches the live route catalog. Until restart, the first hit can still create a row via the upsert used on each request; stale rows for deleted routes remain until the next startup prune.
4. **Schema changes only in Flyway.** If you add columns to `endpoint_hit_counts` (or new tables), add a **versioned** migration under [`migrations/`](../../migrations/) and run `npm run migrate` per repo workflow. Do **not** hand-maintain one Flyway INSERT per route.

## What is not auto-tracked

- **`express.static`** and other middleware that never sets `req.route` (no Express route layer).
- **Unmatched paths** (404) where no route matched.

If you need metrics for something that is not an Express route, that requires a **product decision** and code changes (e.g. aggregate buckets or a different probe)—not a row in this table.

## Querying

```sql
SELECT endpoint_key, hit_count, last_hit_at
FROM endpoint_hit_counts
ORDER BY hit_count DESC;
```

## User Analytics section grouping

The admin User Analytics dashboard classifies cumulative non-zero counters into four
feature areas:

- **Home:** `/api/v1/recent-updates`.
- **Database:** `/api/v1/catalog/*` and `/api/v1/dbv/sets`.
- **Decks:** `/api/v1/decks*`, `/api/v1/guest/decks*`, `/api/v1/community/decks`,
  `/api/v1/users/:userId/public-decks`, and `/api/v1/dbv/deck-backgrounds`.
- **Collection:** `/api/v1/collections/*`.

This is API request share, not time spent, page views, or unique-user share. Shared route
families can serve more than one screen, and different screens produce different numbers
of requests. Auth, admin, feedback, and account-management traffic is intentionally
unclassified.

## Login-hour telemetry

`standard_user_login_hourly_counts` is separate from endpoint-hit metrics. It stores
aggregate successful standard-user session starts by UTC hour without user identifiers.
The User Analytics API groups those rows into Pacific hours and returns two views of the
same counters: a rolling 24-hour count and an all-known tracked-history count. Migration
V341 reconstructed the pre-counter portion of its first 24-hour window from each
account's most recent login. V342 completed that initial baseline with one older known
last-login event per standard account, without overlapping V341's window. The counters
cannot reconstruct additional earlier sessions that were never collected.

## Tests

- [`tests/unit/metrics/endpointHitMetrics.test.ts`](../../tests/unit/metrics/endpointHitMetrics.test.ts) covers enumeration, key formatting, and stale-row pruning (mock pool).

## Related Cursor context

- [`src/metrics/.cursorrules`](../../src/metrics/.cursorrules)
