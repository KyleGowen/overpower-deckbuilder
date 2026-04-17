# API v1 — CORS allowlist (Phase 1)

## What this is

The Express app mounts a `cors` middleware near the top of the request
pipeline (see [`src/middleware/setup.ts`](../../src/middleware/setup.ts) →
`createCorsMiddleware` in
[`src/middleware/corsAllowlist.ts`](../../src/middleware/corsAllowlist.ts)).
It reads an allowlist from the `ALLOWED_ORIGINS` env var and emits the
standard `Access-Control-*` headers for requests whose `Origin` header is on
the list. Unknown origins receive a normal response without `ACAO`, which
browsers treat as "blocked".

Same-origin requests (no `Origin` header) always pass — the existing web app
continues to work without any allowlist entry.

## How to configure

`ALLOWED_ORIGINS` is a comma-separated list of origins. No whitespace around
the commas is required. Examples:

```
ALLOWED_ORIGINS=https://example.com
ALLOWED_ORIGINS=https://example.com,https://staging.example.com
ALLOWED_ORIGINS=*
```

`*` acts as a wildcard — **use only for non-credentialed public catalog
endpoints, if at all.** Our middleware sets `credentials: true` so any allowed
origin may send cookies / Authorization headers; pairing `credentials: true`
with `*` is not valid per the CORS spec, so setting `ALLOWED_ORIGINS=*` should
only be used during debugging.

## Add a new origin

1. Pick the origin (scheme + host + port, no trailing slash): e.g.
   `https://partner.example.com`.
2. Update the SSM parameter that feeds `ALLOWED_ORIGINS` to the EC2 container
   (see [`OPS_SSM_SECRETS.md`](OPS_SSM_SECRETS.md)).
3. Restart the app container so the new env var is picked up.
4. Ask the partner to re-run the failing request from a browser to confirm
   the `Access-Control-Allow-Origin` header now comes back set to their
   origin.

## Preflight behavior

`OPTIONS` requests for any method or header combination are answered by the
middleware:

- `Access-Control-Allow-Methods: GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-Id`
- `Access-Control-Expose-Headers: X-Request-Id, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset`
- `Access-Control-Max-Age: 600` (10 minutes)

## Kill switch

`DISABLE_CORS=1` makes the middleware a no-op; the app falls back to
same-origin-only behavior. Use this only to unblock a debugging session.
Revert: `git revert` the middleware commit.

## Validation

- Unit test: `tests/unit/corsAllowlist.test.ts` covers allowed-origin,
  disallowed-origin, empty-`Origin`, and `DISABLE_CORS` cases.
- Manual smoke (from any shell, replace `ORIGIN` and the allowed one from
  your SSM config):

  ```bash
  curl -sI -X OPTIONS -H 'Origin: https://ORIGIN' \
    -H 'Access-Control-Request-Method: GET' \
    https://excelsior.cards/api/v1/catalog/characters
  ```

  Expect `access-control-allow-origin: https://ORIGIN` only when `ORIGIN` is
  on the allowlist.

## See also

- [`API_V1_SECURITY_HEADERS.md`](API_V1_SECURITY_HEADERS.md)
- [`API_V1_LOGGING.md`](API_V1_LOGGING.md)
