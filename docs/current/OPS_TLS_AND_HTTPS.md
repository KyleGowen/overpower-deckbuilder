# OPS: TLS / HTTPS for excelsior.cards (Phase 0)

Phase 0 of the external-API-client hardening plan moves `excelsior.cards` from
plaintext HTTP to end-to-end HTTPS. This doc is the operational reference for
that change — what was deployed, how to validate it, how to roll back, and how
to debug broken TLS in the future.

## 1. Why this exists

Before Phase 0, every bearer token, session cookie, login payload, and
`/js/app-config.js` response travelled over plain HTTP. That makes the Bearer
JWT "security boundary" meaningless on any untrusted network and blocks any
serious external integration from completing a security review. Phase 0 closes
that gap by terminating TLS at CloudFront, forcing the browser onto HTTPS, and
hardening the session cookie once HTTPS is available.

## 2. Architecture after Phase 0

```
Browser ── HTTPS ─▶ CloudFront (excelsior.cards + www)
                        │    viewer_certificate: ACM (us-east-1)
                        │    min TLS: TLSv1.2_2021
                        │    viewer_protocol_policy: redirect-to-https
                        ▼
                 origin.excelsior.cards:80 ── nginx ── 127.0.0.1:3000 (Node)
```

- **Apex + www** resolve to the CloudFront distribution via Route53 ALIAS
  records (`infra/dns.tf`).
- **origin.excelsior.cards** is a new Route53 A record that points directly at
  the EC2 EIP. CloudFront uses this as its origin hostname so the apex alias
  does not loop back on itself.
- **nginx** has two server blocks (`infra/nginx.tf`):
  - `listen 80` for `excelsior.cards` / `www.excelsior.cards` → 301 redirect
    to HTTPS (defense in depth for anyone who bypasses CloudFront).
  - `listen 80 default_server` for `origin.excelsior.cards` → proxy to Node.
- **Node** uses `app.set('trust proxy', 1)` in [`src/index.ts`](../../src/index.ts)
  so `req.secure`, `req.protocol`, and `req.ip` reflect the
  `X-Forwarded-Proto` / `X-Forwarded-For` headers set by nginx and CloudFront.

## 3. Certificate issuance

The ACM certificate lives in **us-east-1** (CloudFront requires this; the rest
of the stack is in `us-west-2`). A second provider alias
(`provider = aws.us_east_1`) in [`infra/main.tf`](../../infra/main.tf) drives
the cert resources in [`infra/ssl.tf`](../../infra/ssl.tf):

- `aws_acm_certificate.main` (domain `excelsior.cards` + SAN
  `www.excelsior.cards`).
- `aws_route53_record.cert_validation` — one DNS CNAME per SAN.
- `aws_acm_certificate_validation.main` — blocks `terraform apply` until DNS
  validation succeeds.

ACM auto-renews certs as long as the validation records stay in the zone.
**Do not delete** the `cert_validation` records.

## 4. Cookies on HTTPS

Session cookies are built via
[`src/services/authCookieOptions.ts`](../../src/services/authCookieOptions.ts).
`AuthenticationService` calls `buildSessionCookieOptions(req, SESSION_TTL_MS)`
everywhere it issues the `sessionId` cookie (login, Google login, signup).

Cookie attributes are **deterministic** — they depend only on the explicit
`COOKIE_SECURE` flag, **not** on `req.secure` / `X-Forwarded-Proto`. Keying on
`req.secure` made attributes flap per-request (a proxy or an HSTS-pinned browser
could present a request as HTTPS), which set a `Secure` cookie that the browser
then refused to send back over plain HTTP — the root cause of the "random
logout" reports. The cookie is also **rolling**: re-issued on every
authenticated request so its max age tracks the sliding 2-hour DB session.

| Condition                                         | `secure` | `sameSite` |
|---------------------------------------------------|:--------:|:----------:|
| Default (HTTP-only site, `COOKIE_SECURE` unset)   | `false`  |  `lax`     |
| `COOKIE_SECURE=true` (HTTPS opt-in)               |  `true`  | `strict`   |
| `DISABLE_SECURE_COOKIES=1` (kill switch)          |  mirrors `COOKIE_SECURE`    | `lax`      |

`sameSite=strict` (only with `COOKIE_SECURE=true`) blocks the cookie from being
sent on cross-origin navigations. Google sign-in works because the Firebase flow
exchanges tokens client-side and POSTs to our own origin before the cookie is
set; there is no cross-site redirect that needs the existing session cookie.

## 5. Environment / feature flags

