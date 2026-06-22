# API v1 — changelog

One line per change. Newest first. Keep this in sync with
[`API_V1.md`](../../API_V1.md) and [`docs/openapi.yaml`](../openapi.yaml).

## Unreleased — Phase 3 (scale + docs)

- `POST /api/v1/users/change-email` and `POST /api/v1/users/change-password` — self-service
  account updates for USER/ADMIN (session cookie). Google-linked accounts cannot
  change email (`GOOGLE_EMAIL_LOCKED`) or password (`GOOGLE_PASSWORD_LOCKED`).
- V1 envelopes now include backwards-compatible top-level `success` and optional
  `error` / `message` fields while preserving canonical `data`, `meta`, and
  `errors`. New clients should continue to use HTTP status and `errors[]`.
- `GET /api/v1/catalog/*` and `GET /api/v1/dbv/sets` now emit
  `Cache-Control: public, max-age=300, stale-while-revalidate=3600` plus a
  strong `ETag`, and honor `If-None-Match` for 304 responses. Meta envelope
  now includes `catalogDataVersion` and `catalogLastUpdated`. See
  [`API_V1_CATALOG_CACHING.md`](API_V1_CATALOG_CACHING.md).
- Optional `?since_version=<n>` query parameter accepted on catalog routes;
  currently a no-op filter but clients can use the response
  `meta.catalogDataVersion` to decide when to refresh.
- CloudFront now has ordered cache behaviors for `/api/v1/catalog/*` and
  `/api/v1/dbv/sets`. Authorization is not forwarded; responses are global.
- `compression` middleware added so responses negotiate gzip/brotli.
- OpenAPI 3 stub published at [`docs/openapi.yaml`](../openapi.yaml).
- New docs: [`API_V1_IMAGE_CONTRACT.md`](API_V1_IMAGE_CONTRACT.md),
  [`API_V1_ERROR_CATALOG.md`](API_V1_ERROR_CATALOG.md),
  [`API_V1_OPENAPI.md`](API_V1_OPENAPI.md), this changelog.

## Phase 2 (auth + audit)

- Refresh token flow: `POST /api/v1/auth/login` now optionally returns
  `refreshToken` and `refreshExpiresInSeconds`; access-token TTL reduced to
  `15m` (`JWT_ACCESS_TTL`). `POST /api/v1/auth/refresh` rotates tokens;
  `POST /api/v1/auth/logout` revokes the supplied refresh token. Reuse of a
  rotated refresh token revokes the entire family.
- Bearer JWT is now accepted on `/api/v1/decks/*` and
  `/api/v1/collections/*` in addition to session cookies. Kill switch:
  `DISABLE_BEARER_DECKS_COLLECTIONS=1`.
- New `api_access_log` table + async middleware logs every `/api/v1/*`
  request's `user_id`, `route_key`, `method`, `status`, `ip`, `request_id`,
  `ts`. Retention: 90 days.
- Zod validation on v1 request bodies via `parseV1Body`; errors come back
  as `VALIDATION_ERROR` with `errors[].field`.
- Consolidated per-user / per-IP rate limits with `X-RateLimit-*` headers
  and `RATE_LIMITED` 429s. Kill switches: `DISABLE_V1_RATE_LIMIT=1`,
  `LEGACY_RATE_LIMITS=1`.

## Phase 1 (security hygiene)

- CORS allowlist middleware (`ALLOWED_ORIGINS` env).
- `helmet` security headers (HSTS, `X-Content-Type-Options`,
  `Referrer-Policy`, `X-Frame-Options`). CSP intentionally omitted.
- Request-ID middleware: echoes or generates `X-Request-Id`.
- Structured logging via `pino` / `pino-http` with `request_id`.
- `/health` split into `/health/live` (public, minimal) and `/health/deep`
  (ADMIN-only). Backward-compatible `/health` route preserved.
- RDS security group closed: PostgreSQL ingress restricted to the EC2
  application SG and an optional `var.rds_admin_cidrs` allowlist.
- Application secrets moved to SSM Parameter Store where feasible.

## Phase 0 (HTTPS)

- ACM certificate for `excelsior.cards` + `www.excelsior.cards` in
  `us-east-1`, wired into CloudFront.
- CloudFront `viewer_protocol_policy = "redirect-to-https"`.
- `origin.excelsior.cards` subdomain added to break the CloudFront DNS
  loop.
- Express trusts the proxy, session cookies are `Secure` +
  `SameSite=strict` in production.
- `APP_CDN_BASE` is HTTPS.
