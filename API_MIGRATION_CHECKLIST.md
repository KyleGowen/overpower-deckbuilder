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
| GET /api/deck-backgrounds  | GET /api/v1/dbv/deck-backgrounds      | [x]      | `DeckBackgroundService` + `dbv-support.http.ts` | [x]       | [x]    | [x]       |
| ~~GET /test~~ (diagnostic; checklist formerly said `/api/test`) | *removed — not migrated* | n/a | — | — | — | — |


---

## P1 — Auth (API clients)


| Legacy path           | v1 path                  | Migrated | API module                           | HTTP unit | ≥1 int | API_V1.md |
| --------------------- | ------------------------ | -------- | ------------------------------------ | --------- | ------ | --------- |
| POST /api/auth/login  | POST /api/v1/auth/login  | [x]      | `auth.http.ts` + `V1JwtTokenService` | [x]       | [x]    | [x]       |
| GET /api/auth/me      | GET /api/v1/auth/me      | [x]      | `auth.http.ts`                       | [x]       | [x]    | [x]       |
| POST /api/auth/logout | POST /api/v1/auth/logout | [x]      | `auth.http.ts`                       | [x]       | [x]    | [x]       |


---

## P2 — Decks (database-backed)

**Scope:** Authenticated user decks in PostgreSQL; **GUEST** gets **403** on DB deck mutations (same as legacy). **Source:** `API_DOCUMENTATION.md` (Decks), `deck-api.routes.ts`. **P2a list:** [`decks.http.ts`](src/api/http/decks.http.ts) + [`deckListService.ts`](src/api/services/deckListService.ts).

**v1 prefix:** `/api/v1/decks…` (except legacy **`GET /api/deck-stats`**, proposed as **`GET /api/v1/decks/stats`** below).

### P2a — Deck list (ETag)

| Legacy path     | v1 path (proposed) | Migrated | API module | HTTP unit | ≥1 int | API_V1.md |
| --------------- | ------------------ | -------- | ---------- | --------- | ------ | --------- |
| GET /api/decks  | GET /api/v1/decks  | [x]      | `DeckListService` + `decks.http.ts` | [x]       | [x]    | [x]       |

### P2b — Create + validate

| Legacy path              | v1 path (proposed)           | Migrated | API module | HTTP unit | ≥1 int | API_V1.md |
| ------------------------ | ---------------------------- | -------- | ---------- | --------- | ------ | --------- |
| POST /api/decks          | POST /api/v1/decks           | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |
| POST /api/decks/validate | POST /api/v1/decks/validate  | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |

### P2c — Single deck (metadata + delete)

| Legacy path                 | v1 path (proposed)              | Migrated | API module | HTTP unit | ≥1 int | API_V1.md |
| --------------------------- | ------------------------------- | -------- | ---------- | --------- | ------ | --------- |
| GET /api/decks/:id          | GET /api/v1/decks/:id           | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |
| GET /api/decks/:id/full     | GET /api/v1/decks/:id/full      | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |
| PUT /api/decks/:id          | PUT /api/v1/decks/:id           | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |
| DELETE /api/decks/:id       | DELETE /api/v1/decks/:id        | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |

### P2d — Deck cards

| Legacy path                   | v1 path (proposed)                | Migrated | API module | HTTP unit | ≥1 int | API_V1.md |
| ----------------------------- | --------------------------------- | -------- | ---------- | --------- | ------ | --------- |
| GET /api/decks/:id/cards      | GET /api/v1/decks/:id/cards       | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |
| POST /api/decks/:id/cards     | POST /api/v1/decks/:id/cards      | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |
| PUT /api/decks/:id/cards      | PUT /api/v1/decks/:id/cards       | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |
| DELETE /api/decks/:id/cards   | DELETE /api/v1/decks/:id/cards    | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |

### P2e — Aggregate deck stats

| Legacy path        | v1 path (proposed)        | Migrated | API module | HTTP unit | ≥1 int | API_V1.md |
| ------------------ | ------------------------- | -------- | ---------- | --------- | ------ | --------- |
| GET /api/deck-stats | GET /api/v1/decks/stats   | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |

