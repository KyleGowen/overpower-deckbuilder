# Excelsior Deckbuilder API Documentation

## Base URL
- **Development** (`npm run dev`): `http://localhost:8085` (default from `src/index.ts`; override with `PORT`)
- **Docker image**: listens on **3000** (`Dockerfile` sets `PORT=3000`)
- **Production**: `https://your-domain.com`

## Authentication
Most endpoints require authentication via session cookies. The API supports three login methods: **username/password**, **Google Sign-In**, and **Guest**. The API uses cookie-based authentication with the following roles:
- **ADMIN**: Full access to all features
- **USER**: Standard user access
- **GUEST**: Can create and edit session-scoped decks via `/api/guest/decks` (not persisted to database); read-only for main deck APIs

---

## Authentication Endpoints

### POST /api/auth/login
Authenticate a user and create a session.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "USER|ADMIN|GUEST"
  }
}
```

### POST /api/auth/google
Authenticate a user via Google Sign-In and create a session. Accepts a Firebase ID token from the client. For new Google users, creates an account; for existing users with the same email (non-guest), links the Google account so either credentials or Google can be used to sign in.

**Request Body:**
```json
{
  "idToken": "string"
}
```

**Response (success):** Same as `POST /api/auth/login`:
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "USER|ADMIN|GUEST"
  }
}
```

**Response (error):** `400` or `429` (rate limited) with error message.

### POST /api/auth/logout
Logout the current user and destroy the session.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/me
Get the current authenticated user's information.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "USER|ADMIN|GUEST"
  }
}
```

### GET /api/config/firebase
Returns the Firebase client configuration for the web app (API key, auth domain, project ID, app ID). Used by the frontend to initialize the Firebase SDK. No authentication required; these are public client config values (domain-restricted by Firebase).

**Response:**
```json
{
  "apiKey": "string",
  "authDomain": "string",
  "projectId": "string",
  "appId": "string"
}
```

Returns empty values or 404 if Firebase is not configured.

---

## Card Data Endpoints

### GET /api/characters (removed)

The legacy **list** endpoint is **not** registered. Use **`GET /api/v1/catalog/characters`** — see [API_V1.md](../../API_V1.md) for the v1 envelope (`{ data, meta, errors }`).

### GET /api/characters/:id/alternate-images
Get alternate images for a specific character.

**Parameters:**
- `id` (string): Character ID

**Response:**
```json
{
  "success": true,
  "data": ["string"]
}
```

### GET /api/locations (removed)

The legacy **list** endpoint is **not** registered. Use **`GET /api/v1/catalog/locations`** — see [API_V1.md](../../API_V1.md).

### GET /api/special-cards (removed)

The legacy **list** endpoint is **not** registered. Use **`GET /api/v1/catalog/special-cards`** — see [API_V1.md](../../API_V1.md).

### GET /api/special-cards/:id/alternate-images
Get alternate images for a specific special card.

**Parameters:**
- `id` (string): Special card ID

**Response:**
```json
{
  "success": true,
  "data": ["string"]
}
```

### GET /api/missions (removed)

The legacy **list** endpoint is **not** registered. Use **`GET /api/v1/catalog/missions`** — see [API_V1.md](../../API_V1.md).

### GET /api/events (removed)

The legacy **list** endpoint is **not** registered. Use **`GET /api/v1/catalog/events`** — see [API_V1.md](../../API_V1.md).

### GET /api/aspects (removed)

The legacy **list** endpoint is **not** registered. Use **`GET /api/v1/catalog/aspects`** — see [API_V1.md](../../API_V1.md).

### GET /api/advanced-universe
Get all advanced universe cards.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "image": "string",
      "alternateImages": ["string"],
      "threat": "number"
    }
  ]
}
```

### GET /api/teamwork
Get all teamwork cards.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "image": "string",
      "alternateImages": ["string"],
      "threat": "number"
    }
  ]
}
```

### GET /api/ally-universe
Get all ally universe cards.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "image": "string",
      "alternateImages": ["string"],
      "threat": "number"
    }
  ]
}
```

