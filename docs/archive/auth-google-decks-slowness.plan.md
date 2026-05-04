# Google sign-in → decks: slowness plan (updated)

## Symptom you described

> The Google **popup** takes forever to **actually sign [you] into [your] decks**.

That is **not identical** to the earlier generic “login/logout is slow” framing. It points at the **end-to-end** path from **clicking Google** until **decks are usable** (deck list loaded / deck builder ready). That path has **several** segments; only some match the earlier “long pole” list.

| Phase | What happens | Typical pain if “slow” |
|-------|----------------|-------------------------|
| **A** | `initializeFirebase` → `GET /api/config/firebase` | Usually ~150–200 ms (verified remotely); rarely “forever” |
| **B** | `signInWithPopup` + Google account UI | **User + Google**; often **seconds**; not your server |
| **C** | Popup closes → `getIdToken` → `POST /api/auth/google` | `verifyIdToken` + DB; **new users** also inline **sample deck copy** (can be **very** slow) |
| **D** | `finalizeGoogleSessionWithIdToken` → `showMainApp` → `switchToDeckBuilder` → **`loadDecks` / `loadDeckBuilderData`** | **Deck list API + render**; can feel like “still not signed into decks” after the modal closes |

**Same underlying issues?** **Partly yes:** server handler ([`handleGoogleLogin`](../../src/services/AuthenticationService.ts)), optional [`NewUserSampleDeckService`](../../src/services/newUserSampleDeckService.ts) (runs on **new** Google accounts only), and post-login **`loadDecks`** are still the right places if slowness is **after** the popup **finishes** (phases C–D). **Partly no:** if time is spent **on Google’s consent/account UI** inside the popup, that is mostly **B** (external), not session exchange or deck APIs.

**COOP / `window.closed` console noise:** Unrelated to “forever to decks” in the sense of **total seconds**; production HTML **does** send `Cross-Origin-Opener-Policy: same-origin-allow-popups` on the main app (see verification). It may still produce Firebase warnings; that does not explain a **multi-second** post-login stall by itself.

---

## Verification already done (non-browser)

- **`GET https://excelsior.cards/`** — `cross-origin-opener-policy: same-origin-allow-popups` (HTML opener is correct for popups).
- **`GET /users/guest/decks`** — same COOP (other `index.html` routes consistent).
- **APIs** (e.g. `/api/config/firebase`) — `same-origin` (Helmet); expected; not the document opener.
- **Rough remote timings** (one edge, varies by location): `GET /` ~0.3–0.4 s total; `GET /api/config/firebase` ~0.16–0.18 s; `POST /api/auth/logout` (unauthenticated) ~0.2–0.3 s. **Cannot** time `POST /api/auth/google` or the Google popup from here.

---

## What you can do to pinpoint “forever” (still recommended)

1. **DevTools → Network**: Filter **Fetch/XHR**. Note timestamps from **`signInWithPopup` resolves** (modal closes) to:
   - first **`POST /api/auth/google`** response, then
   - **`GET /api/v1/decks`** (see [`loadDecks` in `public/js/deck-selection/index.js`](../../public/js/deck-selection/index.js); guests use `/api/v1/guest/decks`).
2. **If `/api/auth/google` is long** (e.g. >1–2 s): check whether this is a **first-time** Google user on the site (sample deck runs once). Server logs / DB can confirm. If **returning** user and still slow, profile **`verifyIdToken`** and DB on the host.
3. **If Google is long but `/api/auth/google` is fast**: bottleneck is **B** (Google) or **D** (deck APIs / large payload), not the session exchange.

---

## Possible code/product changes (only if measured bottleneck warrants)

These are **optional** and out of band until you choose to implement:

- **New-user sample deck:** run `copyRandomGuestDeckForUser` **after** returning 200 (async job or fire-and-forget with error logging) so first Google sign-in does not block the HTTP response. **Tradeoff:** user might briefly see empty deck list then it appears.
- **Deck load after login:** ensure `loadDecks` is not blocked unnecessarily on a huge sequential chain; any improvement depends on what Network shows.
- **Popup vs redirect:** `signInWithRedirect` removes popup COOP edge cases; **UX tradeoff** (full-page redirect flow).

**Infrastructure spend lock:** do not change paid AWS/TF without explicit instruction.

---

## Todos (tracking)

- [x] Verify production `COOP` on HTML document (`same-origin-allow-popups` on `/`).
- [ ] **User:** Network waterfall: time **after** popup closes → `/api/auth/google` → first deck list request.
- [ ] If `/api/auth/google` dominates for **new** accounts: consider deferring sample deck copy (code change + product approval).
- [ ] If deck requests dominate: optimize deck list API or client loading (separate work after measurement).

---

## File references

- Client: [`public/components/login/login.js`](../../public/components/login/login.js) — `handleGoogleLogin`, `finalizeGoogleSessionWithIdToken`
- Server: [`src/services/AuthenticationService.ts`](../../src/services/AuthenticationService.ts) — `handleGoogleLogin`
- Sample deck: [`src/services/newUserSampleDeckService.ts`](../../src/services/newUserSampleDeckService.ts)
- After login UI: [`public/js/app-initialization.js`](../../public/js/app-initialization.js) — `showMainApp` → `switchToDeckBuilder` in [`public/components/globalNav.js`](../../public/components/globalNav.js)
- COOP on HTML: [`src/routes/pages.routes.ts`](../../src/routes/pages.routes.ts) — `HTML_POPUP_FRIENDLY_HEADERS`
