# API v1 — Structured logging (Phase 1)

## What this is

`pino` + `pino-http` are mounted as request middleware via
[`src/middleware/logging.ts`](../../src/middleware/logging.ts). Every request
gets a log line in JSON with a `request_id` that also shows up on the response
as the `X-Request-Id` header, so a production incident can be correlated
end-to-end from the client.

`console.error` is preserved for boot / initialization failures in
[`src/index.ts`](../../src/index.ts); `console.log` in request-path code
should migrate to the pino logger over time.

## Log line schema (abridged)

```json
{
  "level": 30,
  "time": "2026-04-16T20:12:44.123Z",
  "service": "excelsior",
  "request_id": "d7f3...",
  "route": "/api/v1/catalog/characters",
  "req": {
    "id": "d7f3...",
    "method": "GET",
    "url": "/api/v1/catalog/characters"
  },
  "res": {
    "statusCode": 200
  },
  "responseTime": 4.2,
  "msg": "request_completed status=200"
}
```

### Redactions

`pino` is configured to drop these fields before emission:

- `req.headers.authorization`
- `req.headers.cookie`
- `res.headers["set-cookie"]`
- `password` (anywhere in the payload)
- `req.body.password`
- `req.body.idToken`

Any other sensitive field you add must either be redacted here or kept out of
logged structures entirely.

## Request ID contract

[`src/middleware/requestId.ts`](../../src/middleware/requestId.ts):

1. Accepts an incoming `X-Request-Id` when safe (`[A-Za-z0-9._~+/=-]{1,128}`).
2. Otherwise generates a UUIDv4.
3. Attaches to `req.id` (read by pino-http) and echoes on the response.

Downstream services and middleware SHOULD propagate `req.id` when making
outbound calls so traces stay correlated.

## How to grep

```bash
# Follow on EC2
docker logs -f overpower-app | jq -r '. | "\(.time) [\(.request_id)] \(.req.method) \(.req.url) -> \(.res.statusCode) (\(.responseTime)ms)"'

# Pull everything for a single request
docker logs overpower-app --since 2h | jq 'select(.request_id == "d7f3...")'
```

## Kill switch

`DISABLE_PINO=1` turns off pino-http and falls back to the Node default
`console.*` output. Use only for debugging a pino configuration bug. The
`X-Request-Id` header middleware stays on (it is passive — no kill switch).

## Validation

- Unit: `tests/unit/requestId.test.ts` verifies generate-when-absent,
  preserve-when-safe, reject-when-unsafe.
- Manual smoke:

  ```bash
  curl -sI -H 'X-Request-Id: probe-123' https://excelsior.cards/api/v1/catalog/characters | grep -i x-request-id
  ```

  Expect `x-request-id: probe-123`. Then tail the app logs and filter by that
  id to see the matching request line.

## See also

- [`API_V1_CORS.md`](API_V1_CORS.md), [`API_V1_SECURITY_HEADERS.md`](API_V1_SECURITY_HEADERS.md).
- Phase 2 `API_V1_AUDIT_LOG.md` extends the `request_id` into the audit-log
  table so DB rows and log lines share the same correlator.