### GET /api/training
Get all training cards.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "image": "string",
      "alternateImages": ["string"],
      "threat": "number"
    }
  ]
}
```

### GET /api/basic-universe
Get all basic universe cards.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "image": "string",
      "alternateImages": ["string"],
      "threat": "number"
    }
  ]
}
```

### GET /api/power-cards
Get all power cards.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "power_type": "string",
      "value": "number",
      "image": "string",
      "one_per_deck": "boolean",
      "alternateImages": ["string"]
    }
  ]
}
```

### GET /api/power-cards/:id/alternate-images
Get alternate images for a specific power card.

**Parameters:**
- `id` (string): Power card ID

**Response:**
```json
{
  "success": true,
  "data": ["string"]
}
```

---

## User Management Endpoints

### GET /api/users
Get all users (ADMIN only).

**Authentication:** Required (ADMIN role)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "USER|ADMIN|GUEST",
      "created_at": "string",
      "updated_at": "string"
    }
  ]
}
```

### POST /api/users
Create a new user (ADMIN only).

**Authentication:** Required (ADMIN role)

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "USER",
    "created_at": "string",
    "updated_at": "string"
  },
  "message": "User \"username\" created successfully"
}
```

### POST /api/users/change-password
Change the current user's password.

**Authentication:** Required (USER or ADMIN role)

**Request Body:**
```json
{
  "newPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated"
}
```

---

## Guest Deck Endpoints (GUEST role only)

Guest deck endpoints allow users with the **GUEST** role to create, list, get, update, and delete decks that are **session-scoped only**. Data is stored in memory keyed by the session cookie and **is not persisted to the database**. Decks expire after a period of inactivity (e.g. 24 hours). Non-GUEST users receive `403 Forbidden` on these endpoints. A valid session cookie is required (`401` if missing).

**Note:** The "+Deck" button on the Card Database view is **disabled for GUEST**. For the history of what we tried (add-to-DB-deck, session-copy-from-dropdown, etc.) and why we keep it disabled, see [Guest Deck Lessons Learned](GUEST_DECK_LESSONS_LEARNED.md).

**Base path:** `/api/guest/decks`

### POST /api/guest/decks
Create a new guest deck for the current session.

**Authentication:** Required (GUEST role; session cookie required)

**Request Body:**
```json
{
  "name": "string (optional, default: New Deck)",
  "description": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "string (guest_...)",
    "name": "string",
    "description": "string",
    "created_at": "string (ISO)",
    "updated_at": "string (ISO)"
  }
}
```

### GET /api/guest/decks
List all guest decks for the current session.

**Authentication:** Required (GUEST role)

**Response:** `200 OK` — same array shape as `GET /api/decks` (metadata + cards per deck).

### GET /api/guest/decks/:id
Get a single guest deck by ID. The deck must belong to the current session.

**Authentication:** Required (GUEST role)

**Response:** `200 OK` — same shape as `GET /api/decks/:id` (metadata with `isOwner: true`, cards array). `404` if not found or wrong session.

### PUT /api/guest/decks/:id
Update guest deck metadata (name, description).

**Authentication:** Required (GUEST role)

**Request Body:** `{ "name": "string (optional)", "description": "string (optional)" }`

**Response:** `200 OK` with full deck data, or `404` if not found.

### PUT /api/guest/decks/:id/cards
Replace all cards in a guest deck. Same request/response semantics as `PUT /api/decks/:id/cards` (body: `{ "cards": [ { "cardType", "cardId", "quantity", "exclude_from_draw" (optional) } ] }`).

**Authentication:** Required (GUEST role)

**Response:** `200 OK` with updated deck data, or `404` if not found.

### POST /api/guest/decks/:id/cards
Add a single card to a guest deck. Same request body as `POST /api/decks/:id/cards`: `{ "cardType", "cardId", "quantity" (optional, default 1) }`. Deck-building rules (one-per-deck, cataclysm limit, etc.) apply.

**Authentication:** Required (GUEST role)

**Response:** `200 OK` with updated deck data, or `400` for validation errors, or `404` if deck not found.

### DELETE /api/guest/decks/:id
Delete a guest deck for the current session.

**Authentication:** Required (GUEST role)

**Response:** `200 OK` with `{ "success": true }`, or `404` if not found.

---

## Deck Management Endpoints

### GET /api/decks
Get all decks for the authenticated user.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "metadata": {
        "id": "string",
        "name": "string",
        "description": "string",
        "created": "string",
        "lastModified": "string",
        "cardCount": "number",
        "threat": "number",
        "is_valid": "boolean",
        "userId": "string",
        "uiPreferences": "object",
        "is_limited": "boolean",
        "background_image_path": "string|null"
      },
      "cards": [
        {
          "cardType": "string",
          "cardId": "string",
          "quantity": "number",
          "selectedAlternateImage": "string"
        }
      ]
    }
  ]
}
```

