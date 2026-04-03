# HTTP API v1 (`/api/v1`)

Versioned JSON API for Excelsior. **Legacy** routes remain documented in [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## Conventions

### Base URL

- Local: `http://localhost:8085` (or `PORT`) + prefix **`/api/v1`**.

### Authentication

- **Bearer JWT:** `Authorization: Bearer <access_token>` for protected v1 routes.
- **Login:** `POST /api/v1/auth/login` with JSON body `{ "username", "password" }` returns an access token. Password verification uses the **same** server stack as `POST /api/auth/login` (no separate hashing implementation).

### JSON envelope

All v1 JSON responses use:

```json
{
  "data": {},
  "meta": {},
  "errors": []
}
```

- **`data`:** payload on success; may be `null` on error.
- **`meta`:** optional (e.g. `requestId` later).
- **`errors`:** array of `{ "code": string, "message": string, "field"?: string }`. Do not echo raw user input in messages.

### Status codes

| Code | Use |
|------|-----|
| 200 | Success |
| 400 | Validation / bad request |
| 401 | Missing or invalid auth |
| 403 | Authenticated but not allowed |
| 429 | Rate limited |
| 500 | Server error |

---

## Table of contents

1. [Auth](#auth)
2. [DBV catalog](#dbv-catalog)
3. [DBV support](#dbv-support)
4. [User decks (list)](#user-decks-list)
5. [User decks (create + validate)](#user-decks-create--validate)

---

## Auth

### `POST /api/v1/auth/login`

**Auth:** None.

**Request model:** [`src/api/http/models/auth/LoginRequestBody.ts`](src/api/http/models/auth/LoginRequestBody.ts)

**Body:**

```json
{ "username": "kyle", "password": "test" }
```

**Response 200** (`data`):

```json
{
  "accessToken": "<jwt>",
  "tokenType": "Bearer",
  "expiresInSeconds": 7200,
  "user": {
    "id": "uuid",
    "username": "kyle",
    "role": "USER"
  }
}
```

**Response 400:** `errors` include validation (e.g. missing username/password).

**Response 401:** invalid credentials — generic message, no per-field hint.

**Response 429:** too many login attempts from this IP (sliding window).

**Response 500:** server failure.

---

### `GET /api/v1/auth/me`

**Auth:** Bearer access token.

**Response 200:**

```json
{
  "data": {
    "id": "uuid",
    "username": "kyle",
    "email": "user@example.com",
    "role": "USER",
    "lastLoginAt": "2026-04-03T10:00:00.000Z"
  },
  "meta": {},
  "errors": []
}
```

**Response 401:** missing/invalid/expired token.

---

### `POST /api/v1/auth/logout`

**Auth:** Bearer access token (optional for idempotent no-op).

**Behavior:** v1 logout is **stateless** for JWT (client discards token). Returns **200** with empty success payload. (Server-side token denylist is a future optional enhancement.)

**Response 200:**

```json
{ "data": { "loggedOut": true }, "meta": {}, "errors": [] }
```

---

## DBV catalog

### `GET /api/v1/catalog/characters`

**Auth:** None (same as legacy `GET /api/characters`).

**Request model:** none (no body; no query contract file required for this GET).

**Response 200:** `data` is an array of character records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogCharactersResponseDto.ts`](src/api/dto/v1/CatalogCharactersResponseDto.ts)

### `GET /api/v1/catalog/locations`

**Auth:** None (same as legacy `GET /api/locations`).

**Request model:** none (no body; no query contract file required for this GET).

**Response 200:** `data` is an array of location records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogLocationsResponseDto.ts`](src/api/dto/v1/CatalogLocationsResponseDto.ts)

### `GET /api/v1/catalog/special-cards`

**Auth:** None (same as removed legacy `GET /api/special-cards`).

**Request model:** none.

**Response 200:** `data` is an array of special card records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogSpecialCardsResponseDto.ts`](src/api/dto/v1/CatalogSpecialCardsResponseDto.ts)

### `GET /api/v1/catalog/missions`

**Auth:** None (same as removed legacy `GET /api/missions`).

**Request model:** none.

**Response 200:** `data` is an array of mission records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogMissionsResponseDto.ts`](src/api/dto/v1/CatalogMissionsResponseDto.ts)

### `GET /api/v1/catalog/events`

**Auth:** None (same as removed legacy `GET /api/events`).

**Request model:** none.

**Response 200:** `data` is an array of event records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogEventsResponseDto.ts`](src/api/dto/v1/CatalogEventsResponseDto.ts)

### `GET /api/v1/catalog/aspects`

**Auth:** None (same as removed legacy `GET /api/aspects`).

**Request model:** none.

**Response 200:** `data` is an array of aspect records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogAspectsResponseDto.ts`](src/api/dto/v1/CatalogAspectsResponseDto.ts)

### `GET /api/v1/catalog/advanced-universe`

**Auth:** None (same as removed legacy `GET /api/advanced-universe`).

**Request model:** none.

**Response 200:** `data` is an array of Universe: Advanced records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogAdvancedUniverseResponseDto.ts`](src/api/dto/v1/CatalogAdvancedUniverseResponseDto.ts)

### `GET /api/v1/catalog/teamwork`

**Auth:** None (same as removed legacy `GET /api/teamwork`).

**Request model:** none.

**Response 200:** `data` is an array of Universe: Teamwork records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogTeamworkResponseDto.ts`](src/api/dto/v1/CatalogTeamworkResponseDto.ts)

### `GET /api/v1/catalog/ally-universe`

**Auth:** None (same as removed legacy `GET /api/ally-universe`).

**Request model:** none.

**Response 200:** `data` is an array of Universe: Ally records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogAllyUniverseResponseDto.ts`](src/api/dto/v1/CatalogAllyUniverseResponseDto.ts)

### `GET /api/v1/catalog/training`

**Auth:** None (same as removed legacy `GET /api/training`).

**Request model:** none.

**Response 200:** `data` is an array of Universe: Training records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogTrainingResponseDto.ts`](src/api/dto/v1/CatalogTrainingResponseDto.ts)

### `GET /api/v1/catalog/basic-universe`

**Auth:** None (same as removed legacy `GET /api/basic-universe`).

**Request model:** none.

**Response 200:** `data` is an array of Universe: Basic records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogBasicUniverseResponseDto.ts`](src/api/dto/v1/CatalogBasicUniverseResponseDto.ts)

### `GET /api/v1/catalog/power-cards`

**Auth:** None (same as removed legacy `GET /api/power-cards` list).

**Request model:** none.

**Response 200:** `data` is an array of power card records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogPowerCardsResponseDto.ts`](src/api/dto/v1/CatalogPowerCardsResponseDto.ts)

