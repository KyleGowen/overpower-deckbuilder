# Frontend Auth & Session Guide

Authoritative reference for any frontend (new SPA or existing vanilla JS) integrating with the Excelsior Deckbuilder backend. The backend source of truth is [`src/services/AuthenticationService.ts`](../../src/services/AuthenticationService.ts) and [`src/routes/auth.routes.ts`](../../src/routes/auth.routes.ts).

---

## Table of contents

1. [Auth mechanisms overview](#1-auth-mechanisms-overview)
2. [Session cookie login (POST /api/auth/login)](#2-session-cookie-login)
3. [Guest session](#3-guest-session)
4. [Google Sign-In (OAuth)](#4-google-sign-in-oauth)
5. [JWT Bearer login (POST /api/v1/auth/login)](#5-jwt-bearer-login)
6. [Token refresh (POST /api/v1/auth/refresh)](#6-token-refresh)
7. [Bootstrap — who am I? (GET /api/auth/me)](#7-bootstrap--who-am-i)
8. [Logout and session revocation](#8-logout-and-session-revocation)
9. [Sending credentials in fetch()](#9-sending-credentials-in-fetch)
10. [401 / 403 response shapes](#10-401--403-response-shapes)
11. [GUEST collection — localStorage only](#11-guest-collection--localstorage-only)
12. [Role reference](#12-role-reference)

---

## 1. Auth mechanisms overview

The app supports two parallel auth mechanisms:

| Mechanism | Cookie name | Accepted by | Use case |
| --------- | ----------- | ----------- | -------- |
| **Session cookie** | `sessionId` (custom, Postgres-backed) | All `/api/*` and `/api/v1/*` routes | Main web app, server-rendered flow |
| **Bearer JWT** | — (header: `Authorization: Bearer <token>`) | Catalog, deck, and auth v1 routes | API-first / mobile clients, CI |

Both mechanisms go through the same `AuthenticationService`; the user record fetched is identical. Roles (`GUEST`, `USER`, `ADMIN`) are stored on the session row and returned in both token payloads and the session.

> For a route-by-route matrix of which mechanism each endpoint accepts, see [API_V1.md § Authentication](../../API_V1.md#authentication).

---

## 2. Session cookie login

```
POST /api/auth/login
Content-Type: application/json

{ "username": "<username>", "password": "<password>" }
```

**Success 200:**

```json
{ "success": true, "data": { "userId": "...", "username": "...", "role": "USER" } }
```

The response sets a `Set-Cookie: sessionId=...` header. The cookie is **HttpOnly** and **SameSite=Lax** (the HTTP-safe default; it becomes `Secure; SameSite=Strict` only when `COOKIE_SECURE=true` for a real HTTPS deployment). **Lifetime:** a **sliding 2-hour** session — the server slides the expiry and re-issues the cookie on every authenticated request, so active users stay logged in; the session only expires after ~2 hours of inactivity.

> **Legacy vs v1 envelope:** `/api/auth/login` uses the legacy `{ success, data, error }` shape, not the v1 envelope. For new frontend code, prefer the v1 login endpoint (see §5).

---

## 3. Guest session

Send `POST /api/auth/login` with `username: "guest"` and **no password** (empty string or omit):

```json
{ "username": "guest", "password": "" }
```

**Success 200:**

```json
{ "success": true, "data": { "userId": "<guest-uuid>", "username": "guest", "role": "GUEST" } }
```

The guest account is a shared read-only user seeded in the database. Its role is `GUEST`. Key GUEST constraints:

- **Cannot** create/update/delete database-backed decks (POST/PUT/DELETE `/api/v1/decks*` → **403 GUEST_FORBIDDEN**)
- **Can** create/edit guest session decks stored in-memory (`/api/v1/guest/decks*`)
- **Cannot** access `/api/v1/collections/me*` — GUEST has no server-side collection (→ **401**)
- **Collection is localStorage-only** (see §11)
- The `+Deck` button in DBV is **disabled** for GUEST — do not re-enable without a product decision (see [`docs/current/GUEST_DECK_LESSONS_LEARNED.md`](GUEST_DECK_LESSONS_LEARNED.md))

---

## 4. Google Sign-In (OAuth)

```
GET /api/auth/google          → redirects to Google OAuth consent
GET /api/auth/google/callback → handles OAuth callback, sets session cookie, redirects to /
```

After a successful Google callback the user has a live session cookie (same as §2). No JWT is issued on the OAuth path. The frontend does not need to handle any part of this flow — just offer a link to `/api/auth/google` and handle the redirect back to `/`.

---

## 5. JWT Bearer login

```
POST /api/v1/auth/login
Content-Type: application/json

{ "username": "<username>", "password": "<password>" }
```

**Success 200 — v1 envelope:**

```json
{
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<refresh-jwt>",
    "expiresIn": 900,
    "userId": "...",
    "username": "...",
    "role": "USER"
  },
  "meta": {},
  "errors": [],
  "success": true
}
```

Token lifetimes (env-configurable; defaults):

| Token | Default lifetime | Secret env var |
| ----- | ---------------- | -------------- |
| Access token | **15 minutes** (`JWT_ACCESS_EXPIRY`) | `JWT_SECRET` |
| Refresh token | **7 days** (`JWT_REFRESH_EXPIRY`) | `JWT_REFRESH_SECRET` |

Use `Authorization: Bearer <accessToken>` on subsequent requests. Do **not** send the session cookie if using Bearer — pick one mechanism per client.

---

## 6. Token refresh

```
POST /api/v1/auth/refresh
Content-Type: application/json

{ "refreshToken": "<refresh-jwt>" }
```

**Success 200:**

```json
{
  "data": {
    "accessToken": "<new-jwt>",
    "refreshToken": "<new-refresh-jwt>",
    "expiresIn": 900
  },
  "meta": {},
  "errors": [],
  "success": true
}
```

Refresh tokens rotate on every use (old refresh token is invalidated server-side). If the refresh token is expired or revoked:

```json
{
  "data": null,
  "errors": [{ "code": "UNAUTHORIZED", "message": "Invalid or expired refresh token" }],
  "success": false
}
```

**Client strategy:** store access and refresh tokens in memory (not localStorage — XSS risk). Schedule a refresh ~60 s before `expiresIn`. On 401 from any API call, attempt one refresh; if that also fails, redirect to login.

---

## 7. Bootstrap — who am I?

```
GET /api/auth/me
```

Returns the current user from either a session cookie or Bearer token:

**Success 200 (legacy shape):**

```json
{
  "success": true,
  "data": {
    "id": "c567175f-...",
    "username": "kyle",
    "email": "kyle@example.com",
    "role": "ADMIN",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

**Unauthenticated (no session, no valid token):**

```json
{ "success": false, "error": "Not authenticated" }
```

> **Bootstrap pattern:** Call `GET /api/auth/me` on app init (before rendering protected routes) to restore session state without re-prompting for credentials. The session cookie is sent automatically if the browser has one; Bearer clients must include the `Authorization` header.

There is also a v1-envelope equivalent accessible via the same session:

```
GET /api/v1/auth/me
```

Returns the same user data wrapped in `{ "data": {...}, "errors": [], "success": true }`.

---

## 8. Logout and session revocation

**Legacy (session cookie):**

```
POST /api/auth/logout
```

Destroys the server-side session and clears the cookie. Returns `{ "success": true }`.

**v1 (session cookie or Bearer):**

```
POST /api/v1/auth/logout
```

Same session destruction. If a Bearer token was used, the refresh token is revoked server-side. Returns v1 envelope `{ "data": { "message": "Logged out successfully" }, ... }`.

After logout, redirect the user to `/` or `/login`. Clear any in-memory tokens.

---

## 9. Sending credentials in fetch()

**Session cookie clients** must opt in to cross-origin credential forwarding:

```js
fetch('/api/v1/decks', {
  credentials: 'include',   // required for session cookie to be sent
  headers: { 'Content-Type': 'application/json' }
});
```

**Bearer clients** send the token in the header instead (no `credentials: 'include'` needed):

```js
fetch('/api/v1/decks', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

Do **not** send both at once — the middleware will use whichever it finds first (Bearer checked before cookie on routes that accept both).

---

## 10. 401 / 403 response shapes

All `/api/v1/*` routes return the **v1 envelope** on auth failures, regardless of whether session or Bearer auth was used:

```json
{
  "data": null,
  "meta": {},
  "errors": [{ "code": "UNAUTHORIZED", "message": "Authentication required" }],
  "success": false,
  "error": "Authentication required"
}
```

The legacy `error` field is included for backwards compatibility but new code should read `errors[0].code`.

Common error codes:

| Code | HTTP | Meaning |
| ---- | ---- | ------- |
| `UNAUTHORIZED` | 401 | No valid session or token |
| `INVALID_TOKEN` | 401 | Bearer token malformed or expired |
| `SESSION_REQUIRED` | 401 | Route requires a `sessionId` cookie (guest deck routes) |
| `GUEST_FORBIDDEN` | 403 | GUEST role attempted a USER-only action |
| `GUEST_ONLY` | 403 | Non-GUEST attempted a GUEST-only action |
| `DECK_ACCESS_DENIED` | 403 | Authenticated user is not the deck owner |
| `ADMIN_REQUIRED` | 403 | Non-ADMIN attempted an admin route |

Legacy routes outside `/api/v1/` (e.g. `POST /api/auth/login`, `GET /api/auth/me`) return the legacy shape `{ "success": false, "error": "..." }` on 401.

**Client 401 handling (vanilla frontend):** the global `fetch` interceptor in [`public/js/index-page.js`](../../public/js/index-page.js) does **not** log the user out on the first 401 from an arbitrary endpoint. A 401 from `/api/auth/me` is treated as authoritative (immediate logout); a 401 from any other endpoint triggers a single re-verification against `/api/auth/me`, and the session is only torn down (login modal shown) if that confirms the session is gone. This prevents a transient/endpoint-specific 401 from causing a spurious logout. Set `window.__AUTH_DEBUG = false` to silence the `[auth-debug]` client logs.

---

## 11. GUEST collection — localStorage only

GUEST users have no server-side collection row. All collection endpoints (`/api/v1/collections/me*`) return **401** for GUEST. The existing frontend stores the guest collection in **`localStorage`** under the key `guestCollection`.

Expected shape stored in localStorage:

```json
{
  "cardId-1": { "quantity": 2, "cardType": "character" },
  "cardId-2": { "quantity": 1, "cardType": "special" }
}
```

A new frontend must:
1. Read `localStorage.getItem('guestCollection')` on load when the user role is `GUEST`.
2. Write back to `localStorage` on any collection mutation (add/remove card).
3. **Never** call `/api/v1/collections/me*` for GUEST users.
4. Optionally offer to migrate the guest collection to the user's server collection on sign-up/login.

---

## 12. Role reference

| Role | Login | DB decks | Guest decks | Collection (server) | Collection (localStorage) | Admin |
| ---- | ----- | -------- | ----------- | ------------------- | ------------------------- | ----- |
| `GUEST` | `guest` / no password | ✗ (403) | ✓ | ✗ (401) | ✓ | ✗ |
| `USER` | normal credentials | ✓ | ✗ (403) | ✓ | — | ✗ |
| `ADMIN` | normal credentials | ✓ | ✗ (403) | ✓ | — | ✓ |

---

*Last updated during Phase 2 pre-migration readiness work (May 2026). Source code: [`src/services/AuthenticationService.ts`](../../src/services/AuthenticationService.ts), [`src/routes/auth.routes.ts`](../../src/routes/auth.routes.ts), [`src/api/http/auth.http.ts`](../../src/api/http/auth.http.ts).*