### POST /api/decks
Create a new deck.

**Authentication:** Required (USER or ADMIN role, not GUEST)
**Security:**
- Read-only mode detection (blocks if `readonly=true` in URL/query/headers)
- Rate limiting: 100 requests per minute per IP
- Input validation: name required (max 100 chars), description max 500 chars, characters max 50 items

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "characters": [
    {
      "cardType": "string",
      "cardId": "string",
      "quantity": "number",
      "selectedAlternateImage": "string"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "user_id": "string",
    "created_at": "string",
    "updated_at": "string",
    "cards": []
  }
}
```

### GET /api/decks/:id
Get a specific deck by ID.

**Authentication:** Required

**Parameters:**
- `id` (string): Deck ID

**Response:**
```json
{
  "success": true,
  "data": {
    "metadata": {
      "id": "string",
      "name": "string",
      "description": "string",
      "created": "string",
      "lastModified": "string",
      "cardCount": "number",
      "userId": "string",
      "uiPreferences": "object",
      "isOwner": "boolean",
      "is_limited": "boolean",
      "reserve_character": "string"
    },
    "cards": []
  }
}
```

### GET /api/decks/:id/full
Get a deck with all card types loaded (background loading endpoint).

**Authentication:** Required

**Parameters:**
- `id` (string): Deck ID

**Response:**
```json
{
  "success": true,
  "data": {
    "metadata": {
      "id": "string",
      "name": "string",
      "description": "string",
      "created": "string",
      "lastModified": "string",
      "cardCount": "number",
      "userId": "string",
      "uiPreferences": "object",
      "isOwner": "boolean",
      "is_limited": "boolean",
      "reserve_character": "string"
    },
    "cards": []
  }
}
```

### PUT /api/decks/:id
Update a deck's metadata.

**Authentication:** Required (USER or ADMIN role, not GUEST)
**Security:**
- Read-only mode detection (blocks if `readonly=true` in URL/query/headers)
- Rate limiting: 100 requests per minute per IP
- Ownership validation required
- Input validation: name max 100 chars, description max 500 chars, reserve_character max 50 chars

**Parameters:**
- `id` (string): Deck ID

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "is_limited": "boolean",
  "is_valid": "boolean",
  "reserve_character": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metadata": {
      "id": "string",
      "name": "string",
      "description": "string",
      "created": "string",
      "lastModified": "string",
      "cardCount": "number",
      "userId": "string",
      "uiPreferences": "object",
      "isOwner": "boolean",
      "is_limited": "boolean",
      "reserve_character": "string"
    },
    "cards": []
  }
}
```

### DELETE /api/decks/:id
Delete a deck.

**Authentication:** Required (USER or ADMIN role, not GUEST)
**Security:**
- Read-only mode detection (blocks if `readonly=true` in URL/query/headers)
- Rate limiting: 100 requests per minute per IP
- Ownership validation required

**Parameters:**
- `id` (string): Deck ID

**Response:**
```json
{
  "success": true,
  "message": "Deck deleted successfully"
}
```

---

## Deck Card Management Endpoints

### POST /api/decks/:id/cards
Add a card to a deck.

**Authentication:** Required (USER or ADMIN role, not GUEST)
**Security:**
- Read-only mode detection (blocks if `readonly=true` in URL/query/headers)
- Rate limiting: 100 requests per minute per IP
- Ownership validation required
- Input validation: cardType/cardId required (max 50/100 chars), quantity 1-10, selectedAlternateImage max 200 chars

