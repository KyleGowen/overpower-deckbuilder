# API v1 — catalog caching and conditional GET

Phase 3 of the external-API hardening plan
([`docs/current/OPS_TLS_AND_HTTPS.md`](OPS_TLS_AND_HTTPS.md) and the
referenced plan) turned the global-GET catalog endpoints into edge-cacheable
resources. This doc is the contract between clients, the origin
(`src/api/http/catalogCache.ts`), and CloudFront
([`infra/cloudfront.tf`](../../infra/cloudfront.tf)).

## 1. Affected endpoints

All of the following are cached:

- `GET /api/v1/catalog/characters`
- `GET /api/v1/catalog/locations`
- `GET /api/v1/catalog/special-cards`
- `GET /api/v1/catalog/missions`
- `GET /api/v1/catalog/events`
- `GET /api/v1/catalog/aspects`
- `GET /api/v1/catalog/advanced-universe`
- `GET /api/v1/catalog/teamwork`
- `GET /api/v1/catalog/ally-universe`
- `GET /api/v1/catalog/training`
- `GET /api/v1/catalog/basic-universe`
- `GET /api/v1/catalog/power-cards`
- `GET /api/v1/catalog/foil-card-map`
- `GET /api/v1/dbv/sets`
- `GET /api/v1/dbv/deck-backgrounds`

## 2. Origin headers

On every 200 response, the origin emits:

| Header          | Value                                                      |
| --------------- | ---------------------------------------------------------- |
| `Cache-Control` | `public, max-age=300, stale-while-revalidate=3600`         |
| `ETag`          | `"<catalogDataVersion>-<sha1(body)[:12]>"` (strong)        |
| `Vary`          | `Accept-Encoding`                                          |

The envelope `meta` on cached responses carries `catalogDataVersion` and
`catalogLastUpdated`. Both are monotonic across the whole catalog, not
per-endpoint, so clients can track "have I seen the latest ingest?" with a
single integer.

When `DISABLE_CATALOG_CACHE_HEADERS=1`, the origin instead emits
`Cache-Control: no-store` and omits `ETag`. Clients and CloudFront will stop
caching immediately.

## 3. Conditional GET

Clients SHOULD send `If-None-Match: "<last-seen-etag>"`. If the ETag matches
the current response, the origin returns `304 Not Modified` with no body. The
304 still carries `Cache-Control`, `ETag`, and `Vary`.

## 4. since_version

All catalog endpoints accept an optional `?since_version=<n>` query parameter.
The server returns the full response but the caller can compare their
`catalogDataVersion` to the server's `meta.catalogDataVersion` to decide
whether to refresh downstream caches. Future milestones will allow the server
to return only deltas when row-level versioning is added.

`DISABLE_SINCE_SYNC=1` makes the server ignore `since_version`.

## 5. CloudFront behavior

[`infra/cloudfront.tf`](../../infra/cloudfront.tf) defines two ordered cache
behaviors:

- `/api/v1/catalog/*` — caches GET and HEAD, no cookies, forwards `If-None-Match`
  and `If-Modified-Since`, TTLs `default_ttl=300` / `max_ttl=3600`.
- `/api/v1/dbv/sets` — same.

Both behaviors inherit the Phase 0 `viewer_protocol_policy = "redirect-to-https"`
(so the edge only serves these over TLS) and enable `compress = true` at the
edge as a backstop when the origin's own `compression` middleware is bypassed.

Authorization is NOT forwarded to the origin on these paths. The responses
are global-GET (same for every client) so this is safe and guarantees a very
high cache-hit ratio.

## 6. Bumping catalog_data_version

`src/api/http/catalogCache.ts` exports `bumpCatalogDataVersion()`. Any code
path that re-ingests or mutates catalog data must call this helper so clients
see a new ETag immediately. The current bump strategy is in-memory; if a
future change persists the counter, the helper signature should stay the
same.

## 7. Kill switches / rollback

- `DISABLE_CATALOG_CACHE_HEADERS=1` — instantly disables caching, forces
  `no-store`, skips ETag generation, and short-circuits `If-None-Match`.
- `DISABLE_SINCE_SYNC=1` — ignores `since_version`.
- Terraform revert: remove the two ordered cache behaviors. Because they are
  additive, the default behavior still proxies to EC2, so no traffic is
  dropped.

## 8. Validation

- Unit: [`tests/unit/catalogCache.test.ts`](../../tests/unit/catalogCache.test.ts)
  (ETag stability, 304 round-trip, kill switches).
- Manual (Insomnia): the "Phase 3 smoke" folder hits a catalog endpoint
  twice; the second request carries the first ETag and returns 304.
- Production observability: CloudFront cache-hit ratio for
  `/api/v1/catalog/*` should exceed 80% after a day of real traffic, and
  `endpoint_hit_counts` for those routes should grow much more slowly than
  the app's total request count in pino logs.
