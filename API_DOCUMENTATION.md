# HTTP API documentation

This document describes the **Excelsior / Overpower Deckbuilder** backend HTTP surface implemented in Express (`src/routes/`, registered from `src/routes/index.ts`). It is intended for developers integrating with or extending the server.

**Legacy contract:** this file documents routes that use the typical `{ success, data, error }` JSON shape and **session cookie** (`sessionId`) authentication unless noted otherwise.

**Versioned API (`/api/v1`):** the separate **[API_V1.md](API_V1.md)** document describes the Bearer JWT API, `{ data, meta, errors }` envelope, and per-endpoint examples. Use it for all new v1 clients.

**Migration:** track route-by-route work in **[API_MIGRATION_CHECKLIST.md](API_MIGRATION_CHECKLIST.md)**. Architecture and layering rules are in **[MIGRATION_ARCHITECTURE.md](MIGRATION_ARCHITECTURE.md)**.

**Related code:** route registration order matches `registerRoutes()` in `src/routes/index.ts`. The application composition root is `src/index.ts`. v1 routes are registered via `registerApiV1Routes()` from `src/api/http/registerApiV1Routes.ts`.

---

## Table of contents

1. [General conventions](#general-conventions)
2. [Authentication and sessions](#authentication-and-sessions)
3. [Static assets and health](#static-assets-and-health)
4. [Auth and client config](#auth-and-client-config)
5. [Card catalog and backgrounds](#card-catalog-and-backgrounds)
6. [Users, admin, and debug](#users-admin-and-debug)
7. [Decks (database-backed)](#decks-database-backed)
8. [Guest decks (session memory)](#guest-decks-session-memory)
9. [Collections](#collections)
10. [Sets](#sets)
11. [HTML pages (SPA shell)](#html-pages-spa-shell)
12. [Integration test server](#integration-test-server)
13. [Route index](#route-index)

---

## General conventions

### Base URL

- **Local development:** `http://localhost:8085` (unless `PORT` is set).

### Content type

- Request bodies for JSON APIs: `Content-Type: application/json`.
- Responses are JSON unless noted (HTML, JavaScript, redirects, `304` with empty body).

### Common JSON shapes

**Success (typical):**

```json
{ "success": true, "data": {} }
```

**Error (typical):**

```json
{ "success": false, "error": "Human-readable message" }
```

Some endpoints return additional fields (for example `validationErrors`, `message`, `details`).

### HTTP status codes (typical)

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 304 | Not Modified (`ETag` match — see `GET /api/decks`) |
| 400 | Bad request / validation error |
| 401 | Not authenticated / invalid session |
| 403 | Forbidden (wrong role, not owner, guest blocked from mutation, read-only mode) |
| 404 | Not found |
| 409 | Conflict (e.g. duplicate username) |
| 429 | Rate limited |
| 500 | Server error |
| 501 | Not implemented |
| 503 | Unavailable (e.g. health critical failure, Google auth not configured) |

### Read-only mode

Some mutating deck operations honor read-only mode when indicated by query `?readonly=true`, URL param `readonly=true`, or header `x-readonly-mode: true`. The server responds with **403** and a message that the operation is not allowed in read-only mode. See `src/routes/helpers.ts`.

### Rate limiting

Per-IP rate limits apply to several deck mutations (creation, updates, card changes, UI preferences). On exceed: **429** with `success: false` and a message. See `checkRateLimit` in `src/routes/helpers.ts` (default window and max requests are defined there).

---

## Authentication and sessions

### Session cookie

- **Name:** `sessionId`
- **Attributes:** `httpOnly`, `sameSite: 'lax'`, `secure` when `COOKIE_SECURE=true`, **max age ~2 hours**

Successful login, signup, or Google sign-in sets this cookie. Send it on subsequent requests (`credentials: 'include'` in `fetch`, or browser same-origin navigation).

### Roles

Users have a `role` of `GUEST`, `USER`, or `ADMIN` (see `src/types/index.ts`).

- **GUEST:** May use guest-deck APIs and read-only deck APIs where allowed; **cannot** create/update/delete database-backed decks or mutate their cards (blocked with **403** on those routes).
- **USER / ADMIN:** Full deck and collection access per endpoint rules.
- **ADMIN:** Additional endpoints (user list, cache clear, database status).

---

## Static assets and health

| Method | Path | Source file | Description |
|--------|------|-------------|-------------|
| * | `/public/*` | `src/routes/static-health.routes.ts` | Static files under `public/` with `/public` prefix |
| * | `/*` (root static) | `src/routes/static-health.routes.ts` | Static files from `public/` at site root; **`.js` files** get no-cache headers |
| * | `/src/resources/*` | `src/routes/static-health.routes.ts` | Static files from repo `src/resources` |
| * | `/src/resources/cards/images/*` | `src/middleware/setup.ts` | Narrower mount for card images (registered before full tree) |
| * | `/src/resources/images/*` | `src/middleware/setup.ts` | Narrower mount for general images |

### `GET /health`

**File:** `src/routes/static-health.routes.ts`

Returns a large JSON payload: `status` (`OK`, `DEGRADED`, or `ERROR`), `timestamp`, `uptime`, `version`, `environment`, `git` (commit metadata), `resources` (memory/CPU), `database` (connectivity, counts, Flyway latest migration), and `latency`. **503** when `status === 'ERROR'`; degraded DB may still return **200** with `DEGRADED`.

**Sample (truncated):**

```http
GET /health HTTP/1.1
Host: localhost:8085
```

```json
{
  "status": "OK",
  "timestamp": "2026-04-03T12:00:00.000Z",
  "uptime": 123.45,
  "version": "1.0.0",
  "environment": "development",
  "git": {
    "commit": "...",
    "shortCommit": "abc1234",
    "branch": "main",
    "commitMessage": "...",
    "commitAuthor": "...",
    "commitEmail": "...",
    "commitDate": "..."
  },
  "resources": {
    "memory": { "rss": "120MB", "heapTotal": "40MB", "heapUsed": "35MB", "external": "2MB" },
    "cpu": { "platform": "darwin", "arch": "arm64", "nodeVersion": "v20.x" }
  },
  "database": {
    "status": "OK",
    "latency": "5ms",
    "connection": "Active",
    "stats": {
      "totalUsers": 10,
      "totalDecks": 50,
      "totalDeckCards": 500,
      "totalCharacters": 200,
      "totalSpecialCards": 100,
      "totalPowerCards": 300
    },
    "migrations": { "latest": { "version": "42", "description": "...", "success": true } }
  },
  "latency": "12ms"
}
```

---

## Auth and client config

**File:** `src/routes/auth.routes.ts` (handlers delegate to `AuthenticationService` in `src/services/AuthenticationService.ts`).

### `POST /api/auth/login`

**Body:**

```json
{ "username": "kyle", "password": "test" }
```

**Response 200:** Sets `sessionId` cookie.

```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "kyle",
    "role": "USER"
  }
}
```

**Response 400:** missing fields. **401:** invalid credentials.

### `POST /api/auth/signup`

**Body:**

```json
{ "username": "newuser", "email": "newuser@example.com", "password": "secret" }
```

**Response 201:** Session cookie set; body same shape as login (`userId`, `username`, `role`). **400:** validation. **409:** username or email exists. **429:** signup rate limit.

### `POST /api/auth/google`

**Body:**

```json
{ "idToken": "<Firebase ID token>" }
```

**Response 200:** Same `data` shape as login. **400:** missing token. **401:** invalid token. **503:** Firebase not configured. **429:** too many new accounts (IP-based).

### `POST /api/auth/logout`

**Response 200:**

```json
{ "success": true, "message": "Logged out successfully" }
```

Clears server session and `sessionId` cookie.

### `GET /api/auth/me`

**Auth:** Session cookie.

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "kyle",
    "email": "kyle@example.com",
    "role": "USER",
    "lastLoginAt": "2026-04-03T10:00:00.000Z"
  }
}
```

**401:** No or invalid session.

### `GET /api/config/firebase`

Public. **Response 200:**

```json
{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "appId": "..."
}
```

Values come from environment variables (`FIREBASE_*`).

### `GET /js/app-config.js`

Returns **JavaScript** (not JSON), `Content-Type: application/javascript`, short cache. Body shape:

```javascript
window.APP_CDN_BASE = "https://cdn.example.com";
```

(`CDN_BASE_URL` env; empty string if unset.)

---

## Card catalog and backgrounds

**File:** `src/routes/card-api.routes.ts`

**Service layer:** All **table-backed catalog** GETs in this file (`/api/characters`, `/locations`, `/special-cards`, `/missions`, `/events`, `/aspects`, `/advanced-universe`, `/teamwork`, `/ally-universe`, `/training`, `/basic-universe`, `/power-cards`, `/foil-card-map`, and **`GET /test`** counts/stats) call **`CatalogService`** only ([`src/api/services/catalogService.ts`](src/api/services/catalogService.ts)). The service delegates to **`PostgreSQLCardRepository`** and **`FoilCardMapRepository`**—handlers do **not** call those repositories directly. **`GET /api/v1/catalog/characters`** uses the same service ([API_V1.md](API_V1.md)).

**`GET /api/deck-backgrounds`** uses **`deckBackgroundService`** (separate domain service), not the card catalog service.

Unless noted, these are **GET**, unauthenticated, and return:

```json
{ "success": true, "data": [ /* array of card records from DB */ ] }
```

**500** on failure: `{ "success": false, "error": "..." }`.

| Path | Data |
|------|------|
| `/api/characters` | All characters |
| `/api/locations` | All locations |
| `/api/special-cards` | Special cards |
| `/api/missions` | Missions |
| `/api/events` | Events |
| `/api/aspects` | Aspects |
| `/api/advanced-universe` | Advanced universe |
| `/api/teamwork` | Teamwork |
| `/api/ally-universe` | Ally universe |
| `/api/training` | Training |
| `/api/basic-universe` | Basic universe |
| `/api/power-cards` | Power cards |
| `/api/foil-card-map` | Foil mapping rows |

**Sample:**

```http
GET /api/characters HTTP/1.1
```

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Spider-Man",
      "...": "additional fields per table"
    }
  ]
}
```

### `GET /api/deck-backgrounds`

**Auth:** Required (`authenticateUser`).

**Response 200:**

```json
{ "success": true, "data": [ /* available background descriptors */ ] }
```

### `GET /test`

Diagnostic JSON (not for production reliance). **Response 200:**

```json
{
  "characters": 200,
  "locations": 50,
  "stats": { },
  "sampleLocation": { }
}
```

On the **integration test server**, another `GET /test` is registered first and **shadows** this handler (see [Integration test server](#integration-test-server)).

---

## Users, admin, and debug

**File:** `src/routes/users-debug.routes.ts`

### `GET /api/users`

**Auth:** Admin only.

**Response 200:**

```json
{ "success": true, "data": [ /* user records; shape from user repository */ ] }
```

### `POST /api/users`

**Auth:** Admin only.

**Body:**

```json
{ "username": "demo", "password": "secret" }
```

**Response 201:**

```json
{
  "success": true,
  "data": { "id": "...", "name": "demo", "email": "demo@example.com", "role": "USER" },
  "message": "User \"demo\" created successfully"
}
```

Password hash is not returned. **409** if username exists.

### `POST /api/users/change-password`

**Auth:** `USER` or `ADMIN` only.

**Body:**

```json
{ "newPassword": "newsecret" }
```

**Response 200:** `{ "success": true, "message": "Password updated" }`

### `GET /api/debug/clear-cache` / `GET /api/debug/clear-card-cache`

**Auth:** Admin only.

**Response 200:**

```json
{ "success": true, "message": "Deck cache cleared" }
```

or

```json
{ "success": true, "message": "Card repository cache cleared" }
```

### `GET /api/database/status`

**File:** `src/routes/static-health.routes.ts`  
**Auth:** Admin only.

**Response 200:**

```json
{
  "status": "OK",
  "database": {
    "valid": true,
    "upToDate": true,
    "migrations": "Flyway managed"
  }
}
```

---

## Decks (database-backed)

### `GET /api/decks`

**File:** `src/routes/decks.routes.ts` (router mounted at `/api` in `src/routes/index.ts`)

**Auth:** Required.

Returns the current user’s deck list, transformed for the frontend (`transformDeckList`). Sends **ETag** (SHA-1 of JSON body), `Cache-Control: private, max-age=30`, and `Vary: Cookie`. If request header `If-None-Match` matches **ETag**, responds **304** with **empty body**.

**Response 200 (sample structure — fields depend on transformer):**

```json
{
  "success": true,
  "data": [
    {
      "id": "deck-uuid",
      "name": "My Deck",
      "description": "",
      "card_count": 60,
      "user_id": "user-uuid",
      "...": "additional list fields"
    }
  ]
}
```

### Deck CRUD and cards

**File:** `src/routes/deck-api.routes.ts`

Unless noted, **auth required**. Guest users receive **403** on mutations that change DB decks (create, update, delete, card POST/PUT/DELETE, UI prefs PUT).

#### `POST /api/decks`

Creates a deck. Rate limit + read-only checks apply.

**Body:**

```json
{
  "name": "New Deck",
  "description": "Optional",
  "characters": ["optional-uuid-up-to-50"]
}
```

**Response 201:**

```json
{ "success": true, "data": { /* created deck record */ } }
```

#### `POST /api/decks/validate`

**Body:**

```json
{
  "cards": [
    { "cardType": "character", "cardId": "uuid", "quantity": 1 }
  ]
}
```

**Response 200:**

```json
{ "success": true, "message": "Deck is valid" }
```

**Response 400:**

```json
{
  "success": false,
  "error": "message1; message2",
  "validationErrors": [{ "message": "...", "...": "..." }]
}
```

#### `GET /api/decks/:id` and `GET /api/decks/:id/full`

**Response 200:**

```json
{
  "success": true,
  "data": {
    "metadata": {
      "id": "deck-uuid",
      "name": "My Deck",
      "description": "",
      "created": "2026-01-01T00:00:00.000Z",
      "lastModified": "2026-01-02T00:00:00.000Z",
      "cardCount": 60,
      "userId": "owner-uuid",
      "uiPreferences": {},
      "isOwner": true,
      "is_limited": false,
      "reserve_character": null,
      "display_mission_card_id": null,
      "background_image_path": null
    },
    "cards": [
      { "type": "character", "cardId": "uuid", "quantity": 1 }
    ]
  }
}
```

`/full` uses a heavier repository load (`getDeckSummaryWithAllCards`) for full card hydration.

**404** if deck missing.

#### `PUT /api/decks/:id`

**Owner only.** Optional fields: `name`, `description`, `is_limited`, `is_valid`, `reserve_character`, `display_mission_card_id`, `background_image_path` (validated against known backgrounds when set).

**Response 200:** `success` + `data` with `metadata` (updated) and `cards: []` in the success path shown in code.

#### `DELETE /api/decks/:id`

**Owner only.**

**Response 200:**

```json
{ "success": true, "message": "Deck deleted successfully" }
```

#### `GET /api/decks/:id/cards`

If the repository implements `getDeckCards`, **200:** `{ "success": true, "data": [ /* cards */ ] }`. Otherwise **501:** `{ "success": false, "error": "Not implemented" }`.

#### `POST /api/decks/:id/cards`

**Owner only.** **Body:**

```json
{ "cardType": "character", "cardId": "uuid", "quantity": 1 }
```

**Response 200:** `{ "success": true, "data": { /* full deck from getDeckById */ } }`

May **400** for game rules (one-per-deck, cataclysm/assist/ambush/fortification limits, etc.) or **403** if not owner.

#### `PUT /api/decks/:id/cards`

Bulk replace (max 100 cards). **Body:**

```json
{
  "cards": [
    { "cardType": "character", "cardId": "uuid", "quantity": 1 }
  ]
}
```

**Response 200:** `{ "success": true, "data": { /* updated deck */ } }`

#### `DELETE /api/decks/:id/cards`

**Body** for partial remove:

```json
{ "cardType": "character", "cardId": "uuid", "quantity": 1 }
```

**Body** to clear all cards:

```json
{ "cardType": "all", "cardId": "all" }
```

**Response 200:** `{ "success": true, "data": { /* updated deck */ } }`

#### `GET /api/deck-stats`

**Response 200:**

```json
{
  "success": true,
  "data": {
    "totalDecks": 3,
    "totalCards": 180,
    "averageCardsPerDeck": 60,
    "largestDeckSize": 75
  }
}
```

#### `GET /api/decks/:id/ui-preferences` / `PUT /api/decks/:id/ui-preferences`

**Owner only** (GET/PUT check ownership).

**GET 200:** `{ "success": true, "data": { } }` (object may be empty).

**PUT body:** JSON object, e.g. `{ "viewMode": "tile", "sortBy": "name", "filterBy": "all" }`. Constraints: `viewMode` ∈ `tile` | `list`; string fields max length; total JSON string length ≤ 1000.

**PUT 200:** `{ "success": true, "data": { /* same preferences sent */ } }`

---

## Guest decks (session memory)

**File:** `src/routes/guest-decks.routes.ts`

All routes require **GUEST** role and a **session cookie** (`requireGuestSession`). Non-guests get **403** `{ "success": false, "error": "Guest deck endpoints are only available to GUEST users" }`.

Guest decks are stored **in memory** keyed by session; they are **not** persisted to PostgreSQL.

### `POST /api/guest/decks`

**Body (optional):** `{ "name": "My Deck", "description": "" }`

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "guest-deck-id",
    "name": "My Deck",
    "description": "",
    "created_at": "2026-04-03T12:00:00.000Z",
    "updated_at": "2026-04-03T12:00:00.000Z"
  }
}
```

### `GET /api/guest/decks`

Returns **merged** list: DB decks for the guest user (`getDecksByUserId` + `transformDeckList`) **plus** session guest decks as list items.

```json
{ "success": true, "data": [ /* combined list */ ] }
```

### `GET /api/guest/decks/:id`

**Response 200:**

```json
{
  "success": true,
  "data": {
    "metadata": { "id": "...", "name": "...", "isOwner": true, "...": "..." },
    "cards": []
  }
}
```

### `PUT /api/guest/decks/:id`

Updates name/description. **Response 200:** `{ "success": true, "data": { /* list item shape */ } }`

### `PUT /api/guest/decks/:id/cards`

Replace all cards (same validation style as DB deck replace, max 100). **Response 200:** `{ "success": true, "data": { "metadata": {...}, "cards": [...] } }`

### `POST /api/guest/decks/:id/cards`

Add card; same rule checks as DB add (one-per-deck, cataclysm, etc.). **Response 200:** full guest deck object in `data`.

### `DELETE /api/guest/decks/:id`

**Response 200:** `{ "success": true }`

---

## Collections

**File:** `src/routes/collections.routes.ts`

All routes require authentication.

**Valid `cardType` values** for collection APIs:  
`character`, `special`, `power`, `location`, `mission`, `event`, `aspect`, `advanced_universe`, `teamwork`, `ally_universe`, `training`, `basic_universe` (see `isValidCollectionCardType` in `src/routes/helpers.ts`).

### `GET /api/collections/me`

**Response 200:**

```json
{ "success": true, "data": { "id": "collection-uuid", "user_id": "user-uuid" } }
```

### `GET /api/collections/me/cards`

**Response 200:**

```json
{ "success": true, "data": [ /* collection rows from service */ ] }
```

### `POST /api/collections/me/cards`

**Body:**

```json
{
  "cardId": "card-uuid",
  "cardType": "character",
  "quantity": 1,
  "imagePath": "optional/path"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "card_id": "card-uuid",
    "card_type": "character",
    "image_path": "...",
    "quantity": 1
  }
}
```

### `POST /api/collections/me/cards/remove-one`

**Body:**

```json
{
  "cardId": "card-uuid",
  "cardType": "character",
  "imagePath": "/path/to/image.png"
}
```

**Response 200:**

```json
{
  "success": true,
  "data": { /* updated row */ },
  "message": "One copy removed from collection"
}
```

### `PUT /api/collections/me/cards/:cardId`

**Body:**

```json
{
  "quantity": 2,
  "cardType": "character",
  "imagePath": "/path.png",
  "oldImagePath": "/optional/previous.png"
}
```

**Response 200:** Updated row in `data`, or `data: null` with `message: "Card removed from collection"` when quantity is 0.

### `DELETE /api/collections/me/cards/:cardId?cardType=character`

**Query:** `cardType` required and must be valid.

**Response 200:** `{ "success": true, "message": "Card removed from collection" }`

### `GET /api/collections/me/history?limit=50`

Optional positive integer `limit`. **Response 200:**

```json
{ "success": true, "data": [ /* history entries */ ] }
```

---

## Sets

**File:** `src/routes/sets.routes.ts`

### `GET /api/sets`

**Response 200:**

```json
{ "success": true, "data": [ /* set code → name rows from DB */ ] }
```

---

## HTML pages (SPA shell)

**File:** `src/routes/pages.routes.ts`

These return **`public/index.html`** (single-page app) with no-cache headers except where noted.

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| GET | `/` | No | Home |
| GET | `/logout` | No | Clears session server-side and cookie, **redirects** to `/` |
| GET | `/users/:userId/decks` | Yes | **403 JSON** if not own user id and not guest access |
| GET | `/users/:userId/decks/:deckId` | No | Deck editor shell (client loads data via API) |
| GET | `/users/:userId/collection` | Yes | Collection page |
| GET | `/data` | No | Database / card DB view |

---

## Integration test server

**Files:** `src/test-server/bootstrap.ts`, `src/test-server/testOnlyRoutes.ts`

The integration test app calls the same `registerRoutes()` but may register **additional** or **overriding** routes first:

- Component static paths: `/components/globalNav.html`, `.css`, `.js`
- Lenient HTML for `/users/:userId/decks` and `/users/:userId/decks/:deckId` (wins over `pages.routes` on that server)
- `GET /users/:userId/decks/:deckId/edit` (HTML)
- `GET /test` (JSON — **shadows** `card-api` `GET /test`)
- `GET /deck-editor/:deckId` (minimal test HTML)
- Fallback **404** JSON for unknown routes

Use this section when reading integration tests, not as part of the primary production API contract.

---

## Route index

Quick lookup: **method**, **path**, **source file**.

| Method | Path | File |
|--------|------|------|
| * | `/public`, `/`, `/src/resources` (+ setup mounts) | `static-health.routes.ts`, `middleware/setup.ts` |
| GET | `/health` | `static-health.routes.ts` |
| GET | `/api/database/status` | `static-health.routes.ts` |
| POST | `/api/auth/login`, `/signup`, `/google`, `/logout` | `auth.routes.ts` |
| GET | `/api/auth/me`, `/api/config/firebase`, `/js/app-config.js` | `auth.routes.ts` |
| GET | `/api/characters`, `/locations`, `/special-cards`, `/missions`, `/events`, `/aspects`, `/advanced-universe`, `/teamwork`, `/ally-universe`, `/training`, `/basic-universe`, `/power-cards`, `/foil-card-map`, `/deck-backgrounds`, `/test` | `card-api.routes.ts` |
| GET | `/api/users` | `users-debug.routes.ts` |
| GET | `/api/debug/clear-cache`, `/api/debug/clear-card-cache` | `users-debug.routes.ts` |
| POST | `/api/users`, `/api/users/change-password` | `users-debug.routes.ts` |
| GET | `/api/decks` | `decks.routes.ts` |
| POST/GET/PUT/DELETE | `/api/guest/decks`, `/api/guest/decks/:id`, `.../cards` | `guest-decks.routes.ts` |
| POST/GET/PUT/DELETE | `/api/decks`, `/api/decks/validate`, `/api/decks/:id`, `/full`, `/cards`, `/api/deck-stats`, `/ui-preferences` | `deck-api.routes.ts` |
| GET/POST/PUT/DELETE | `/api/collections/me/*` | `collections.routes.ts` |
| GET | `/api/sets` | `sets.routes.ts` |
| GET | `/`, `/logout`, `/users/...`, `/data` | `pages.routes.ts` |

### API v1 (`/api/v1`)

Full contract, examples, and envelopes: **[API_V1.md](API_V1.md)**. Registration: [`src/api/http/registerApiV1Routes.ts`](src/api/http/registerApiV1Routes.ts) (called from `src/index.ts` and `src/test-server/bootstrap.ts`).

| Method | Path | HTTP module |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | `src/api/http/auth.http.ts` |
| GET | `/api/v1/auth/me` | `src/api/http/auth.http.ts` |
| POST | `/api/v1/auth/logout` | `src/api/http/auth.http.ts` |
| GET | `/api/v1/catalog/characters` | `src/api/http/dbv-catalog.http.ts` |

---

## Maintaining this document

When adding or changing **legacy** routes, update the corresponding `src/routes/*.ts` file and adjust this document so samples and paths stay accurate. Route registration order is defined in `src/routes/index.ts`.

When adding or changing **`/api/v1`** routes, update **[API_V1.md](API_V1.md)** in the same change and tick **[API_MIGRATION_CHECKLIST.md](API_MIGRATION_CHECKLIST.md)**.

When a route’s implementation moves into **`src/api/`** (encapsulated API layer), update the route’s section and the [Route index](#route-index) to reference both the route file and the API module. Agent workflow: `.cursor/skills/api-layer-migration/SKILL.md`.
