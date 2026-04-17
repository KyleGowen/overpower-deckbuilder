# Agent orientation (Excelsior Deckbuilder)

**Excelsior** is an Overpower card game database and deck-building web app. Backend is Node/Express/TypeScript in `src/`; frontend is vanilla JS and HTML in `public/` (no frameworks). Tests live in `tests/` (unit: `tests/unit/`, integration: `tests/integration/`, frontend: `tests/frontend/`).

Before making changes:

1. **Read [.cursorrules](.cursorrules)** — ship command (unit/integration gates use [`scripts/ship-conditional-test.sh`](scripts/ship-conditional-test.sh) so tests re-run only after working-tree changes; `SHIP_TESTS_FORCE=1` to always run), testing, lint, GUEST behavior, style guide, infra rules, and **Flyway migrations (local dev)** (`npm run migrate` + restart `npm run dev` after adding/editing `migrations/*.sql`).
2. **Read [DEAD_CODE_POLICY.md](DEAD_CODE_POLICY.md)** — how to identify and remove unused code (Knip, frontend manifest).

Key docs:

- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) — **legacy** HTTP contract (`src/routes/`, `{ success, data, error }`, session cookies).
- [API_V1.md](API_V1.md) — **`/api/v1`** contract (Bearer JWT, `{ data, meta, errors }`). Update this file whenever v1 paths or envelopes change.
- [API_MIGRATION_CHECKLIST.md](API_MIGRATION_CHECKLIST.md) — migration progress; keep in sync when checking routes off.
- [MIGRATION_ARCHITECTURE.md](MIGRATION_ARCHITECTURE.md) — layers, `/admin` rules, testing, JWT env.
- Layering and v1 route grouping: [`src/api/.cursorrules`](src/api/.cursorrules). When moving logic into `src/api/`, follow [.cursor/skills/api-layer-migration/SKILL.md](.cursor/skills/api-layer-migration/SKILL.md).
- [docs/current/PROJECT_LAYOUT.md](docs/current/PROJECT_LAYOUT.md) — project structure and documentation map.
- [docs/current/DECK_LEGALITY_RULES.md](docs/current/DECK_LEGALITY_RULES.md) — Standard (Venture) vs Skirmish vs in-app Limited; rulebook cites + `DeckValidationService` / client validator mapping and known gaps. **Any-Power:** Training uses **any** primary ≤ cap; Power / Teamwork use **max** for ≥ (see doc §3.1).
- [docs/current/TESTING_GUIDE.md](docs/current/TESTING_GUIDE.md) — how to run unit/integration tests and which Jest configs to use.
- [docs/current/ENDPOINT_HIT_METRICS.md](docs/current/ENDPOINT_HIT_METRICS.md) — `endpoint_hit_counts` async metrics; on startup the app seeds missing route keys at zero and **deletes rows for routes no longer registered** (no per-route migration).
- [docs/current/DECK_EDITOR_CARD_VIEW_LAYOUT.md](docs/current/DECK_EDITOR_CARD_VIEW_LAYOUT.md) — Deck editor Card View layout (landscape vs portrait, no frame, bevelled corners); **read before changing card-view CSS** to avoid regressions.
- [MOBILE_DESIGN.md](MOBILE_DESIGN.md) — mobile/dual layout-mode strategy, milestones, refactor log, and **§10** (recent global-nav + DBV All-tab implementation notes for agents).
- **DEV** (Deck Editor View) in **MV**: mobile deck modal list + stats + search + row actions menu — [`public/js/deck-editor-mobile-view.js`](public/js/deck-editor-mobile-view.js), [`public/css/deck-editor-mobile.css`](public/css/deck-editor-mobile.css). **Spec / integration:** [docs/current/DECK_EDITOR_MOBILE_VIEW.md](docs/current/DECK_EDITOR_MOBILE_VIEW.md); tokens summary in [docs/current/STYLE_GUIDE.md](docs/current/STYLE_GUIDE.md) under mobile adaptations.
- [docs/current/DBV_ASPECTS_MOBILE.md](docs/current/DBV_ASPECTS_MOBILE.md) — Aspects DBV mobile: how filters/caption/actions look; links to unit tests.
- [docs/current/DBV_MISSIONS_MOBILE.md](docs/current/DBV_MISSIONS_MOBILE.md) — Missions DBV mobile: mission-set dropdown, card rows, caption, filters/load; links to unit tests.
- [docs/current/DBV_TRAINING_MOBILE.md](docs/current/DBV_TRAINING_MOBILE.md) — Training DBV mobile: Ally-style type toggles (`type_1`/`type_2`), card rows, caption; links to unit tests.
- [docs/current/DBV_BASIC_UNIVERSE_MOBILE.md](docs/current/DBV_BASIC_UNIVERSE_MOBILE.md) — Basic Universe DBV mobile: Training-style type toggles + Teamwork-style To Use/Bonus strips, card rows, caption; links to unit tests.
- [public/js/DBV_POWER_TYPE_FILTER_STRIP.md](public/js/DBV_POWER_TYPE_FILTER_STRIP.md) — DBV reusable power-type icon strip (`data-dbv-power-strip` presets, `dbv-power-type-filter-strip.js`, `dbv-icon-filter-logic.js`, load order, integration).
- [public/js/DBV_CARD_NAME_FILTER.md](public/js/DBV_CARD_NAME_FILTER.md) — DBV reusable card/name text filters (`data-dbv-name-filter` presets, `dbv-card-name-filter.js`, load order after power strip, `template-loader` re-init; filter math unchanged in `search-filter-functions.js` / `filter-functions.js` / `card-filter-toggles.js`).
- [docs/current/MOBILE_DBV_CARD_IMAGE_TRIES.md](docs/current/MOBILE_DBV_CARD_IMAGE_TRIES.md) — mobile DBV row art + `#imageModal` sizing attempts and troubleshooting (what shipped vs what still looked wrong).
- [docs/current/MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md](docs/current/MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md) — **repeatable fix** for mobile DBV image sizing (`max-height: none !important` override); checklist and template selectors for every DBV tab.
- [docs/current/COLLECTION_CHECKLIST_SOURCE.md](docs/current/COLLECTION_CHECKLIST_SOURCE.md) — Source of truth for collection card names and numbers (OverPower Check List); use when correcting or populating card data.
- [docs/current/COLLECTION_VIEW_MOBILE.md](docs/current/COLLECTION_VIEW_MOBILE.md) — Collection tab mobile (`layout-mobile`): list vs detail sheet, fixed sort, delegate activation, `layout-mode-change`, unit tests and coverage limits.

