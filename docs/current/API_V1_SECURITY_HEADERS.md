# API v1 — Security headers (Phase 1)

## What this is

`helmet` is mounted near the top of the Express request pipeline (see
[`src/middleware/securityHeaders.ts`](../../src/middleware/securityHeaders.ts))
and emits a fixed set of security-related response headers on every route.

## Headers emitted

| Header                              | Value                                           | Notes                                                                                                              |
|-------------------------------------|-------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| `Strict-Transport-Security`         | `max-age=31536000; includeSubDomains`           | One year. `preload` intentionally **not** set — requires a separate submission to the browser preload list.        |
| `X-Content-Type-Options`            | `nosniff`                                       | Blocks MIME sniffing on downloads.                                                                                 |
| `Referrer-Policy`                   | `strict-origin-when-cross-origin`               | Balances observability and privacy; does not leak paths to third parties.                                          |
| `X-Frame-Options`                   | `DENY`                                          | Prevents the app being embedded as an iframe.                                                                      |
| `Cross-Origin-Opener-Policy`        | helmet default (`same-origin`)                  | Isolates browsing contexts.                                                                                        |
| `Cross-Origin-Resource-Policy`      | helmet default (`same-origin`)                  | Limits cross-origin fetches of app resources.                                                                      |

## HTTPS dependency

HSTS is ignored by browsers when received over HTTP. It only becomes
effective after Phase 0 ([`OPS_TLS_AND_HTTPS.md`](OPS_TLS_AND_HTTPS.md)) is
live. The middleware emits it unconditionally so the first HTTPS response is
already protected.

## What's intentionally NOT set

- **`Content-Security-Policy`.** The current HTML shell relies on inline
  `<script>` blocks; a strict CSP would break the app. Tracked as a
  post-Phase-3 follow-up.
- **`Cross-Origin-Embedder-Policy`.** We need to keep the mixed `<img>` +
  third-party font setup functional; helmet defaults apply (i.e., not
  emitted).

## Kill switch

`DISABLE_HELMET=1` makes the middleware a no-op. Use only as an emergency
rollback — a browser that has already seen HSTS will still enforce it for the
remainder of `max-age`.

Revert: `git revert` the middleware commit.

## Validation

- Integration: `tests/integration/helmet-headers.test.ts` asserts the
  presence of each header on `/api/v1/catalog/characters`.
- Manual smoke:

  ```bash
  curl -sI https://excelsior.cards/api/v1/catalog/characters | egrep -i 'strict-transport|x-content-type|referrer-policy|x-frame-options'
  ```

## See also

- [`OPS_TLS_AND_HTTPS.md`](OPS_TLS_AND_HTTPS.md) — Phase 0 HTTPS rollout.
- [`API_V1_CORS.md`](API_V1_CORS.md), [`API_V1_LOGGING.md`](API_V1_LOGGING.md).
