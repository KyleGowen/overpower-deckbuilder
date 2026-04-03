# API migration checklist (Excelsior `/api/v1`)

Track migration from legacy Express routes (`API_DOCUMENTATION.md`) to the encapsulated v1 API (`API_V1.md`), services under `src/api/services/`, and HTTP routers under `src/api/http/*.http.ts`.

**Related docs**

- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) — legacy HTTP contract (`{ success, data, error }`, session cookies).
- [API_V1.md](API_V1.md) — versioned contract (`{ data, meta, errors }`, Bearer JWT).
- [MIGRATION_ARCHITECTURE.md](MIGRATION_ARCHITECTURE.md) — layers, `/admin` rules, testing.
- Agent workflow: [.cursor/skills/api-layer-migration/SKILL.md](.cursor/skills/api-layer-migration/SKILL.md)

**Per-route columns**

| Column | Meaning |
|--------|---------|
| Legacy path | Current documented path |
| v1 path | Target under `/api/v1/...` |
| Migrated | Done when **v1 route exists**, **legacy handler removed**, and **callers** (app + tests + Postman) use **`/api/v1/...`** with the v1 envelope |
| API module | Service + DTO paths |
| HTTP unit | Full unit tests for the `*.http.ts` file |
| ≥1 int | At least one integration test for that HTTP module |
| API_V1.md | Subsection added/updated |

---

## P0 — Database View (DBV) backing APIs

| Legacy path | v1 path (proposed) | Migrated | API module | HTTP unit | ≥1 int | API_V1.md |
|-------------|-------------------|----------|------------|-----------|--------|-----------|
| GET /api/characters | GET /api/v1/catalog/characters | [x] | `CatalogService` + `dbv-catalog.http.ts` | [x] | [x] | [x] |
| GET /api/locations | GET /api/v1/catalog/locations | [x] | `CatalogService` + `dbv-catalog.http.ts` | [x] | [x] | [x] |
| GET /api/special-cards | GET /api/v1/catalog/special-cards | [x] | `CatalogService` + `dbv-catalog.http.ts` | [x] | [x] | [x] |
| GET /api/missions | GET /api/v1/catalog/missions | [ ] | catalog service | [ ] | [ ] | [ ] |
| GET /api/events | GET /api/v1/catalog/events | [ ] | catalog service | [ ] | [ ] | [ ] |
| GET /api/aspects | GET /api/v1/catalog/aspects | [ ] | catalog service | [ ] | [ ] | [ ] |
| GET /api/advanced-universe | GET /api/v1/catalog/advanced-universe | [ ] | catalog service | [ ] | [ ] | [ ] |
| GET /api/teamwork | GET /api/v1/catalog/teamwork | [ ] | catalog service | [ ] | [ ] | [ ] |
| GET /api/ally-universe | GET /api/v1/catalog/ally-universe | [ ] | catalog service | [ ] | [ ] | [ ] |
| GET /api/training | GET /api/v1/catalog/training | [ ] | catalog service | [ ] | [ ] | [ ] |
| GET /api/basic-universe | GET /api/v1/catalog/basic-universe | [ ] | catalog service | [ ] | [ ] | [ ] |
| GET /api/power-cards | GET /api/v1/catalog/power-cards | [ ] | catalog service | [ ] | [ ] | [ ] |
| GET /api/foil-card-map | GET /api/v1/catalog/foil-card-map | [ ] | catalog service | [ ] | [ ] | [ ] |
| GET /api/sets | GET /api/v1/dbv/sets | [ ] | dbv-support | [ ] | [ ] | [ ] |
| GET /api/deck-backgrounds | GET /api/v1/dbv/deck-backgrounds | [ ] | dbv-support | [ ] | [ ] | [ ] |
| GET /api/test (diagnostic) | TBD or skip | [ ] | — | [ ] | [ ] | [ ] |

---

## P1 — Auth (API clients)

| Legacy path | v1 path | Migrated | API module | HTTP unit | ≥1 int | API_V1.md |
|-------------|---------|----------|------------|-----------|--------|-----------|
| POST /api/auth/login | POST /api/v1/auth/login | [x] | `auth.http.ts` + `V1JwtTokenService` | [x] | [x] | [x] |
| GET /api/auth/me | GET /api/v1/auth/me | [x] | `auth.http.ts` | [x] | [x] | [x] |
| POST /api/auth/logout | POST /api/v1/auth/logout | [x] | `auth.http.ts` | [x] | [x] | [x] |

---

## P2 — Decks (database-backed)

| Area | Legacy (see API_DOCUMENTATION) | v1 prefix | Migrated | Notes |
|------|-------------------------------|-----------|----------|-------|
| List, CRUD, validate, cards, stats, UI prefs | /api/decks… | /api/v1/decks… | [ ] | User-scoped only |

---

## P3 — Collections

| Legacy | v1 | Migrated |
|--------|-----|----------|
| /api/collections/me/* | /api/v1/collections/me/* | [ ] |

---

## P4 — Guest decks

| Legacy | v1 | Migrated |
|--------|-----|----------|
| /api/guest/decks… | /api/v1/guest/decks… | [ ] |

---

## P5 — Admin only (`/api/v1/admin/...`)

All elevated operations must live under `/api/v1/admin/...` (no client “admin” flags).

| Legacy | v1 | Migrated |
|--------|-----|----------|
| GET/POST /api/users (admin) | /api/v1/admin/users… | [ ] |
| GET /api/debug/* | /api/v1/admin/debug/* | [ ] |
| GET /api/database/status | /api/v1/admin/database/status | [ ] |

---

## P6 — Static, health, HTML shell

Usually out of scope for JSON v1; list here only if product requires API-style docs.

| Legacy | Notes |
|--------|-------|
| /health, static, /data, /users/… pages | [ ] N/A or document separately |