### P2f — Deck UI preferences

| Legacy path                         | v1 path (proposed)                         | Migrated | API module | HTTP unit | ≥1 int | API_V1.md |
| ----------------------------------- | ------------------------------------------ | -------- | ---------- | --------- | ------ | --------- |
| GET /api/decks/:id/ui-preferences   | GET /api/v1/decks/:id/ui-preferences       | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |
| PUT /api/decks/:id/ui-preferences   | PUT /api/v1/decks/:id/ui-preferences       | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |


---

## P3 — Collections

**Scope:** Authenticated collection + card rows + history. **Source:** `API_DOCUMENTATION.md` (Collections), `collections.routes.ts`.

**v1 prefix:** `/api/v1/collections/me…`

### P3a — Collection record

| Legacy path              | v1 path (proposed)              | Migrated | API module | HTTP unit | ≥1 int | API_V1.md |
| ------------------------ | ------------------------------- | -------- | ---------- | --------- | ------ | --------- |
| GET /api/collections/me  | GET /api/v1/collections/me      | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |

### P3b — Collection cards

| Legacy path                                    | v1 path (proposed)                                       | Migrated | API module | HTTP unit | ≥1 int | API_V1.md |
| ---------------------------------------------- | -------------------------------------------------------- | -------- | ---------- | --------- | ------ | --------- |
| GET /api/collections/me/cards                  | GET /api/v1/collections/me/cards                         | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |
| POST /api/collections/me/cards                 | POST /api/v1/collections/me/cards                        | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |
| POST /api/collections/me/cards/remove-one      | POST /api/v1/collections/me/cards/remove-one             | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |
| PUT /api/collections/me/cards/:cardId          | PUT /api/v1/collections/me/cards/:cardId                 | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |
| DELETE /api/collections/me/cards/:cardId       | DELETE /api/v1/collections/me/cards/:cardId              | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |

Legacy **DELETE** requires query `cardType` (see `API_DOCUMENTATION.md`); keep the same contract in `API_V1.md` when migrated.

### P3c — Collection history

| Legacy path                            | v1 path (proposed)                            | Migrated | API module | HTTP unit | ≥1 int | API_V1.md |
| -------------------------------------- | --------------------------------------------- | -------- | ---------- | --------- | ------ | --------- |
| GET /api/collections/me/history        | GET /api/v1/collections/me/history            | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |


---

## P4 — Guest decks

**Scope:** **GUEST** role + session; in-memory guest decks merged with DB list on **`GET`**. **Source:** `API_DOCUMENTATION.md` (Guest decks), `guest-decks.routes.ts`.

**v1 prefix:** `/api/v1/guest/decks…`

### P4a — Guest list + create

| Legacy path           | v1 path (proposed)        | Migrated | API module | HTTP unit | ≥1 int | API_V1.md |
| --------------------- | ------------------------- | -------- | ---------- | --------- | ------ | --------- |
| GET /api/guest/decks  | GET /api/v1/guest/decks   | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |
| POST /api/guest/decks | POST /api/v1/guest/decks  | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |

### P4b — Guest single deck

| Legacy path                | v1 path (proposed)              | Migrated | API module | HTTP unit | ≥1 int | API_V1.md |
| -------------------------- | ------------------------------- | -------- | ---------- | --------- | ------ | --------- |
| GET /api/guest/decks/:id   | GET /api/v1/guest/decks/:id     | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |
| PUT /api/guest/decks/:id   | PUT /api/v1/guest/decks/:id     | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |
| DELETE /api/guest/decks/:id | DELETE /api/v1/guest/decks/:id | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |

### P4c — Guest deck cards

| Legacy path                     | v1 path (proposed)                    | Migrated | API module | HTTP unit | ≥1 int | API_V1.md |
| ------------------------------- | ------------------------------------- | -------- | ---------- | --------- | ------ | --------- |
| PUT /api/guest/decks/:id/cards  | PUT /api/v1/guest/decks/:id/cards     | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |
| POST /api/guest/decks/:id/cards | POST /api/v1/guest/decks/:id/cards    | [ ]      | TBD        | [ ]       | [ ]    | [ ]       |


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