**Parameters:**
- `id` (string): Deck ID

**Request Body:**
```json
{
  "cardType": "string",
  "cardId": "string",
  "quantity": "number",
  "selectedAlternateImage": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "user_id": "string",
    "created_at": "string",
    "updated_at": "string",
    "cards": []
  }
}
```

### PUT /api/decks/:id/cards
Replace all cards in a deck (bulk operation).

**Authentication:** Required (USER or ADMIN role, not GUEST)
**Security:**
- Read-only mode detection (blocks if `readonly=true` in URL/query/headers)
- Rate limiting: 100 requests per minute per IP
- Ownership validation required
- Input validation: cards array max 100 items, each card validated individually

**Parameters:**
- `id` (string): Deck ID

**Request Body:**
```json
{
  "cards": [
    {
      "cardType": "string",
      "cardId": "string",
      "quantity": "number",
      "selectedAlternateImage": "string"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "user_id": "string",
    "created_at": "string",
    "updated_at": "string",
    "cards": []
  }
}
```

### DELETE /api/decks/:id/cards
Remove a card from a deck.

**Authentication:** Required (USER or ADMIN role, not GUEST)
**Security:**
- Read-only mode detection (blocks if `readonly=true` in URL/query/headers)
- Rate limiting: 100 requests per minute per IP
- Ownership validation required
- Input validation: cardType/cardId required (max 50/100 chars), quantity 1-10

**Parameters:**
- `id` (string): Deck ID

**Request Body:**
```json
{
  "cardType": "string",
  "cardId": "string",
  "quantity": "number"
}
```

**Special Case - Clear All Cards:**
```json
{
  "cardType": "all",
  "cardId": "all"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "user_id": "string",
    "created_at": "string",
    "updated_at": "string",
    "cards": []
  }
}
```

### PATCH /api/decks/:id/cards/:cardType/:cardId
Update a specific card's quantity or alternate image in a deck.

**Authentication:** Required (USER or ADMIN role, not GUEST)
**Security:**
- Read-only mode detection (blocks if `readonly=true` in URL/query/headers)
- Rate limiting: 100 requests per minute per IP
- Ownership validation required
- Input validation: quantity 1-10, selectedAlternateImage max 200 chars

**Parameters:**
- `id` (string): Deck ID
- `cardType` (string): Card type (e.g., "character", "power", "mission")
- `cardId` (string): Card ID

**Request Body:**
```json
{
  "quantity": "number",
  "selectedAlternateImage": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "user_id": "string",
    "created_at": "string",
    "updated_at": "string",
    "cards": []
  }
}
```

**Note:** This endpoint is available at the repository level but may not be exposed via a dedicated API route. Use the bulk replace endpoint (`PUT /api/decks/:id/cards`) for updating card quantities.

---

## Deck Validation Endpoint

### POST /api/decks/validate
Validate a deck configuration.

**Authentication:** Required

**Request Body:**
```json
{
  "cards": [
    {
      "cardType": "string",
      "cardId": "string",
      "quantity": "number",
      "selectedAlternateImage": "string"
    }
  ]
}
```

**Response (Valid Deck):**
```json
{
  "success": true,
  "message": "Deck is valid"
}
```

**Response (Invalid Deck):**
```json
{
  "success": false,
  "error": "Validation error messages",
  "validationErrors": [
    {
      "message": "string",
      "type": "string"
    }
  ]
}
```

---

## Security Features

### Read-Only Mode Detection
All deck modification endpoints automatically detect read-only mode through:
- URL parameters: `?readonly=true`
- Query parameters: `readonly=true`
- HTTP headers: `x-readonly-mode: true`

When read-only mode is detected, all modification operations are blocked with a 403 Forbidden response.

### Rate Limiting
Security-sensitive operations are rate limited to prevent abuse:
- **Limit:** 100 requests per minute per IP address
- **Scope:** Per operation type (deck creation, card addition, etc.)
- **Response:** 429 Too Many Requests when limit exceeded
- **Window:** 1 minute sliding window

