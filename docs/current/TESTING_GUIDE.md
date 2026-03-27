# Excelsior Deckbuilder Testing Guide

## 🚀 Jest Integration Test Framework Setup Complete!

Your project now has a comprehensive Jest testing framework set up with the following features:

### ✅ What's Included

1. **Jest Configuration** (`jest.config.js`)
   - TypeScript support with ts-jest
   - Test environment setup
   - Coverage reporting
   - Separate test database

2. **Test Structure**
   ```
   tests/
   ├── integration/          # Full API workflow tests
   ├── unit/                 # Individual function tests
   ├── helpers/              # Test utilities (ApiClient)
   ├── config/               # Test configuration
   └── setup.ts             # Global setup/teardown
   ```

3. **Test Scripts** (in package.json)
   - `npm test` - Run all tests
   - `npm run test:watch` - Run tests in watch mode
   - `npm run test:coverage` - Run with coverage report
   - `npm run test:integration` - Run only integration tests
   - `npm run test:unit` - Run only unit tests

4. **Sample Tests Created**
   - Authentication scenarios
   - Deck management workflows
   - Read-only mode functionality

### 🧪 How to Use

#### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test deckManagement.test.ts

# Run with coverage
npm run test:coverage
```

#### Writing New Tests

**For Integration Tests:**
```typescript
describe('Your Feature', () => {
  let apiClient: ApiClient;
  
  beforeEach(async () => {
    apiClient = new ApiClient(app);
    await apiClient.login('username', 'password');
  });
  
  it('should do something', async () => {
    const response = await apiClient.createDeck({ name: 'Test Deck' });
    expect(response.body.success).toBe(true);
  });
});
```

**For Unit Tests:**
```typescript
import { validateDeck } from '../../src/utils/deckValidation';