### `GET /api/v1/catalog/foil-card-map`

**Auth:** None (same as removed legacy `GET /api/foil-card-map`).

**Request model:** none.

**Response 200:** `data` is an array of `{ "foilCardId", "baseCardId", "cardType" }` rows (camelCase; same objects the legacy route returned in `data`).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogFoilCardMapResponseDto.ts`](src/api/dto/v1/CatalogFoilCardMapResponseDto.ts)

---

## DBV support

Reference data for Database View and collection UI (set codes → display names, etc.).

### `GET /api/v1/dbv/sets`

**Auth:** None (same as removed legacy `GET /api/sets`).

**Request model:** none.

**Response 200:** `data` is an array of `{ "code", "name" }` rows from the `sets` table, ordered by `name` ascending (same shape as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/dbvSupportService.ts`](src/api/services/dbvSupportService.ts) · HTTP [`src/api/http/dbv-support.http.ts`](src/api/http/dbv-support.http.ts) · response shape [`src/api/dto/v1/DbvSetsResponseDto.ts`](src/api/dto/v1/DbvSetsResponseDto.ts)

### `GET /api/v1/dbv/deck-backgrounds`

**Auth:** Valid **session cookie** (same **`authenticateUser`** middleware as legacy `GET /api/deck-backgrounds`). The main web app does not attach a Bearer token here; unauthenticated requests receive **401** with the **legacy** JSON shape `{ "success": false, "error": "..." }` from session middleware.

**Request model:** none.

**Response 200:** `data` is a string array of project-root-relative PNG paths under `src/resources/images/backgrounds/{landscape|portrait}/` (same list as legacy `data`).

**Response 500:** v1 envelope — `errors` with code **`DBV_SUPPORT_ERROR`**; `data` may be `null`.

**Implementation:** [`src/services/deckBackgroundService.ts`](src/services/deckBackgroundService.ts) · HTTP [`src/api/http/dbv-support.http.ts`](src/api/http/dbv-support.http.ts) · response shape [`src/api/dto/v1/DbvDeckBackgroundsResponseDto.ts`](src/api/dto/v1/DbvDeckBackgroundsResponseDto.ts)

---

## User decks (list)

### `GET /api/v1/decks`

**Auth:** Valid **session cookie** (same **`authenticateUser`** middleware as removed legacy `GET /api/decks`). The main web app uses `credentials: 'include'`; unauthenticated requests receive **401** with the **legacy** JSON shape `{ "success": false, "error": "..." }` from session middleware.

**Request model:** none.

**Response 200:** v1 envelope; **`data`** is the transformed deck list (array of `{ "metadata", "cards" }` rows from `transformDeckList` — same shapes the legacy list returned inside `{ success, data }`).

**Caching:** `Cache-Control: private, max-age=30`, `Vary: Cookie`, **`ETag`** over the full v1 JSON body (`SHA-1` of `{"data":...,"meta":{},"errors":[]}`). If request header **`If-None-Match`** matches **`ETag`**, responds **304** with an **empty** body.

**Response 500:** v1 envelope — `errors` with code **`DECK_LIST_ERROR`**; `data` may be `null`.