### Input Validation
All endpoints include comprehensive input validation:
- **String lengths:** Enforced maximum lengths for all text fields
- **Array sizes:** Limited array sizes for bulk operations
- **Data types:** Strict type checking for all parameters
- **Required fields:** Validation of mandatory parameters

### Authentication & Authorization
- **Guest users:** Blocked from all modification operations
- **Ownership validation:** Users can only modify decks they own
- **Role-based access:** USER and ADMIN roles required for modifications

---

## Statistics Endpoints

### GET /api/deck-stats
Get deck statistics for the authenticated user.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDecks": "number",
    "totalCards": "number",
    "averageCardsPerDeck": "number",
    "largestDeckSize": "number"
  }
}
```

---

## UI Preferences Endpoints

### GET /api/decks/:id/ui-preferences
Get UI preferences for a specific deck.

**Authentication:** Required

**Parameters:**
- `id` (string): Deck ID

**Response:**
```json
{
  "success": true,
  "data": {
    "viewMode": "tile|list",
    "sortBy": "string",
    "filterBy": "string"
  }
}
```

### PUT /api/decks/:id/ui-preferences
Update UI preferences for a specific deck.

**Authentication:** Required (USER or ADMIN role, not GUEST)
**Security:** 
- Read-only mode detection (blocks if `readonly=true` in URL/query/headers)
- Rate limiting: 100 requests per minute per IP
- Ownership validation required
- Input validation: preferences object size limited to 1000 characters

**Parameters:**
- `id` (string): Deck ID

**Request Body:**
```json
{
  "viewMode": "tile|list",
  "sortBy": "string",
  "filterBy": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "viewMode": "tile|list",
    "sortBy": "string",
    "filterBy": "string"
  }
}
```

---

## Collection Endpoints

Collection endpoints manage the authenticated user's card collection. GUEST users use a sandbox (localStorage) on the client; USER and ADMIN persist via these APIs.

### GET /api/collections/me
Get the current user's collection ID.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "user_id": "string"
  }
}
```

