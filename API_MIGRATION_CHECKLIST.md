# API migration checklist (Excelsior `/api/v1`)

Track migration from legacy Express routes (`API_DOCUMENTATION.md`) to the encapsulated v1 API (`API_V1.md`), services under `src/api/services/`, and HTTP routers under `src/api/http/*.http.ts`.

**Related docs**

- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) — legacy HTTP contract (`{ success, data, error }`, session cookies).
- [API_V1.md](API_V1.md) — versioned contract (`{ data, meta, errors }`, Bearer JWT).
- [MIGRATION_ARCHITECTURE.md](MIGRATION_ARCHITECTURE.md) — layers, `/admin` rules, testing.
- Agent workflow: [.cursor/skills/api-layer-migration/SKILL.md](.cursor/skills/api-layer-migration/SKILL.md)

**Per-route columns**


| Column      | Meaning                                                                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Legacy path | Current documented path                                                                                                                       |
| v1 path     | Target under `/api/v1/...`                                                                                                                    |
| Migrated    | Done when **v1 route exists**, **legacy handler removed**, and **callers** (app + tests + Postman) use `**/api/v1/...`** with the v1 envelope |
| API module  | Service + DTO paths                                                                                                                           |
| HTTP unit   | Full unit tests for the `*.http.ts` file                                                                                                      |
| ≥1 int      | At least one integration test for that HTTP module                                                                                            |
| API_V1.md   | Subsection added/updated                                                                                                                      |


---

## P0 — Database View (DBV) backing APIs


| Legacy path                | v1 path (proposed)                    | Migrated | API module                               | HTTP unit | ≥1 int | API_V1.md |
| -------------------------- | ------------------------------------- | -------- | ---------------------------------------- | --------- | ------ | --------- |
| GET /api/characters        | GET /api/v1/catalog/characters        | [x]      | `CatalogService` + `dbv-catalog.http.ts` | [x]       | [x]    | [x]       |
| GET /api/locations         | GET /api/v1/catalog/locations         | [x]      | `CatalogService` + `dbv-catalog.http.ts` | [x]       | [x]    | [x]       |
| GET /api/special-cards     | GET /api/v1/catalog/special-cards     | [x]      | `CatalogService` + `dbv-catalog.http.ts` | [x]       | [x]    | [x]       |
| GET /api/missions          | GET /api/v1/catalog/missions          | [x]      | `CatalogService` + `dbv-catalog.http.ts` | [x]       | [x]    | [x]       |
| GET /api/events            | GET /api/v1/catalog/events            | [x]      | `CatalogService` + `dbv-catalog.http.ts` | [x]       | [x]    | [x]       |
| GET /api/aspects           | GET /api/v1/catalog/aspects           | [x]      | `CatalogService` + `dbv-catalog.http.ts` | [x]       | [x]    | [x]       |
| GET /api/advanced-universe | GET /api/v1/catalog/advanced-universe | [x]      | `CatalogService` + `dbv-catalog.http.ts` | [x]       | [x]    | [x]       |
| GET /api/teamwork          | GET /api/v1/catalog/teamwork          | [x]      | `CatalogService` + `dbv-catalog.http.ts` | [x]       | [x]    | [x]       |
| GET /api/ally-universe     | GET /api/v1/catalog/ally-universe     | [x]      | `CatalogService` + `dbv-catalog.http.ts` | [x]       | [x]    | [x]       |
| GET /api/training          | GET /api/v1/catalog/training          | [x]      | `CatalogService` + `dbv-catalog.http.ts` | [x]       | [x]    | [x]       |
| GET /api/basic-universe    | GET /api/v1/catalog/basic-universe    | [x]      | `CatalogService` + `dbv-catalog.http.ts` | [x]       | [x]    | [x]       |
| GET /api/power-cards       | GET /api/v1/catalog/power-cards       | [x]      | `CatalogService` + `dbv-catalog.http.ts` | [x]       | [x]    | [x]       |
| GET /api/foil-card-map     | GET /api/v1/catalog/foil-card-map     | [x]      | `CatalogService` + `dbv-catalog.http.ts` | [x]       | [x]    | [x]       |
| GET /api/sets              | GET /api/v1/dbv/sets                  | [x]      | `DbvSupportService` + `dbv-support.http.ts` | [x]       | [x]    | [x]       |
| GET /api/deck-backgrounds  | GET /api/v1/dbv/deck-backgrounds      | [ ]      | dbv-support                              | [ ]       | [ ]    | [ ]       |
| GET /api/test (diagnostic) | TBD or skip                           | [ ]      | —                                        | [ ]       | [ ]    | [ ]       |


---

## P1 — Auth (API clients)


