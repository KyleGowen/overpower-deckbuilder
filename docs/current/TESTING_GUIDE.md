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