## External API hardening

Docs for the phased hardening of `/api/v1` so an external client can consume it safely. Read these before touching auth, transport, CORS, caching, or v1 routes.

- [docs/current/OPS_TLS_AND_HTTPS.md](docs/current/OPS_TLS_AND_HTTPS.md) — Phase 0. CloudFront + ACM put excelsior.cards on HTTPS end-to-end; session cookies use `Secure; SameSite=Strict` via [`src/services/authCookieOptions.ts`](src/services/authCookieOptions.ts). Includes kill switches (`DISABLE_SECURE_COOKIES`, `DISABLE_TRUST_PROXY`).
- [docs/current/API_V1_CORS.md](docs/current/API_V1_CORS.md) — Phase 1. CORS allowlist from `ALLOWED_ORIGINS`; [`src/middleware/corsAllowlist.ts`](src/middleware/corsAllowlist.ts); kill switch `DISABLE_CORS=1`.
- [docs/current/API_V1_SECURITY_HEADERS.md](docs/current/API_V1_SECURITY_HEADERS.md) — Phase 1. helmet (HSTS + nosniff + X-Frame-Options + Referrer-Policy, no CSP); [`src/middleware/securityHeaders.ts`](src/middleware/securityHeaders.ts); kill switch `DISABLE_HELMET=1`.
- [docs/current/API_V1_LOGGING.md](docs/current/API_V1_LOGGING.md) — Phase 1. Structured pino logs + `X-Request-Id` correlation; [`src/middleware/logging.ts`](src/middleware/logging.ts) + [`src/middleware/requestId.ts`](src/middleware/requestId.ts); kill switch `DISABLE_PINO=1`.
- [docs/current/API_V1_HEALTH_ENDPOINTS.md](docs/current/API_V1_HEALTH_ENDPOINTS.md) — Phase 1. `/health/live` (public) vs `/health/deep` (ADMIN) vs back-compat `/health`; [`src/routes/static-health.routes.ts`](src/routes/static-health.routes.ts); kill switch `DISABLE_HEALTH_SPLIT=1`.
- [docs/current/OPS_RDS_SECURITY_GROUP.md](docs/current/OPS_RDS_SECURITY_GROUP.md) — Phase 1. RDS SG locked to app EC2 SG + `var.rds_admin_cidrs` allowlist ([`infra/rds.tf`](infra/rds.tf)).
- [docs/current/OPS_SSM_SECRETS.md](docs/current/OPS_SSM_SECRETS.md) — Phase 1. SSM parameter naming and how the app reads them; follow-up PR will remove the last plaintext DB credentials from the deploy workflow.
- [docs/current/API_V1_AUTH_REFRESH.md](docs/current/API_V1_AUTH_REFRESH.md) — Phase 2. Access + refresh token flow; `refresh_tokens` table, rotation + reuse-detection, `/auth/refresh` + real `/auth/logout` in [`src/api/http/auth.http.ts`](src/api/http/auth.http.ts); service in [`src/api/services/refreshTokenService.ts`](src/api/services/refreshTokenService.ts); kill switch `DISABLE_AUTH_REFRESH=1`.
- [docs/current/API_V1_AUDIT_LOG.md](docs/current/API_V1_AUDIT_LOG.md) — Phase 2. Async `api_access_log` writes via [`src/api/http/middleware/apiAccessLog.ts`](src/api/http/middleware/apiAccessLog.ts); schema in [`migrations/V276__Create_api_access_log.sql`](migrations/V276__Create_api_access_log.sql); kill switch `DISABLE_API_ACCESS_LOG=1`.
- [docs/current/API_V1_RATE_LIMITS.md](docs/current/API_V1_RATE_LIMITS.md) — Phase 2. Consolidated per-user/IP rate limits with `X-RateLimit-*` headers in [`src/api/http/middleware/v1RateLimit.ts`](src/api/http/middleware/v1RateLimit.ts); kill switches `DISABLE_V1_RATE_LIMIT=1` / `LEGACY_RATE_LIMITS=1`.
- [docs/current/API_V1_VALIDATION.md](docs/current/API_V1_VALIDATION.md) — Phase 2. `parseV1Body` zod helper in [`src/api/http/parseV1Body.ts`](src/api/http/parseV1Body.ts); kill switch `DISABLE_ZOD_V1=1`.
- Phase 2 decks + collections: [`src/api/http/registerApiV1Routes.ts`](src/api/http/registerApiV1Routes.ts) now wires session-or-Bearer auth for decks and collections; kill switch `DISABLE_BEARER_DECKS_COLLECTIONS=1` restores session-only.
- [docs/current/API_V1_CATALOG_CACHING.md](docs/current/API_V1_CATALOG_CACHING.md) — Phase 3. `Cache-Control` + strong `ETag` + `catalogDataVersion` on `/api/v1/catalog/*` and `/api/v1/dbv/sets`; CloudFront ordered cache behaviors in [`infra/cloudfront.tf`](infra/cloudfront.tf); kill switches `DISABLE_CATALOG_CACHE_HEADERS=1` / `DISABLE_SINCE_SYNC=1`; origin helper [`src/api/http/catalogCache.ts`](src/api/http/catalogCache.ts).
- [docs/current/API_V1_IMAGE_CONTRACT.md](docs/current/API_V1_IMAGE_CONTRACT.md) — Phase 3. Image URL shape, thumb paths, CDN base, fallback behavior for external clients.
- [docs/current/API_V1_ERROR_CATALOG.md](docs/current/API_V1_ERROR_CATALOG.md) — Phase 3. Stable `errors[].code` values across `/api/v1`; any new route MUST add an entry here in the same PR.
- [docs/current/API_V1_CHANGELOG.md](docs/current/API_V1_CHANGELOG.md) — Phase 3. Chronological v1 changes; update whenever a route or envelope changes.
- [docs/current/API_V1_OPENAPI.md](docs/current/API_V1_OPENAPI.md) — Phase 3. Meta doc for the hand-rolled spec at [`docs/openapi.yaml`](docs/openapi.yaml); keep the spec in sync with `/api/v1` route changes.
- Compression: `compression` middleware mounted in [`src/middleware/setup.ts`](src/middleware/setup.ts) via [`src/middleware/compressionMiddleware.ts`](src/middleware/compressionMiddleware.ts); kill switch `DISABLE_COMPRESSION=1`.