### GET /api/collections/me/cards
Get all cards in the current user's collection.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "collection_id": "string",
      "card_id": "string",
      "card_type": "string",
      "quantity": "number",
      "image_path": "string",
      "card_name": "string",
      "set": "string"
    }
  ]
}
```

### POST /api/collections/me/cards
Add a card (or increment quantity) to the collection. Respects foil/alternate art via `imagePath`.

**Authentication:** Required

**Request Body:**
```json
{
  "cardId": "string",
  "cardType": "string",
  "quantity": "number (optional, default 1)",
  "imagePath": "string (optional, used for foil/alternate art)"
}
```

**Response:** `200` with added/updated card; `404` if card does not exist.

### POST /api/collections/me/cards/remove-one
Remove one copy of a card variant from the collection. Respects foil/alternate art via `imagePath` (same variant as when adding).

**Authentication:** Required

**Request Body:**
```json
{
  "cardId": "string",
  "cardType": "string",
  "imagePath": "string"
}
```

**Response:** `200` with `data` set to the updated card (or `null` if the last copy was removed); `404` if the card is not in the collection or quantity is already 0.

### PUT /api/collections/me/cards/:cardId
Update quantity for a card variant in the collection. Set quantity to 0 to remove the variant.

**Authentication:** Required

**Request Body:** `quantity`, `cardType`, `imagePath` (and optionally `oldImagePath`).

**Response:** `200` with updated card; `404` if not found.

### DELETE /api/collections/me/cards/:cardId
Remove all copies of a card (by `cardId` + `cardType`) from the collection. Does not key by `imagePath`.

**Authentication:** Required

**Query:** `cardType` (required)

**Response:** `200` on success; `404` if not found.

---

## System Endpoints

### GET /health
Comprehensive health check endpoint that provides detailed system status information.

**Description:**
This endpoint performs a thorough health check of the entire system, including database connectivity, migration status, resource usage, and application metrics. It's designed for monitoring, debugging, and deployment verification.

**HTTP Status Codes:**
- `200` - System is healthy (OK or DEGRADED status)
- `503` - System is unhealthy (ERROR status)

**Response:**
```json
{
  "status": "OK|DEGRADED|ERROR",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "uptime": 3600.5,
  "version": "1.0.0",
  "environment": "development|production|staging",
  "git": {
    "commit": "4a2f68584caa4dc270f45c3d4f279c93307b4f17",
    "shortCommit": "4a2f685",
    "branch": "main",
    "commitDate": "2024-01-15 10:25:30 +0000",
    "commitMessage": "Add enhanced health check with git and migration info",
    "commitAuthor": "John Doe",
    "commitEmail": "john.doe@example.com",
    "remoteUrl": "https://github.com/username/repository.git"
  },
  "resources": {
    "memory": {
      "rss": "45MB",
      "heapTotal": "20MB", 
      "heapUsed": "15MB",
      "external": "2MB"
    },
    "cpu": {
      "platform": "darwin",
      "arch": "x64",
      "nodeVersion": "v18.17.0"
    }
  },
  "database": {
    "status": "OK|ERROR",
    "latency": "15ms",
    "connection": "Active|Failed",
    "guestUser": {
      "exists": true,
      "count": 1,
      "users": [
        {
          "id": "uuid",
          "username": "guest",
          "role": "GUEST"
        }
      ]
    },
    "guestDecks": {
      "total": 5
    },
    "stats": {
      "totalUsers": 3,
      "totalDecks": 12,
      "totalDeckCards": 156,
      "totalCharacters": 43,
      "totalSpecialCards": 28,
      "totalPowerCards": 15
    },
    "latestMigration": {
      "version": "V150",
      "description": "Fix_The_Gemini_alternate_image",
      "type": "SQL",
      "script": "V150__Fix_The_Gemini_alternate_image.sql",
      "installedBy": "postgres",
      "installedOn": "2024-01-15T09:45:30.000Z",
      "executionTime": 250,
      "success": true
    }
  },
  "migrations": {
    "status": "OK|ERROR",
    "valid": true,
    "upToDate": true
  },
  "latency": "45ms"
}
```

**Field Descriptions:**

**Top Level:**
- `status`: Overall system health status
  - `OK`: All systems functioning normally
  - `DEGRADED`: Some non-critical issues detected (database slow, migrations pending)
  - `ERROR`: Critical system failure (database down, migration errors)
- `timestamp`: ISO 8601 timestamp of when the health check was performed
- `uptime`: Server uptime in seconds since last restart
- `version`: Application version from package.json
- `environment`: Current Node.js environment (development/production/staging)
- `latency`: Total time taken to perform the health check

**Git Information:**
- `commit`: Full SHA hash of the current git commit
- `shortCommit`: Short SHA hash (first 7 characters) for display
- `branch`: Current git branch name
- `commitDate`: ISO timestamp of when the commit was made
- `commitMessage`: Subject line of the most recent commit
- `commitAuthor`: Name of the commit author
- `commitEmail`: Email address of the commit author
- `remoteUrl`: URL of the remote git repository

**Resource Usage:**
- `memory.rss`: Resident Set Size - total memory allocated to the process
- `memory.heapTotal`: Total heap memory allocated by V8
- `memory.heapUsed`: Heap memory currently in use by V8
- `memory.external`: Memory used by C++ objects bound to JavaScript objects
- `cpu.platform`: Operating system platform (darwin, linux, win32)
- `cpu.arch`: CPU architecture (x64, arm64, etc.)
- `cpu.nodeVersion`: Node.js version string

**Database Health:**
- `status`: Database connection and query status
- `latency`: Time taken to execute database health queries
- `connection`: Database connection state
- `guestUser`: Information about guest user accounts
  - `exists`: Whether guest users are properly configured
  - `count`: Number of guest users in the system
  - `users`: Array of guest user details
- `guestDecks`: Statistics about guest-created decks
- `stats`: Database table row counts for monitoring
- `migrations`: Comprehensive migration information
  - `latest`: Information about the most recent database migration
    - `version`: Migration version number (e.g., V150)
    - `description`: Human-readable migration description
    - `type`: Migration type (SQL, JAVA, etc.)
    - `script`: Migration script filename
    - `checksum`: Migration file checksum for integrity verification
    - `installedBy`: Database user who ran the migration
    - `installedOn`: When the migration was executed
    - `executionTime`: How long the migration took (milliseconds)
    - `success`: Whether the migration completed successfully
    - `installedRank`: Migration execution order rank
  - `summary`: Overall migration statistics
    - `total`: Total number of migrations in the system
    - `successful`: Number of successfully applied migrations
    - `failed`: Number of failed migrations
    - `lastRun`: Date of the most recent migration execution

**Migration Status:**
- `status`: Overall migration system health
- `valid`: Whether the database schema is valid
- `upToDate`: Whether all available migrations have been applied

**Usage Examples:**

**Basic Health Check:**
```bash
curl http://localhost:8085/health
```

**Health Check with Status Code:**
```bash
curl -w "%{http_code}" http://localhost:8085/health
```

**Monitoring Integration:**
This endpoint is designed for integration with monitoring systems like:
- Prometheus/Grafana
- DataDog
- New Relic
- Custom health check services

**Error Scenarios:**
- Database connection failure returns `status: "ERROR"` with HTTP 503
- Migration issues return `status: "DEGRADED"` with HTTP 200
- System resource exhaustion may affect response times
- Network issues between application and database are detected

### GET /api/database/status
Get database status information.

**Response:**
```json
{
  "status": "OK|ERROR",
  "database": {
    "valid": "boolean",
    "upToDate": "boolean",
    "migrations": "Flyway managed"
  }
}
```

### GET /test
Test endpoint for development (returns sample data).

**Response:**
```json
{
  "characters": "number",
  "locations": "number",
  "stats": {
    "characters": "number",
    "locations": "number"
  },
  "sampleLocation": {
    "id": "string",
    "name": "string",
    "description": "string"
  }
}
```

### GET /api/debug/clear-cache
Clear the deck cache (development/debugging endpoint).

**Authentication:** Required
**Security:** Development use only

**Response:**
```json
{
  "success": true,
  "message": "Deck cache cleared"
}
```

---

## Static File Endpoints

### GET /
Main application page.

### GET /users/:userId/decks
Deck builder page for a specific user.

**Parameters:**
- `userId` (string): User ID

### GET /users/:userId/decks/:deckId
Deck editor page for a specific deck.

**Parameters:**
- `userId` (string): User ID
- `deckId` (string): Deck ID

### GET /data
Database view page.

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## Image Resources

Card images are served from the following static endpoints:
- `/src/resources/cards/images/` - Card images
- `/src/resources/images/` - General images

---

## Notes

- All timestamps are in ISO 8601 format
- Card quantities default to 1 if not specified
- Guest users have read-only access to decks
- **Database view collection buttons:** +Collection is available to all logged-in users (GUEST = sandbox in localStorage, USER/ADMIN = persisted via API). -Collection removes one copy of the selected variant (card + image path); it is inactive when the variant is not in the collection. Foil and alternate art are tracked per `imagePath` in both the API and the GUEST sandbox.
- Deck validation includes business rules (e.g., maximum 4 characters per deck)
- UI preferences are stored per deck and persist across sessions
- The health check endpoint provides comprehensive system status information
- **Import functionality is currently disabled** - The import deck feature has been removed from the backend while keeping the button visible for ADMIN users as a placeholder

## Card Quantity Management

The API supports card quantity management through several approaches:

1. **Add with Quantity**: Use `POST /api/decks/:id/cards` with a `quantity` parameter
2. **Remove with Quantity**: Use `DELETE /api/decks/:id/cards` with a `quantity` parameter to reduce or remove cards
3. **Bulk Replace**: Use `PUT /api/decks/:id/cards` to replace all cards with new quantities
4. **Individual Update**: The repository supports `updateCardInDeck()` but no dedicated API endpoint exists yet

For updating individual card quantities, the recommended approach is to use the bulk replace endpoint (`PUT /api/decks/:id/cards`) with the complete deck state.