| Legacy path           | v1 path                  | Migrated | API module                           | HTTP unit | ≥1 int | API_V1.md |
| --------------------- | ------------------------ | -------- | ------------------------------------ | --------- | ------ | --------- |
| POST /api/auth/login  | POST /api/v1/auth/login  | [x]      | `auth.http.ts` + `V1JwtTokenService` | [x]       | [x]    | [x]       |
| GET /api/auth/me      | GET /api/v1/auth/me      | [x]      | `auth.http.ts`                       | [x]       | [x]    | [x]       |
| POST /api/auth/logout | POST /api/v1/auth/logout | [x]      | `auth.http.ts`                       | [x]       | [x]    | [x]       |


---

## P2 — Decks (database-backed)


| Area                                         | Legacy (see API_DOCUMENTATION) | v1 prefix      | Migrated | Notes            |
| -------------------------------------------- | ------------------------------ | -------------- | -------- | ---------------- |
| List, CRUD, validate, cards, stats, UI prefs | /api/decks…                    | /api/v1/decks… | [ ]      | User-scoped only |


---

## P3 — Collections


| Legacy                | v1                       | Migrated |
| --------------------- | ------------------------ | -------- |
| /api/collections/me/* | /api/v1/collections/me/* | [ ]      |


---

## P4 — Guest decks


| Legacy            | v1                   | Migrated |
| ----------------- | -------------------- | -------- |
| /api/guest/decks… | /api/v1/guest/decks… | [ ]      |


---

## P5 — Admin only (`/api/v1/admin/...`)

All elevated operations must live under `/api/v1/admin/...` (no client “admin” flags).


| Legacy                      | v1                            | Migrated |
| --------------------------- | ----------------------------- | -------- |
| GET/POST /api/users (admin) | /api/v1/admin/users…          | [ ]      |
| GET /api/debug/*            | /api/v1/admin/debug/*         | [ ]      |
| GET /api/database/status    | /api/v1/admin/database/status | [ ]      |


---

## P6 — Static, health, HTML shell

Usually out of scope for JSON v1; list here only if product requires API-style docs.


| Legacy                                 | Notes                          |
| -------------------------------------- | ------------------------------ |
| /health, static, /data, /users/… pages | [ ] N/A or document separately |


---

## P7 — Policy follow-ups

Catalog routes under `/api/v1/catalog/...` are **public read-only** today (no Bearer JWT), matching legacy public DBV backing GETs. Putting catalog **behind auth** (or tightening exposure) is a **product change**, not a migration default. If you pursue it, treat the items below as deliverables.

**Decisions (before implementation)**

- **Audience / access:** **GUEST** accounts **log in with username/password like any other user**; **role does not gate catalog** for now. **When catalog is secured** (session or Bearer on v1), **non-authenticated clients must not** read the card catalog on those routes—**401** with no card payload until they log in. **Do not** allow anonymous or invalid-session access alongside “authenticated-only” catalog on the same secured endpoints. Use the **normal** v1 login/refresh flow for everyone; do not invent a separate “guest catalog” credential path unless product later requires it. *(Today catalog is still public until you implement this change.)*
- **Credential:** Bearer JWT on v1 only vs also supporting session-cookie callers for the same JSON (today much of the app uses legacy session routes for DBV).
- **Scope:** All `/api/v1/catalog/*` uniformly vs exceptions (e.g. a minimal public subset).
- **Rate limiting:** If the goal is abuse control, decide **per-IP**, **per-user/JWT**, or edge/CDN rules—and whether auth is required for that policy.

**Implementation deliverables**

| Deliverable | Notes |
|-------------|-------|
| HTTP middleware | Apply v1 bearer (or agreed auth) to the relevant `router.get` handlers in `src/api/http/dbv-catalog.http.ts` (or a shared `Router` with middleware); return **401** with the v1 error envelope when required credentials are missing or invalid. |
| `API_V1.md` | For each affected path: **Auth** line, required headers, and example error body; remove or qualify any “Auth: None” wording. |
| `API_DOCUMENTATION.md` | If legacy public GETs remain, state clearly how they relate to the new v1 policy (deprecated, unchanged, or aligned). |
| App / DBV callers | Callers must send the agreed credential; handle **401** with login (or token refresh). Once v1 catalog is secured, **do not** treat anonymous users as entitled to card catalog JSON on those routes (avoid “fall back to public legacy catalog” for unauthenticated sessions if that undermines the policy). |
| Postman / Insomnia | Update collections and environment notes so catalog requests are not “no auth” by accident. |
| HTTP unit tests | Cover success with valid token (and failure without), matching patterns in other `*.http.ts` modules. |
| Integration tests | When catalog is secured: **401** without valid auth; **GUEST** and non-GUEST both succeed **after** login (role is not a gate for now). |
| Checklist rows | When done, add a short note in **P0** (or here) so future readers know catalog auth is intentional, not an oversight. |

**Optional (only if needed for the chosen policy)**

- **Docs for operators:** Rate-limit keys, logging, and monitoring for catalog traffic.
- **Deprecation / comms:** If external API consumers relied on public catalog, document a cutover date or version note.