describe('Deck Validation', () => {
  it('should validate a legal deck', () => {
    const deck = [/* test data */];
    const result = validateDeck(deck);
    expect(result.isValid).toBe(true);
  });
});
```

### 📝 Describing Test Scenarios

When you want me to write tests for specific scenarios, just describe them like this:

**Example 1:**
> "I want to test the deck sharing functionality. When a user shares a deck link with another user, that user should be able to view the deck in read-only mode. The viewer should see all deck contents but not be able to edit them. Also test what happens if the deck doesn't exist or if the user isn't logged in."

**Example 2:**
> "Test the card search functionality. When a user types in the search bar, it should find cards by name, type, and character. Test that special cards show up when searching for a character name. Also test the hover effects and the scrollbar visibility."

**Example 3:**
> "Test the save functionality. When a user makes changes to their deck and clicks save, it should persist the changes. Test that validation errors are shown for invalid decks. Test that the save button is disabled in read-only mode."

### Test configuration and categories

Unit and integration tests use separate Jest configs in `tests/config/`. Integration tests are split into categories so CI can run them in parallel.

**Unit tests**

- Config: `tests/config/jest.unit.config.js`
- Match: `**/tests/unit/**/*.test.ts` (and `*.spec.ts`)
- Run: `npm run test:unit`

**Integration tests (all)**

- Config: `tests/config/jest.integration.config.js`
- Match: `**/tests/integration/**/*.test.ts` (with some files excluded and run by category configs)
- Run: `npm run test:integration`

**Integration test categories** (each has its own config in `tests/config/`)

| Config | Pattern / files |
|--------|------------------|
| `jest.integration.security.config.js` | `role-based-restrictions.test.ts` |
| `jest.integration.deck-security-save.config.js` | `deck-save-security*.test.ts` |
| `jest.integration.deck-security-ownership.config.js` | `deck-ownership-security*.test.ts` |
| `jest.integration.deck-security-frontend.config.js` | `deck-save-frontend-validation.test.ts` |
| `jest.integration.game-logic-reserve.config.js` | `reserve-character*.test.ts`, `guest-reserve-character-integration.test.ts` |
| `jest.integration.reserve-core.config.js` | `reserve-character-integration.test.ts`, `reserve-character-loading-integration.test.ts`, `reserve-character-simple.test.ts` |
| `jest.integration.reserve-threat.config.js` | `reserve-character-threat-integration.test.ts`, `reserve-character-threat-persistence.test.ts`, `guest-reserve-character-integration.test.ts` |
| `jest.integration.game-logic-characters.config.js` | `character*.test.ts`, `special-character-threat-display.test.ts` |
| `jest.integration.game-logic-character-validation.config.js` | `characterLimitValidation.test.ts` |
| `jest.integration.game-logic-character-layout.config.js` | `character-column-layout.test.ts` |
| `jest.integration.game-logic-character-threat.config.js` | `special-character-threat-display.test.ts` |
| `jest.integration.game-logic-power-teamwork.config.js` | `power*.test.ts`, `teamwork*.test.ts`, `event-mission-filtering-integration.test.ts` |
| `jest.deckbuilding.config.js` | `deckBuilding.test.ts` |

**Run a single category**

```bash
npx jest -c tests/config/jest.integration.security.config.js
npx jest -c tests/config/jest.integration.deck-security-save.config.js
# etc.
```

**Frontend tests**

- Config: `tests/config/jest.frontend.config.js`
- Match: `**/tests/frontend/**/*.test.ts`
- Run: `npm run test:unit` (frontend tests are included in unit run) or run with the frontend config explicitly.

### Where to add new tests

- **Unit tests**: Add `*.test.ts` under `tests/unit/`. Use `tests/helpers/` for shared utilities (e.g. `apiClient.ts`, `deckImportTestHelpers.ts`, `deckExportTestHelpers.ts`, `cardHoverModalTestHelpers.ts`, `drawHandKoDimmingTestHelpers.ts`). Large suites are split by behavior: deck-export-comprehensive (7 files using `deckExportTestHelpers`), card-hover-modal (4 files using `cardHoverModalTestHelpers`), draw-hand-ko-dimming (5 files using `drawHandKoDimmingTestHelpers`), deck-import-character (3 files: extract-find, process, overlay-edge), deck-import-mission-event (2 files: extract-find, process). See [tests/helpers/README.md](../../tests/helpers/README.md).
- **Integration tests**: Add `*.test.ts` under `tests/integration/`. Match one of the category patterns above (e.g. `deck-save-security-*.test.ts` for deck save security) so the test runs in the right CI job. See `tests/integration/.cursorrules` for mandatory cleanup rules (track test users/decks, clean up in `finally`).
- **Frontend tests**: Add `*.test.ts` under `tests/frontend/`.

### Mobile milestone M1 (layout mode + shell)

- **Automated (unit):** [`tests/unit/layout-mode-and-viewport.test.ts`](../../tests/unit/layout-mode-and-viewport.test.ts) covers:
  - `layout-mode.js`: `layout-mobile` / `layout-desktop` classes, `LAYOUT_MOBILE_MAX_PX`, `setPreferDesktopLayout`, and `layout-mode-change` events on `window`.
  - `public/index.html`: `layout-mode.js` and `viewport-positioning.js` load before the first app stylesheet; `mobile-layout.css` is included.
  - `mobile-layout.css`: global nav under `.layout-mobile` — **row** `.unified-header` (logo column + `.header-nav-cluster`), **2×2 + welcome row** grid on **`.header-nav-cluster`** (inner wrappers use `display: contents` so **`#newDeckBtn`** shares the button grid), **`.user-menu-toggle`** `justify-content: flex-end`, **`.user-menu-dropdown`** half width (`50%`, `right: 0`), 44px targets on tabs / **+ Deck** / menu toggle. See [`MOBILE_DESIGN.md`](../../MOBILE_DESIGN.md) **§10**.
  - `mobile-layout.css` **DBV Characters tab** (describe `mobile-layout.css (DBV Characters tab)`): **`--dbv-mobile-tile-img-max`** / **`--dbv-mobile-tile-img-landscape-max-h`** on **`#database-view`**; **All tab** **`#all-cards-grid-container`** tile **`img`** (including **`horizontal-card`**: **`width: 100%`**, **`max-height: none`** for width parity with portrait tiles); **`#characters-table`** card **`tbody tr`**, hidden **`td:nth-child(n+3)`**, actions **`td:nth-child(2)`** grid (**+Deck** full width, collection row); Character **`.card-image-container`** + **`img`** / **`img.horizontal-card`** (**landscape** still uses **`--dbv-mobile-tile-img-landscape-max-h`**); **`.characters-mobile-card-caption`** (desktop hidden) with **`__name`** / **`__ability`** / **`__set`** font sizes; **44px** **`.card-nav-arrow`** targets.
- **Manual:** Viewport **≤900px** (`layout-mobile` on `<html>`). Confirm:
  - **Logo** sits at the **top** of the left column (no false vertical gap); bar uses **no top padding** on `.unified-header`.
  - **Four controls** in a **2×2** grid: Card Database \| Collection / Deck Builder \| + Deck; tap targets feel usable.
  - **Welcome** line and ▶ are **right-aligned** with the right column of buttons.
  - Open account menu: dropdown is about **half** the cluster width, **right-aligned**; actions still tappable.
  - Optional **`preferDesktopLayout`** override restores desktop chrome — see [`MOBILE_DESIGN.md`](../../MOBILE_DESIGN.md) §5–§8.

### Mobile milestone M2c (Card Database / DBV)

