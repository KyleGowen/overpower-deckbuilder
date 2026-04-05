# HTTP API v1 (`/api/v1`)

Versioned JSON API for Excelsior. **Legacy** routes remain documented in [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## Conventions

### Base URL

- Local: `http://localhost:8085` (or `PORT`) + prefix **`/api/v1`**.

### Authentication

- **Bearer JWT:** `Authorization: Bearer <access_token>` for protected v1 routes.
- **Login:** `POST /api/v1/auth/login` with JSON body `{ "username", "password" }` returns an access token. Password verification uses the **same** server stack as `POST /api/auth/login` (no separate hashing implementation).
- **Session cookie (`sessionId`):** Routes that use session auth (e.g. decks, collections, guest decks, admin, DBV backgrounds) accept the same cookie as legacy `/api/*`. If the session is missing or invalid, the server responds with **`401`** and the standard v1 envelope: `data: null`, `errors: [{ "code": "UNAUTHORIZED", "message": "..." }]` (e.g. `Authentication required`, `Invalid or expired session`, `User not found`).

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
6. [User decks (single: get, full, update, delete)](#user-decks-single-get-full-update-delete)
7. [User decks (cards)](#user-decks-cards)
8. [User decks (UI preferences)](#user-decks-ui-preferences)
9. [Guest decks (session memory)](#guest-decks-session-memory)
10. [Collections (current user)](#collections-current-user)
11. [Admin](#admin)

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

**Authentication (all paths in this section):** Valid **session cookie** (`sessionId` after `POST /api/auth/login`) **or** **`Authorization: Bearer <accessToken>`** (after `POST /api/v1/auth/login`). The main web app should send cookies (`credentials: 'include'` in `fetch` when needed). **GUEST**, **USER**, and **ADMIN** all receive full catalog data; only anonymous/unauthenticated clients are denied.

**Response 401:** Missing, invalid, or expired session; missing/invalid Bearer token; or user record missing. Body: `{ "data": null, "meta": {}, "errors": [{ "code": "UNAUTHORIZED", "message": "..." }] }`.

### `GET /api/v1/catalog/characters`

**Auth:** Session cookie or Bearer JWT (see introduction above).

**Request model:** none (no body; no query contract file required for this GET).

**Response 200:** `data` is an array of character records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogCharactersResponseDto.ts`](src/api/dto/v1/CatalogCharactersResponseDto.ts)

### `GET /api/v1/catalog/locations`

**Auth:** Session cookie or Bearer JWT (see introduction above).

**Request model:** none (no body; no query contract file required for this GET).

**Response 200:** `data` is an array of location records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogLocationsResponseDto.ts`](src/api/dto/v1/CatalogLocationsResponseDto.ts)

### `GET /api/v1/catalog/special-cards`

**Auth:** Session cookie or Bearer JWT (see introduction above).

**Request model:** none.

**Response 200:** `data` is an array of special card records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogSpecialCardsResponseDto.ts`](src/api/dto/v1/CatalogSpecialCardsResponseDto.ts)

### `GET /api/v1/catalog/missions`

**Auth:** Session cookie or Bearer JWT (see introduction above).

**Request model:** none.

**Response 200:** `data` is an array of mission records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogMissionsResponseDto.ts`](src/api/dto/v1/CatalogMissionsResponseDto.ts)

### `GET /api/v1/catalog/events`

**Auth:** Session cookie or Bearer JWT (see introduction above).

**Request model:** none.

**Response 200:** `data` is an array of event records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogEventsResponseDto.ts`](src/api/dto/v1/CatalogEventsResponseDto.ts)

### `GET /api/v1/catalog/aspects`

**Auth:** Session cookie or Bearer JWT (see introduction above).

**Request model:** none.

**Response 200:** `data` is an array of aspect records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogAspectsResponseDto.ts`](src/api/dto/v1/CatalogAspectsResponseDto.ts)

### `GET /api/v1/catalog/advanced-universe`

**Auth:** Session cookie or Bearer JWT (see introduction above).

**Request model:** none.

**Response 200:** `data` is an array of Universe: Advanced records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogAdvancedUniverseResponseDto.ts`](src/api/dto/v1/CatalogAdvancedUniverseResponseDto.ts)

### `GET /api/v1/catalog/teamwork`

**Auth:** Session cookie or Bearer JWT (see introduction above).

**Request model:** none.

**Response 200:** `data` is an array of Universe: Teamwork records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogTeamworkResponseDto.ts`](src/api/dto/v1/CatalogTeamworkResponseDto.ts)

### `GET /api/v1/catalog/ally-universe`

**Auth:** Session cookie or Bearer JWT (see introduction above).

**Request model:** none.

**Response 200:** `data` is an array of Universe: Ally records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogAllyUniverseResponseDto.ts`](src/api/dto/v1/CatalogAllyUniverseResponseDto.ts)

### `GET /api/v1/catalog/training`

**Auth:** Session cookie or Bearer JWT (see introduction above).

**Request model:** none.

**Response 200:** `data` is an array of Universe: Training records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogTrainingResponseDto.ts`](src/api/dto/v1/CatalogTrainingResponseDto.ts)

### `GET /api/v1/catalog/basic-universe`

**Auth:** Session cookie or Bearer JWT (see introduction above).

**Request model:** none.

**Response 200:** `data` is an array of Universe: Basic records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogBasicUniverseResponseDto.ts`](src/api/dto/v1/CatalogBasicUniverseResponseDto.ts)

### `GET /api/v1/catalog/power-cards`

**Auth:** Session cookie or Bearer JWT (see introduction above).

**Request model:** none.

**Response 200:** `data` is an array of power card records (same objects as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogPowerCardsResponseDto.ts`](src/api/dto/v1/CatalogPowerCardsResponseDto.ts)

### `GET /api/v1/catalog/foil-card-map`

**Auth:** Session cookie or Bearer JWT (see introduction above).

**Request model:** none.

**Response 200:** `data` is an array of `{ "foilCardId", "baseCardId", "cardType" }` rows (camelCase; same objects the legacy route returned in `data`).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/catalogService.ts`](src/api/services/catalogService.ts) · HTTP [`src/api/http/dbv-catalog.http.ts`](src/api/http/dbv-catalog.http.ts) · response shape [`src/api/dto/v1/CatalogFoilCardMapResponseDto.ts`](src/api/dto/v1/CatalogFoilCardMapResponseDto.ts)

---

## DBV support

Reference data for Database View and collection UI (set codes → display names, etc.).

### `GET /api/v1/dbv/sets`

**Auth:** Session cookie or Bearer JWT (same rules as **DBV catalog** introduction).

**Request model:** none.

**Response 200:** `data` is an array of `{ "code", "name" }` rows from the `sets` table, ordered by `name` ascending (same shape as legacy `data` array).

**Response 500:** `errors` populated; `data` may be `null`.

**Implementation:** [`src/api/services/dbvSupportService.ts`](src/api/services/dbvSupportService.ts) · HTTP [`src/api/http/dbv-support.http.ts`](src/api/http/dbv-support.http.ts) · response shape [`src/api/dto/v1/DbvSetsResponseDto.ts`](src/api/dto/v1/DbvSetsResponseDto.ts)

### `GET /api/v1/dbv/deck-backgrounds`

**Auth:** Session cookie or Bearer JWT (same rules as **DBV catalog** introduction). Unauthenticated requests receive **401** with the **v1** envelope (`errors` with **`UNAUTHORIZED`**).

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

### `GET /api/v1/decks/stats`

**Auth:** Valid **session cookie** (same **`authenticateUser`** as **`GET /api/v1/decks`**). Unauthenticated requests receive **401** (legacy `{ success, error }` from session middleware).

**Request model:** none.

**Response 200:** v1 envelope; **`data`** is aggregate counts for the user’s database-backed decks:

- **`totalDecks`** — number of decks owned by the user
- **`totalCards`** — sum of card quantities across all those decks
- **`averageCardsPerDeck`** — `Math.round(totalCards / totalDecks)`, or **0** when `totalDecks` is 0
- **`largestDeckSize`** — maximum per-deck total quantity (sum of `quantity` per deck)

**Response 500:** v1 envelope — `errors` with code **`DECK_STATS_ERROR`**.

**Implementation:** [`DeckStatsService`](src/api/services/deckStatsService.ts) · HTTP [`decks.http.ts`](src/api/http/decks.http.ts) · response shape [`DeckStatsV1DataDto`](src/api/dto/v1/DeckStatsV1DataDto.ts)

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

## User decks (single: get, full, update, delete)

### `GET /api/v1/decks/:id`

**Auth:** Valid **session cookie** (same **`authenticateUser`** as other DB deck routes). Unauthenticated requests receive **401** (legacy `{ success, error }`).

**Request model:** none (path param **`id`** = deck UUID).

**Response 200:** v1 envelope; **`data`** is `{ "metadata", "cards" }` (same transformed shape legacy returned: `isOwner`, `threat`, `is_valid`, `reserve_character`, `display_mission_card_id`, `background_image_path`, etc. — **`metadata.threat` / `metadata.is_valid`** align with list rows from `transformDeckListItem`).

**Response 404:** v1 envelope — `errors` with code **`DECK_NOT_FOUND`**.

**Response 500:** v1 envelope — `errors` with code **`DECK_FETCH_ERROR`**.

**Implementation:** [`DeckDetailService`](src/api/services/deckDetailService.ts) · HTTP [`decks.http.ts`](src/api/http/decks.http.ts)

### `GET /api/v1/decks/:id/full`

**Auth:** Valid **session cookie**.

**Request model:** none.

**Response 200:** Same **`data`** shape as **`GET /api/v1/decks/:id`**, using **`getDeckSummaryWithAllCards`** (heavier card hydration).

**Response 404 / 500:** Same codes as **`GET /api/v1/decks/:id`** (`DECK_NOT_FOUND` / `DECK_FETCH_ERROR`; full route uses “full deck data” in the 500 message).

### `PUT /api/v1/decks/:id`

**Auth:** Session cookie. **GUEST** → **403** v1 envelope (`GUEST_FORBIDDEN`). **Owner only**; non-owner → **403** (`DECK_ACCESS_DENIED`).

**Rate limiting / read-only:** Same pattern as **`POST /api/v1/decks`** (**429** `RATE_LIMIT_EXCEEDED`, **403** `READ_ONLY_MODE`).

**Request model:** partial JSON (same fields as legacy **`PUT /api/decks/:id`**): optional **`name`**, **`description`**, **`is_limited`**, **`is_valid`**, **`reserve_character`**, **`display_mission_card_id`**, **`background_image_path`** (non-empty paths validated via **`DeckBackgroundService.validateBackgroundPath`**). Validated in [`UpdateDeckRequestBody.ts`](src/api/http/models/decks/UpdateDeckRequestBody.ts).

**Response 200:** v1 envelope; **`data`** = `{ "metadata", "cards": [] }` (updated metadata, empty cards array on success path).

**Response 400:** validation or invalid background (`INVALID_BACKGROUND`, `VALIDATION_ERROR`).

**Response 404:** **`DECK_NOT_FOUND`**.

**Response 500:** **`DECK_UPDATE_ERROR`**.

**Implementation:** [`DeckDetailService`](src/api/services/deckDetailService.ts) · HTTP [`decks.http.ts`](src/api/http/decks.http.ts)

### `DELETE /api/v1/decks/:id`

**Auth:** Session cookie. **GUEST** → **403** (`GUEST_FORBIDDEN`). **Owner only**; non-owner → **403** (`DECK_ACCESS_DENIED`).

**Rate limiting / read-only:** Same as **`PUT`**.

**Response 200:** v1 envelope; **`data`** = `{ "message": "Deck deleted successfully" }` ([`DeckDeleteV1DataDto`](src/api/dto/v1/DeckDeleteV1DataDto.ts)).

**Response 404:** **`DECK_NOT_FOUND`**.

**Response 500:** **`DECK_DELETE_ERROR`**.

**Implementation:** [`DeckDetailService`](src/api/services/deckDetailService.ts) · HTTP [`decks.http.ts`](src/api/http/decks.http.ts)

---

## User decks (cards)

Deck card CRUD for a database-backed deck. **Legacy** **`/api/decks/:id/cards`** routes are **removed** — only these v1 paths are registered.

### `GET /api/v1/decks/:id/cards`

**Auth:** Valid **session cookie** (same **`authenticateUser`** as **`GET /api/v1/decks/:id`**). Matches legacy behavior: **any authenticated user** may read the card list (no ownership check in the service).

**Response 200:** v1 envelope; **`data`** is an array of `{ "type", "cardId", "quantity"? }` rows from the repository’s **`getDeckCards`**.

**Response 501:** v1 envelope — **`NOT_IMPLEMENTED`** if the repository does not expose **`getDeckCards`** (unexpected for PostgreSQL).

**Response 500:** **`DECK_CARDS_FETCH_ERROR`**.

**Implementation:** [`DeckCardsService`](src/api/services/deckCardsService.ts) · HTTP [`decks.http.ts`](src/api/http/decks.http.ts)

### `POST /api/v1/decks/:id/cards`

**Auth:** Session cookie. **GUEST** → **403** (`GUEST_FORBIDDEN`). **Owner only**; non-owner → **403** (`DECK_ACCESS_DENIED`).

**Rate limiting / read-only:** Same pattern as **`POST /api/v1/decks`** (**429**, **403** `READ_ONLY_MODE`).

**Request model:** [`DeckCardsPostBody.ts`](src/api/http/models/decks/DeckCardsPostBody.ts) — JSON **`{ "cardType", "cardId", "quantity"? }`** (default quantity **1**).

**Response 200:** v1 envelope; **`data`** is transformed deck detail (`metadata` + `cards`) after add.

**Response 400:** validation or game rules (`VALIDATION_ERROR`); **404** `DECK_NOT_FOUND`; **500** `DECK_CARD_ADD_ERROR`.

**Implementation:** [`DeckCardsService`](src/api/services/deckCardsService.ts) · HTTP [`decks.http.ts`](src/api/http/decks.http.ts)

### `PUT /api/v1/decks/:id/cards`

**Auth:** Session cookie. **GUEST** → **403**. **Owner only**; non-owner → **403** (`DECK_ACCESS_DENIED`).

**Rate limiting / read-only:** Same as **`POST`**.

**Request model:** [`DeckCardsPutBody.ts`](src/api/http/models/decks/DeckCardsPutBody.ts) — **`{ "cards": [ { "cardType", "cardId", "quantity", "exclude_from_draw"? }, … ] }`** (max **100** entries per request).

**Response 200:** v1 envelope; **`data`** is updated deck detail after bulk replace.

**Response 400 / 500:** **`DECK_CARDS_REPLACE_FAILED`** (includes invalid card references); **`DECK_CARDS_REPLACE_ERROR`**.

**Implementation:** [`DeckCardsService`](src/api/services/deckCardsService.ts) · HTTP [`decks.http.ts`](src/api/http/decks.http.ts)

### `DELETE /api/v1/decks/:id/cards`

**Auth:** Session cookie. **GUEST** → **403**. **Owner only**.

**Rate limiting / read-only:** Same as **`POST`**.

**Request model:** same shape as **`POST`** ([`DeckCardsPostBody`](src/api/http/models/decks/DeckCardsPostBody.ts)) — partial remove with **`cardType`**, **`cardId`**, **`quantity`**, or clear all with **`cardType`: `"all"`**, **`cardId`: `"all"`**.

**Response 200:** v1 envelope; **`data`** is updated deck detail.

**Response 404 / 500:** **`DECK_NOT_FOUND`** / **`DECK_CARD_REMOVE_ERROR`**.

**Implementation:** [`DeckCardsService`](src/api/services/deckCardsService.ts) · HTTP [`decks.http.ts`](src/api/http/decks.http.ts)

---

## User decks (UI preferences)

### `GET /api/v1/decks/:id/ui-preferences`

**Auth:** Session cookie. **GUEST** → **403** (`GUEST_FORBIDDEN`). **Owner only**; non-owner → **403** (`DECK_ACCESS_DENIED`).

**Response 200:** v1 envelope; **`data`** = UI preferences object (JSON stored on `decks.ui_preferences`), or `{}` if unset.

**Response 500:** **`UI_PREFERENCES_FETCH_ERROR`**.

**Implementation:** [`DeckUIPreferencesService`](src/api/services/deckUIPreferencesService.ts) · HTTP [`decks.http.ts`](src/api/http/decks.http.ts)

### `PUT /api/v1/decks/:id/ui-preferences`

**Auth:** Session cookie. **GUEST** → **403** (`GUEST_FORBIDDEN`). **Owner only**; non-owner → **403** (`DECK_ACCESS_DENIED`).

**Rate limiting / read-only:** Same patterns as other deck mutations (`checkRateLimit`, `blockInReadOnlyMode`).

**Body:** JSON object (optional **`viewMode`** (`tile` \| `list`), **`sortBy`**, **`filterBy`**, max object size 1000 characters).

**Response 200:** v1 envelope; **`data`** = saved preferences body.

**Response 400 / 404 / 500:** **`VALIDATION_ERROR`**, **`DECK_NOT_FOUND`**, **`UI_PREFERENCES_UPDATE_ERROR`**.

**Implementation:** [`DeckUIPreferencesService`](src/api/services/deckUIPreferencesService.ts) · HTTP [`decks.http.ts`](src/api/http/decks.http.ts)

---

## Guest decks (session memory)

Session-scoped decks for **GUEST** users: stored **in memory** keyed by **`sessionId`** cookie (not persisted to PostgreSQL). **GET list** merges DB decks for the guest user (`getDecksByUserId` + `transformDeckList`) with session guest decks (same list shape as **`GET /api/v1/decks`** entries).

**Auth:** Valid **session cookie** (`authenticateUser`) **and** **`GUEST`** role **and** **`sessionId`** cookie. Unauthenticated requests may receive **401** with the **legacy** session middleware shape. Wrong role → **403** v1 envelope, code **`GUEST_ONLY`**. Missing **`sessionId`** → **401**, code **`SESSION_REQUIRED`**.

**Implementation:** [`GuestDeckService`](src/api/services/guestDeckService.ts) · HTTP [`guest-decks.http.ts`](src/api/http/guest-decks.http.ts)

### `POST /api/v1/guest/decks`

**Body (optional):** `{ "name"?, "description"? }` — defaults **`name`** `"New Deck"`, **`description`** `""`. Request model: [`CreateGuestDeckBody.ts`](src/api/http/models/guest-decks/CreateGuestDeckBody.ts)

**Response 201:** v1 envelope; **`data`** = `{ "id", "name", "description", "created_at", "updated_at" }`.

### `GET /api/v1/guest/decks`

**Response 200:** v1 envelope; **`data`** = merged array (DB + session guest decks).

### `GET /api/v1/guest/decks/:id`

**Response 200:** v1 envelope; **`data`** = `{ "metadata": { ..., "isOwner": true }, "cards": [...] }`.

**Response 404:** **`DECK_NOT_FOUND`**.

### `PUT /api/v1/guest/decks/:id`

**Body:** optional **`name`**, **`description`** — [`UpdateGuestDeckBody.ts`](src/api/http/models/guest-decks/UpdateGuestDeckBody.ts)

**Response 200:** v1 envelope; **`data`** = list-item shape (same as merged list entries).

### `PUT /api/v1/guest/decks/:id/cards`

Replace all cards (max **100** entries; per-entry **`quantity`** 1–100). **Body:** `{ "cards": [ { "cardType", "cardId", "quantity"?, "exclude_from_draw"? }, ... ] }` — [`GuestDeckCardsPutBody.ts`](src/api/http/models/guest-decks/GuestDeckCardsPutBody.ts)

**Response 200:** v1 envelope; **`data`** = full guest deck `{ "metadata", "cards" }`.

### `POST /api/v1/guest/decks/:id/cards`

Add one card; same validation rules as DB deck add (one-per-deck, cataclysm, etc.). **Body:** **`cardType`**, **`cardId`**, optional **`quantity`**.

**Response 200:** v1 envelope; **`data`** = full guest deck.

### `DELETE /api/v1/guest/decks/:id`

**Response 200:** v1 envelope; **`data`** = `{}` (empty object).

**Response 404:** **`DECK_NOT_FOUND`**.

---

## Collections (current user)

### `GET /api/v1/collections/me`

**Auth:** Valid **session cookie** (same **`authenticateUser`** as **`GET /api/v1/decks`**). Unauthenticated requests receive **401** with the **legacy** JSON shape `{ "success": false, "error": "..." }` from session middleware.

**Request model:** none.

**Response 200:** v1 envelope; **`data`** is `{ "id": "<collection uuid>", "user_id": "<authenticated user id>" }` — same field names as removed legacy **`GET /api/collections/me`**. The server **gets or creates** the user’s collection row.

**Response 500:** v1 envelope — `errors` with code **`COLLECTION_ME_ERROR`**; **`data`** may be `null`.

**Implementation:** [`CollectionService`](src/services/collectionService.ts) · HTTP [`collections.http.ts`](src/api/http/collections.http.ts) · response shape [`CollectionMeV1DataDto`](src/api/dto/v1/CollectionMeV1DataDto.ts)

### `GET /api/v1/collections/me/cards`

**Auth:** Valid **session cookie** (`authenticateUser`). Unauthenticated → **401** (legacy `{ success, error }` from session middleware).

**Response 200:** v1 envelope; **`data`** is an array of collection rows (same shape as legacy `GET /api/collections/me/cards` payload): snake_case fields including `card_id`, `card_type`, `quantity`, `image_path`, plus joined card metadata when present.

**Response 500:** `errors` with code **`COLLECTION_CARDS_FETCH_ERROR`**.

### `GET /api/v1/collections/me/history`

**Auth:** Session cookie (`authenticateUser`). Unauthenticated → **401** (legacy `{ success, error }` from session middleware).

**Query:** optional **`limit`** — must be a **positive integer** when present (same rule as removed legacy **`GET /api/collections/me/history`**). Omit **`limit`** to return all history (service default).

**Response 200:** v1 envelope; **`data`** is an array of history rows: `id`, `collection_id`, `card_id`, `action` (`ADD` \| `REMOVE`), `new_quantity`, `created_at`, ordered by **`created_at` DESC** (most recent first).

**Response 400:** **`VALIDATION_ERROR`** — `limit` not a positive integer.

**Response 500:** **`COLLECTION_HISTORY_ERROR`**.

**Implementation:** [`CollectionService.getCollectionHistory`](src/services/collectionService.ts) · HTTP [`collections.http.ts`](src/api/http/collections.http.ts)

### `POST /api/v1/collections/me/cards`

**Auth:** Session cookie.

**Body:** JSON — **`cardId`** (string), **`cardType`** (valid collection type; see `isValidCollectionCardType` in [`src/validation/collectionCardType.ts`](src/validation/collectionCardType.ts)), optional **`quantity`** (defaults like legacy: numeric `|| 1`), optional **`imagePath`**.

**Response 200:** v1 envelope; **`data`** is the full collection row after add (same as legacy).

**Response 400:** **`VALIDATION_ERROR`** (missing/invalid fields).

**Response 404:** **`COLLECTION_CARD_NOT_FOUND`** when the card does not exist in the catalog table for that type.

**Response 500:** **`COLLECTION_CARD_ADD_ERROR`**.

### `POST /api/v1/collections/me/cards/remove-one`

**Auth:** Session cookie.

**Body:** **`cardId`**, **`cardType`**, **`imagePath`** (all required non-empty strings; **`cardType`** must be valid).

**Response 200:** v1 envelope; **`data`** is the updated row or **`null`** if the last copy was removed.

**Response 400 / 404 / 500:** **`VALIDATION_ERROR`**, **`COLLECTION_REMOVE_ONE_NOT_FOUND`**, **`COLLECTION_REMOVE_ONE_ERROR`**.

### `PUT /api/v1/collections/me/cards/:cardId`

**Auth:** Session cookie.

**Body:** **`quantity`** (number, ≥ 0), **`cardType`** (valid), **`imagePath`** (required), optional **`oldImagePath`**.

**Response 200:** v1 envelope; **`data`** is the updated row, or **`null`** when **`quantity`** is **0** and the row was removed.

**Response 400:** **`VALIDATION_ERROR`** (missing fields, negative quantity, etc.).

**Response 404:** **`COLLECTION_CARD_NOT_IN_COLLECTION`** when the row does not exist (and **`quantity`** was not 0).

**Response 500:** **`COLLECTION_CARD_UPDATE_ERROR`**.

### `DELETE /api/v1/collections/me/cards/:cardId`

**Auth:** Session cookie.

**Query:** **`cardType`** required (valid collection type). Removes **all** rows for that **`cardId` + `cardType`** (same semantics as legacy).

**Response 200:** v1 envelope; **`data`** is `{ "message": "Card removed from collection" }`.

**Response 400 / 404 / 500:** **`VALIDATION_ERROR`**, **`COLLECTION_CARD_NOT_IN_COLLECTION`**, **`COLLECTION_CARD_DELETE_ERROR`**.

**Implementation (cards):** [`CollectionService`](src/services/collectionService.ts) · HTTP [`collections.http.ts`](src/api/http/collections.http.ts) · row type [`CollectionCardRowV1Dto`](src/api/dto/v1/CollectionCardRowV1Dto.ts)

---

## Admin

**Auth:** Valid **session cookie** (`authenticateUser`) **and** **`ADMIN`** role. Unauthenticated requests may receive **401** with the **legacy** session middleware shape (`{ "success": false, "error": "..." }`), consistent with other session-backed v1 routes. Non-admin → **403** v1 envelope, code **`ADMIN_REQUIRED`**.

**Implementation:** [`AdminService`](src/api/services/adminService.ts) · HTTP [`admin.http.ts`](src/api/http/admin.http.ts)

### `GET /api/v1/admin/users`

**Response 200:** v1 envelope; **`data`** = array of `{ "id", "name", "email", "role", "lastLoginAt" }` (no password hash).

**Response 500:** **`ADMIN_USERS_LIST_ERROR`**.

### `POST /api/v1/admin/users`

**Body:** `{ "username", "password" }` — request validation: [`CreateAdminUserBody.ts`](src/api/http/models/admin/CreateAdminUserBody.ts)

**Response 201:** v1 envelope; **`data`** = created user (same shape as list entries).

**Response 400:** validation — e.g. missing **`username`** / **`password`** (`VALIDATION_ERROR`).

**Response 409:** **`USERNAME_EXISTS`**.

**Response 500:** **`ADMIN_USER_CREATE_ERROR`**.

### `GET /api/v1/admin/debug/clear-cache`

Clears deck repository cache (in-memory).

**Response 200:** v1 envelope; **`data`** = `{ "message": "Deck cache cleared" }`.

### `GET /api/v1/admin/debug/clear-card-cache`

Clears card repository caches.

**Response 200:** v1 envelope; **`data`** = `{ "message": "Card repository cache cleared" }`.

### `GET /api/v1/admin/database/status`

**Response 200:** v1 envelope; **`data`** = `{ "status": "OK", "database": { "valid", "upToDate", "migrations" } }` (same semantics as former legacy **`GET /api/database/status`** payload, wrapped in **`data`**).

**Response 500:** **`ADMIN_DATABASE_STATUS_ERROR`**.

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
| GET | /api/v1/decks/stats | decks.http.ts |
| POST | /api/v1/decks | decks.http.ts |
| POST | /api/v1/decks/validate | decks.http.ts |
| GET | /api/v1/decks/:id/full | decks.http.ts |
| GET | /api/v1/decks/:id | decks.http.ts |
| PUT | /api/v1/decks/:id | decks.http.ts |
| GET | /api/v1/decks/:id/cards | decks.http.ts |
| POST | /api/v1/decks/:id/cards | decks.http.ts |
| PUT | /api/v1/decks/:id/cards | decks.http.ts |
| DELETE | /api/v1/decks/:id/cards | decks.http.ts |
| GET | /api/v1/decks/:id/ui-preferences | decks.http.ts |
| PUT | /api/v1/decks/:id/ui-preferences | decks.http.ts |
| DELETE | /api/v1/decks/:id | decks.http.ts |
| GET | /api/v1/guest/decks | guest-decks.http.ts |
| POST | /api/v1/guest/decks | guest-decks.http.ts |
| GET | /api/v1/guest/decks/:id | guest-decks.http.ts |
| PUT | /api/v1/guest/decks/:id | guest-decks.http.ts |
| DELETE | /api/v1/guest/decks/:id | guest-decks.http.ts |
| PUT | /api/v1/guest/decks/:id/cards | guest-decks.http.ts |
| POST | /api/v1/guest/decks/:id/cards | guest-decks.http.ts |
| GET | /api/v1/collections/me | collections.http.ts |
| GET | /api/v1/collections/me/cards | collections.http.ts |
| GET | /api/v1/collections/me/history | collections.http.ts |
| POST | /api/v1/collections/me/cards | collections.http.ts |
| POST | /api/v1/collections/me/cards/remove-one | collections.http.ts |
| PUT | /api/v1/collections/me/cards/:cardId | collections.http.ts |
| DELETE | /api/v1/collections/me/cards/:cardId | collections.http.ts |
| GET | /api/v1/admin/users | admin.http.ts |
| POST | /api/v1/admin/users | admin.http.ts |
| GET | /api/v1/admin/debug/clear-cache | admin.http.ts |
| GET | /api/v1/admin/debug/clear-card-cache | admin.http.ts |
| GET | /api/v1/admin/database/status | admin.http.ts |

---

## Non-v1 surfaces

These endpoints are **intentionally not** under **`/api/v1`**:

- **`GET /health`** — operations and monitoring; JSON shape is health-specific, not the v1 catalog envelope.
- **Static assets** and **HTML shell** routes (e.g. **`/users/...`** deck pages, **`/data`**) — see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

**Legacy** JSON that remains outside v1 (e.g. **`POST /api/users/change-password`**) is documented only in [API_DOCUMENTATION.md](API_DOCUMENTATION.md).
