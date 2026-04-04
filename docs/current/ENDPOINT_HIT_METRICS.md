# Endpoint hit metrics (`endpoint_hit_counts`)

Production traffic counts per **Express-registered route** (canonical key: `METHOD /path/pattern`, e.g. `GET /api/v1/catalog/characters`). Counts and `last_hit_at` are written **asynchronously** after the response finishes; see [`src/metrics/endpointHitMetrics.ts`](../../src/metrics/endpointHitMetrics.ts).

## Adding a new HTTP endpoint (checklist)

1. **Register the route on the Express `app`** in the normal way:
   - Legacy: a module under [`src/routes/`](../../src/routes/) wired from [`src/routes/index.ts`](../../src/routes/index.ts).
   - v1: a handler in [`src/api/http/*.http.ts`](../../src/api/http/) wired from [`registerApiV1Routes.ts`](../../src/api/http/registerApiV1Routes.ts) (mounted at `/api/v1`).
2. **No manual SQL seed per route.** On server startup (after DB init), the app calls `enumerateExpressRoutes(app)` and `seedEndpointHitCounts()` to insert **one row per discovered route** with `hit_count = 0` and `last_hit_at = NULL` (existing rows are left unchanged via `ON CONFLICT DO NOTHING`).
3. **Deploy / restart** the Node process after adding routes so the new keys appear in the table. Until restart, the first hit can still create a row via the upsert used on each request.
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

- [`tests/unit/metrics/endpointHitMetrics.test.ts`](../../tests/unit/metrics/endpointHitMetrics.test.ts) covers enumeration and key formatting.

## Related Cursor context

- [`src/metrics/.cursorrules`](../../src/metrics/.cursorrules)