| Env var                   | Default | Behavior when set                                                                    |
|---------------------------|:-------:|--------------------------------------------------------------------------------------|
| `COOKIE_SECURE`           | -       | `true` → hardened cookies (`secure: true; sameSite: 'strict'`) **and** re-enables HSTS. Set this only on a real, permanent HTTPS deployment. Cookie attributes no longer depend on `NODE_ENV` or `req.secure`. |
| `DISABLE_SECURE_COOKIES`  | -       | `1` forces `sameSite: 'lax'` (with `secure` mirroring `COOKIE_SECURE`). Emergency rollback only. |
| `DISABLE_TRUST_PROXY`     | -       | `1` disables `app.set('trust proxy', 1)`. `req.ip` reverts to the direct socket IP.  |
| `DEBUG_AUTH`              | on      | Auth diagnostics (`[auth-debug]` logs: cookie issuance, session validate hit/miss, middleware denials, `/api/auth` request log). Set `0`/`false` to silence. |

## 6. Validation plan

### 6.1 Manual smoke

```bash
# HTTP request is redirected
curl -sI http://excelsior.cards/ | head -n 3
#   HTTP/1.1 301 Moved Permanently
#   Location: https://excelsior.cards/

# HTTPS responds with the app
curl -sI https://excelsior.cards/ | head -n 3
#   HTTP/2 200
#   Server: cloudfront

# Login sets the hardened cookie
curl -si -XPOST https://excelsior.cards/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"…","password":"…"}' | grep -i set-cookie
#   set-cookie: sessionId=…; Path=/; HttpOnly; Secure; SameSite=Strict
```

Also open the site in Chrome: lock icon present, no mixed-content warnings,
and `https://excelsior.cards/js/app-config.js` returns an HTTPS CloudFront URL.

### 6.2 Automated

- Unit: [`tests/unit/authCookieOptions.test.ts`](../../tests/unit/authCookieOptions.test.ts)
  covers the full matrix in §4 including the kill switch.
- Terraform: the PR that enables Phase 0 must include a `terraform plan`
  output in the description confirming `viewer_protocol_policy =
  "redirect-to-https"` on both CloudFront behaviors and the ACM cert ARN
  attached via `viewer_certificate.acm_certificate_arn`.

### 6.3 Observability

- nginx access log on EC2 should show `X-Forwarded-Proto: https` on > 99% of
  requests within an hour of cutover (stragglers are pre-cutover cached
  responses).
- CloudFront "HTTPS Requests" CloudWatch metric climbs to ~100% of
  `Requests`; "HTTPRequests" drops to near zero after DNS propagation
  finishes (expect 24h for stragglers on long TTL resolvers).

## 7. Rollback

| Failure mode                                    | Action                                                                 |
|------------------------------------------------|------------------------------------------------------------------------|
| CloudFront distribution fails to attach cert   | `git revert` the Phase 0 Terraform commit; re-apply. Apex A record     |
|                                                | goes back to the EIP (Route53 record rolls back). Downtime ≈ TTL.      |
| Secure cookies break login unexpectedly        | SSM `DISABLE_SECURE_COOKIES=1` on the EC2 app env; `docker restart`.   |
| `trust proxy` mis-identifies client IPs        | SSM `DISABLE_TRUST_PROXY=1`; `docker restart`. (Note: audit logs after |
|                                                | Phase 2 will record CloudFront edge IPs instead of real users.)        |
| nginx redirect loops                           | `git revert` `infra/nginx.tf`; `terraform apply`.                      |
| DNS cutover wrong                              | Re-point `aws_route53_record.main` to the EIP (pre-Phase-0 snapshot in |
|                                                | git history).                                                          |

No database schema changes in Phase 0. No data risk.

## 8. Cost

- **ACM certs**: free with CloudFront.
- **CloudFront**: already provisioned; only the traffic shape changes. PriceClass_100 retained.
- **Route53**: hosted zone already exists (~$0.50/month); alias records are free.
- **EC2 / RDS**: no change.

Phase 0 is non-spend. Per the [Infrastructure Spend Lock](../../.cursorrules)
this was still confirmed with Kyle before execution.

## 9. Local dev

Local dev stays on plain HTTP at `http://localhost:8085` — `authCookieOptions`
returns the HTTP-safe `{ secure: false, sameSite: 'lax' }` shape whenever
`COOKIE_SECURE` is not `true` (which is the case in dev and on the current
HTTP-only production site). The `.cursorrules` health-check example keeps its
HTTP URL for that reason.

## 10. See also

- [`.cursorrules`](../../.cursorrules) — Infrastructure Spend Lock, Server
  Health Check.
- [`infra/.cursorrules`](../../infra/.cursorrules) — infra file map.
- Phase 1 doc `API_V1_SECURITY_HEADERS.md` (adds HSTS, which becomes effective
  only once Phase 0 is live).