- **Automated:** Run full `npm run test:unit` after DBV changes. [`layout-mode-and-viewport.test.ts`](../../tests/unit/layout-mode-and-viewport.test.ts) asserts `mobile-layout.css` for DBV **All** grid (single column), **All** tab cell button grid, DB category **tab-container** caps (M1 describe), **Characters tab** card layout (describe **`mobile-layout.css (DBV Characters tab)`**), and **Special Cards tab** mobile rules (describe **`mobile-layout.css (DBV Special Cards tab)`**), plus **`public/index.html`** wiring for **`special-cards-filter-row`** / **`clear-special-filters-desktop`**. Comments in `mobile-layout.css` next to **`--dbv-mobile-tile-*`** and the Characters / Special **M2c** sections point to this test file. **Aspects tab** mobile DBV: [`dbv-aspects-mobile.test.ts`](../../tests/unit/dbv-aspects-mobile.test.ts) (see [`docs/current/DBV_ASPECTS_MOBILE.md`](DBV_ASPECTS_MOBILE.md)). **Missions tab** mobile DBV: [`dbv-missions-mobile.test.ts`](../../tests/unit/dbv-missions-mobile.test.ts) (see [`docs/current/DBV_MISSIONS_MOBILE.md`](DBV_MISSIONS_MOBILE.md)).
- **Manual:** Viewport ≤900px (or `layout-mobile` on `<html>`). Open **Card Database** from global nav.
  - **All tab:** Grid is **one card per row** (not five across). Card art (portrait and landscape) uses nearly full row width. Each tile: **+Deck** full width on first action row; **-Collection** and **+Collection** side-by-side on the second row.
  - **Characters (default tab):** Each character appears as a **card block**; **mobile** shows **image**, **caption** under the art (**name**; **inherent ability** line when present; **set / number**), and **action buttons** (name/stat **`td`** cells stay hidden in CSS); image and actions (**+Deck**; when logged in, **-Collection** and **+Collection** on one row) are usable; no **Deck & collection** row label on the actions cell; alternate-art **‹ ›** controls work and update the caption; no clipped row heights after rotating or resizing.
  - **Special Cards tab:** Filter card is **full width** (not a thin left column): **function** icons, teal **`|`**, compact **Clear filters** on the same row; then **type** icons + **No Icon**; then **value** row (**`= / Min / Max`** + **No value** ban — **grid** **1%** gutters, **~21/31/31/11%** controls, no full-width clear in that block); then **character** / **card name** / **card text** fields. **Card rows** match **Characters** (art, caption, **+Deck** / collection); **‹ ›** updates caption and buttons.
  - **Another tab** (e.g. Missions or Advanced Universe, if not yet mobile-card style): Filters wrap; tables scroll horizontally where columns remain wide; header filter inputs are tappable (≥44px height where styled).
  - **Layout toggle:** Resize across **900px** (layout-mode threshold) or use `preferDesktopLayout` — Characters table returns to desktop row layout with height locks; no stale inline locks on mobile.
- **Reference:** [`MOBILE_DESIGN.md`](../../MOBILE_DESIGN.md) milestone M2c and **§10.2–10.6** (All, Characters, Special Cards, Aspects, **Missions**); styles in [`public/css/mobile-layout.css`](../../public/css/mobile-layout.css); `data-label` + caption + height locks in [`public/js/card-display.js`](../../public/js/card-display.js); All-tab markup from [`public/js/all-cards-display.js`](../../public/js/all-cards-display.js); Special Cards thead in [`public/index.html`](../../public/index.html); Missions mobile spec [`docs/current/DBV_MISSIONS_MOBILE.md`](DBV_MISSIONS_MOBILE.md).

### Character Stacks Coverage

- **Unit coverage**: `tests/unit/card-filter-toggles.test.ts` includes Character Stacks coexistence behavior so Special Cards "Hide Unusables" does not accidentally filter Character Stacks subdivisions.
- **Integration coverage**: `tests/integration/deck-editor-character-stacks.test.ts` verifies Character Stacks deck-editor wiring in HTML/JS (category config, Add All handler, search input, and ordering before Characters).
- **When changing Character Stacks**: update both tests above and re-run `npm run test:unit` and `npm run test:integration`.

### 🔧 Test Configuration

The tests use a separate test database (`overpower_test`) to avoid affecting your development data. The test database is automatically:
- Created before tests run
- Migrated with your schema
- Cleaned up after tests complete

### 🎯 Current Test Status

✅ **All tests passing** (62+ integration tests across 9 parallel categories)
- **Security tests**: Deck ownership, save security, role-based restrictions
- **Authentication tests**: Login/logout, guest users, password security
- **Search & Filtering tests**: Card search, stat filtering, ally search
- **Deck Core tests**: Deck building, management, navigation, editing
- **Deck Security tests**: Save validation, API security, role access
- **Game Logic tests**: Character mechanics, power cards, teamwork
- **UI/UX tests**: Clickability, editability, layout, navigation
- **User Management tests**: User creation, cross-user interactions
- **Remaining tests**: Database views, alternate cards, bug fixes

### 🚀 Next Steps

1. **Uncomment the actual API calls** in the test files when you're ready to test against your real application
2. **Add your app import** to the test files: `import app from '../../src/index';`
3. **Describe specific scenarios** you want me to write tests for
4. **Run tests regularly** as you develop new features

### 💡 Pro Tips

- Use `npm run test:watch` during development for instant feedback
- Check `coverage/` folder for detailed coverage reports
- Use `console.log()` in tests for debugging
- Tests run in isolation - each test gets a clean database state
- Use the `ApiClient` helper for consistent API testing

---

**Ready to test!** 🎉 Just describe any scenario you want tested and I'll write comprehensive tests for it!