**Implementation:** [`src/api/services/deckListService.ts`](src/api/services/deckListService.ts) · HTTP [`src/api/http/decks.http.ts`](src/api/http/decks.http.ts) · response shape [`src/api/dto/v1/DeckListV1DataDto.ts`](src/api/dto/v1/DeckListV1DataDto.ts)

---

## User decks (create + validate)

### `POST /api/v1/decks`

**Auth:** Valid **session cookie** (same **`authenticateUser`** as legacy DB deck routes). **GUEST** receives **403** v1 envelope (`errors` with code **`GUEST_FORBIDDEN`**). Unauthenticated requests receive **401** (legacy `{ success, error }` from session middleware).

**Rate limiting / read-only:** Same behavior as legacy create: **429** v1 envelope (`RATE_LIMIT_EXCEEDED`) when the shared per-IP limit is exceeded; **403** v1 envelope (`READ_ONLY_MODE`) when read-only mode is active (query/header as in [API_DOCUMENTATION.md](API_DOCUMENTATION.md)).

**Request model:** [`src/api/http/models/decks/CreateDeckRequestBody.ts`](src/api/http/models/decks/CreateDeckRequestBody.ts) — JSON body:

- **`name`** (string, required, non-empty after trim, max 100)
- **`description`** (optional string, max 500)
- **`characters`** (optional string array, max 50 entries; business rule still enforces max **4** character IDs via **`DeckService.createDeck`**)

**Response 201:** v1 envelope; **`data`** is the created deck row (same shape as legacy `data` from `POST /api/decks`).

**Response 400:** v1 envelope — validation (`VALIDATION_ERROR` / field hints) or **`Maximum 4 characters allowed per deck`** in `errors`.

**Response 500:** v1 envelope — `errors` with code **`DECK_CREATE_ERROR`**.

**Implementation:** [`src/api/services/deckWriteService.ts`](src/api/services/deckWriteService.ts) · HTTP [`src/api/http/decks.http.ts`](src/api/http/decks.http.ts) · response [`src/api/dto/v1/DeckCreateV1DataDto.ts`](src/api/dto/v1/DeckCreateV1DataDto.ts)

### `POST /api/v1/decks/validate`

**Auth:** Valid **session cookie**. Unauthenticated requests receive **401** (legacy shape).

**Request model:** [`src/api/http/models/decks/ValidateDeckRequestBody.ts`](src/api/http/models/decks/ValidateDeckRequestBody.ts) — `{ "cards": [ ... ] }` (array required; card shapes match legacy **`POST /api/decks/validate`**).

**Response 200:** v1 envelope; **`data`** is `{ "valid": true, "message": "Deck is valid" }` ([`DeckValidateV1SuccessDto`](src/api/dto/v1/DeckValidateV1SuccessDto.ts)).

**Response 400:** v1 envelope — `errors` with code **`DECK_VALIDATION_FAILED`** and summary message; **`data`** includes **`validationErrors`** (same objects as legacy `validationErrors`, [`DeckValidateV1ErrorDataDto`](src/api/dto/v1/DeckValidateV1ErrorDataDto.ts)).

**Response 500:** v1 envelope — `errors` with code **`DECK_VALIDATE_ERROR`**.

**Implementation:** [`DeckValidationService`](src/services/deckValidationService.ts) via [`DeckWriteService`](src/api/services/deckWriteService.ts) · HTTP [`src/api/http/decks.http.ts`](src/api/http/decks.http.ts)

---

## Route index (v1)

| Method | Path | Router module |
|--------|------|---------------|
| POST | /api/v1/auth/login | auth.http.ts |
| GET | /api/v1/auth/me | auth.http.ts |
| POST | /api/v1/auth/logout | auth.http.ts |
| GET | /api/v1/catalog/characters | dbv-catalog.http.ts |
| GET | /api/v1/catalog/locations | dbv-catalog.http.ts |
| GET | /api/v1/catalog/special-cards | dbv-catalog.http.ts |
| GET | /api/v1/catalog/missions | dbv-catalog.http.ts |
| GET | /api/v1/catalog/events | dbv-catalog.http.ts |
| GET | /api/v1/catalog/aspects | dbv-catalog.http.ts |
| GET | /api/v1/catalog/advanced-universe | dbv-catalog.http.ts |
| GET | /api/v1/catalog/teamwork | dbv-catalog.http.ts |
| GET | /api/v1/catalog/ally-universe | dbv-catalog.http.ts |
| GET | /api/v1/catalog/training | dbv-catalog.http.ts |
| GET | /api/v1/catalog/basic-universe | dbv-catalog.http.ts |
| GET | /api/v1/catalog/power-cards | dbv-catalog.http.ts |
| GET | /api/v1/catalog/foil-card-map | dbv-catalog.http.ts |
| GET | /api/v1/dbv/sets | dbv-support.http.ts |
| GET | /api/v1/dbv/deck-backgrounds | dbv-support.http.ts |
| GET | /api/v1/decks | decks.http.ts |
| POST | /api/v1/decks | decks.http.ts |
| POST | /api/v1/decks/validate | decks.http.ts |
