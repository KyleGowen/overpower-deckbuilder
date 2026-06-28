# Legacy v1 UI integration tests (DISABLED)

> These integration tests asserted on the **deprecated v1 vanilla-JS UI** in `public/`
> (served HTML substrings, `/components/globalNav.html`, legacy `/js/*.js` script tags).
> Production UI is the **v2 React SPA** in `frontend/` (`frontend/dist/` via `isSpaBuilt()`).
> We no longer maintain IT coverage for v1 HTML.

**Rollback:** v1 HTML is still served when `EXCELSIOR_DISABLE_SPA=1`, but these tests are
intentionally disabled — not deleted — for historical reference.

**v2 UI verification:** browser/manual per `.cursor/rules/browser-verification.mdc` at
`http://localhost:5173`. Automated v2 E2E (e.g. Playwright) is out of scope here.

## How tests are disabled

1. **Whole-file exclusion** — paths in `testPathIgnorePatterns` in
   [`tests/config/jest.integration.config.js`](../config/jest.integration.config.js).
2. **Partial skip** — `describeV1Frontend` / `itV1Frontend` from
   [`helpers/v1FrontendSkip.ts`](helpers/v1FrontendSkip.ts) on HTML-only blocks inside
   mixed files (API tests in the same file remain active).

**Do not** add new integration tests that assert `response.text` against app-shell HTML or
legacy static component paths. Test `/api/v1/*` and `/api/auth/*` instead.

---

## Whole-file exclusions (`testPathIgnorePatterns`)

| File | Reason |
|------|--------|
| `deck-editor-search-results-visible.test.ts` | `GET /` deck-editor search script includes |
| `deck-editor-search-visible-results.test.ts` | `GET /` search input/results markup |
| `deck-editor-search-bar-basic.test.ts` | Deck editor page HTML elements |
| `deck-editor-character-stacks.test.ts` | `GET /` Character Stacks category wiring |
| `deckEditabilityHTML.test.ts` | Deck editor modal HTML editability |
| `deckEditabilityBrowser.test.ts` | Browser/HTML deck editability |
| `deckClickability.test.ts` | Deck tile HTML clickability |
| `deckTitleDescriptionEditability.test.ts` | Editor title/description HTML |
| `view-button-readonly.test.ts` | Read-only view button HTML chrome |
| `toast-notification-role-based.test.ts` | Role-based toast HTML in served pages |
| `collection/collection-guest-sandbox-ui.test.ts` | Collection guest signup HTML |

**Already excluded before v2 cutover** (unchanged):

| File | Reason |
|------|--------|
| `character-column-layout.test.ts` | Legacy deck editor column layout HTML |
| `deck-save-frontend-validation.test.ts` | Legacy client-side deck save validation JS |

---

## Partial skips (mixed files — API blocks still run)

| File | Skipped (v1 UI) | Still active |
|------|-----------------|--------------|
| `global-nav-integration.test.ts` | View Switching, User Welcome, Navigation State, CSS Styling, Component Integration; HTML tests in Create Deck + Logout | POST `/api/v1/decks`, logout API |
| `create-deck-scenarios.test.ts` | Create Deck Button Access, Temporary Deck Creation (HTML), Deck Editor UI Elements, Role-Based Save Button (HTML) | Deferred persistence, successful creation, API/data describes |
| `deck-navigation-flow.test.ts` | HTML structure / modal describes | Catalog + deck API describes |
| `deck-editor-role-access.test.ts` | HTML shell assertions | API authz tests |
| `guest-add-to-deck-buttons.test.ts` | Guest/Regular/Admin button HTML, Cross-Role, JavaScript Function Integration | Guest Role API 403 verification |
| `foil-deck-selection.test.ts` | `GET /` script include test | Foil deck API test |
| `foil-collection-view.test.ts` | `GET /` collection script test | Collection API foil test |
| `foil-deck-editor-card-view.test.ts` | Deck editor foil script HTML test | Deck API foil card test |
| `foil-deck-editor-list-view.test.ts` | HTML/script loading tests | API tests |
| `foil-deck-editor-tile-view.test.ts` | HTML/script loading tests | API tests |
| `username-persistence-flow.test.ts` | `globalNav.html` welcome elements | Deck save/API persistence flow |

**Not disabled:** `guest-read-only-layout-integration.test.ts` (API + in-process layout mocks, no served v1 HTML).
