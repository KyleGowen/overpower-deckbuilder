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

## Tests

- [`tests/unit/metrics/endpointHitMetrics.test.ts`](../../tests/unit/metrics/endpointHitMetrics.test.ts) covers enumeration, key formatting, and stale-row pruning (mock pool).

## Related Cursor context

- [`src/metrics/.cursorrules`](../../src/metrics/.cursorrules)
