# Simulate KO Feature Documentation

## Table of Contents

1. [Overview](#overview)
2. [V1 vs V2 Parity](#v1-vs-v2-parity)
3. [User Experience](#user-experience)
4. [Code Organization](#code-organization)
5. [Implementation Details](#implementation-details)
6. [Card Types Affected](#card-types-affected)
7. [API Reference](#api-reference)
8. [Tests](#tests)
9. [Visual Design](#visual-design)
10. [Special Rules](#special-rules)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The **Simulate KO (Knock Out)** feature allows authenticated users to visually simulate character knockouts in the deck editor. When a character is marked as KO'd:

- The character card itself is visually dimmed
- Cards that become unusable due to the KO are also dimmed
- This provides visual feedback about which cards would be playable in a game scenario where characters are knocked out
- KO state is **not persisted** - it's a visual reference only for deck building

### Key Characteristics

- **Available to**: All authenticated users (GUEST, USER, ADMIN roles)
- **Persistence**: KO state is **not saved** - it's purely visual and resets when the page is refreshed
- **Multiple KO's**: Multiple characters can be KO'd simultaneously
- **Reversible**: Characters can be un-KO'd by pressing the KO button again
- **Deck Validation**: KO state does **not** affect deck validation rules

---

## V1 vs V2 Parity

Dimming **rules** are the same in both stacks; UI surfaces and a few presentation behaviors differ by design.

| Concern | V1 legacy | V2 React | Note |
|---------|-----------|----------|------|
| Dimming rules | `shouldDimCard` | `shouldDimDeckCard` | **Parity** — same game logic |
| Who can KO | `currentUser` truthy (incl. GUEST) | `Boolean(user)` (incl. GUEST) | **Parity** |
| Persistence | In-memory only | In-memory only | **Parity** |
| Deck validation | Unaffected | Unaffected | **Parity** |
| UI surfaces | Tile + Card + List + MV overflow menu | Tile grid only (desktop + mobile) | **V2 simplification** |
| KO button placement | View-mode-specific | Character tile footer before trash | See UX sections below |
| Card dimming visual | Whole card: `opacity 0.375`, `grayscale(0.4)` | Art only: `grayscale(0.7) brightness(0.55)` | **V2 UX** — footer stays readable |
| Stats panel Character max | Ignores KO state | Recalculates from active characters when any KO set | **V2 enhancement** |
| Draw Hand + KO | Integrated | Integrated in [`DrawHandPanel.tsx`](../../frontend/src/features/deck-editor/DrawHandPanel.tsx) | Uses `shouldDimDeckCard`; dimming-only refresh on KO toggle |
| Mobile entry | `deck-editor-mobile-view.js` ⋯ menu | Same `KoToggleButton` in tile footer | See v2 UX + `DeckEditorPage.md` |

There is **no HTTP API** for KO — state never leaves the browser.

---

## User Experience

### v2 React deck editor (production SPA)

Route: `/users/:userId/decks/:deckId` — [`DeckEditorPage.tsx`](../../frontend/src/features/deck-editor/DeckEditorPage.tsx).

- **KO control**: [`KoToggleButton`](../../frontend/src/features/deck-editor/KoToggleButton.tsx) on character tiles in `.deck-editor__card-footer`, **before** the trash button. Reserve stays in `.deck-editor__card-reserve-wrap` at the bottom-left of the tile.
- **Availability**: Signed-in **GUEST**, **USER**, and **ADMIN** sessions. Signed-out visitors see no KO control. Read-only shared decks: KO still available for signed-in visitors (simulation only; no deck mutation).
- **Layout**: Single grouped tile grid by catalog type (no separate Card View or List View modes).
- **Dimming**: Affected cards get `.deck-editor__card--ko-dimmed` on **art only** (`.deck-editor__card-media` filter); footer controls stay full contrast.
- **Stats header**: **Character max** row uses active (non-KO) characters when `koCharacterIds.size > 0` via `calculateActiveTeamStats`. **Icon totals** stay deck-wide.
- **Draw Hand**: [`DrawHandPanel`](../../frontend/src/features/deck-editor/DrawHandPanel.tsx) is a **top slide-out overlay** on `.deck-editor__content` (deck grid stays visible behind the blurred scrim); logic in [`drawHand.ts`](../../frontend/src/lib/decks/drawHand.ts). KO-affected drawn cards use art-only dimming via `shouldDimDeckCard` (re-renders on KO toggle without re-drawing). Full spec: [`DRAW_HAND_FEATURE.md`](DRAW_HAND_FEATURE.md).
- **Mobile**: Same tile-footer `KoToggleButton` (not the legacy DEV overflow ⋯ menu — see [DECK_EDITOR_MOBILE_VIEW.md](DECK_EDITOR_MOBILE_VIEW.md) for v1 only).

Full v2 feature notes: [`DeckEditorPage.md`](../../frontend/src/features/deck-editor/DeckEditorPage.md).

### Button interaction (both stacks)

1. **Click KO Button**: Character is marked as KO'd, button state changes to active
2. **Visual Feedback**:
   - Character card dims immediately
   - Affected cards dim based on KO logic
   - Button changes to "active" state (inverted colors)
3. **Un-KO**: Click the button again to un-KO the character
4. **Multiple Characters**: Each character can be independently KO'd or un-KO'd

### Legacy (v1) — deck contents pane

The legacy deck editor integrates KO across **three view modes** (`public/js/deck-editor-rendering.js`):

#### Legacy — Tile View (Preview View)
- **KO Button Location**: Bottom-right action area, to the left of the Reserve button
- **Visual State**:
  - Normal state: Red button with teal text "KO"
  - Active state (KO'd): Inverted red background with dark text
- **Card Dimming**: KO'd character cards and affected cards are dimmed with 37.5% opacity and grayscale filter

#### Legacy — Card View
- **KO Button Location**: Card view controls, between the "-" remove button and Reserve button
- **Button Styling**: Matches tile view but with `.card-view-btn` class for consistent sizing
- **Card Dimming**: Same visual treatment as tile view

#### Legacy — List View
- **KO Button Location**: Inline with character actions, between Reserve and "-" remove button
- **Button Styling**: Compact inline button matching list view styling
- **Card Dimming**: Same visual treatment as tile view

#### Legacy — Draw Hand pane

When the Draw Hand feature is used, cards that would be dimmed in the deck contents (due to KO'd characters) are also dimmed in the draw hand:

- **Integration**: The `displayDrawnCards` function calls `shouldDimCard` for each drawn card
- **Visual Consistency**: Uses the same `ko-dimmed` CSS class for consistent appearance
- **Real-time Updates**: Draw hand refreshes automatically when characters are KO'd or un-KO'd

#### Legacy — Mobile (DEV list)

Character rows in the mobile deck editor overflow **⋯** menu expose KO / Un-KO (`deck-editor-mobile-view.js`). See [DECK_EDITOR_MOBILE_VIEW.md](DECK_EDITOR_MOBILE_VIEW.md).

---

## Code Organization

### v2 React SPA (deck editor)

**File**: `frontend/src/lib/decks/simulateKo.ts`

Pure TypeScript port of the dimming rules (no `window` globals). React state (`koCharacterIds: Set<string>`) lives in [`DeckEditorPage.tsx`](../../../frontend/src/features/deck-editor/DeckEditorPage.tsx). UI: [`KoToggleButton.tsx`](../../../frontend/src/features/deck-editor/KoToggleButton.tsx). Unit tests: `tests/unit/simulate-ko.test.ts`.

Draw Hand integration in v2: [`DrawHandPanel.tsx`](../../../frontend/src/features/deck-editor/DrawHandPanel.tsx) + [`drawHand.ts`](../../../frontend/src/lib/decks/drawHand.ts) + [`deckCardCatalog.ts`](../../../frontend/src/lib/decks/deckCardCatalog.ts). Unit tests: `tests/unit/draw-hand-v2.test.ts`, `tests/unit/deck-card-catalog.test.ts`. Full Draw Hand spec: [`DRAW_HAND_FEATURE.md`](DRAW_HAND_FEATURE.md).

### v1 legacy module

**File**: `public/js/components/simulate-ko.js`

```
simulate-ko.js
├── Private State
│   └── koCharacters (Set<string>) - Tracks KO'd character card IDs
├── Private Functions
│   ├── init() - Initialize module state
│   ├── syncState() - Sync with window.koCharacters
│   ├── isKOd() - Check if character is KO'd
│   ├── toggleKO() - Toggle KO state
│   ├── removeCharacter() - Cleanup when character removed from deck
│   ├── getActiveCharacters() - Get non-KO'd characters with stats
│   ├── calculateActiveTeamStats() - Calculate team stats from active characters
│   ├── applyDimming() - Apply dimming to cards in deck contents
│   └── shouldDimCard() - Determine if single card should be dimmed
└── Public API (window.SimulateKO)
    ├── init()
    ├── isKOd(cardId)
    ├── toggleKOCharacter(cardId, index, renderFunctions)
    ├── applyDimming()
    ├── shouldDimCard(card, availableCardsMap, deckCards)
    ├── removeCharacter(cardId)
    ├── getActiveCharacters()
    └── calculateActiveTeamStats()
```

### Integration Points

#### `public/index.html`

**Button Rendering**:
- KO buttons are rendered in three view modes (Tile, Card, List)
- Button HTML includes active state class and onclick handlers
- Button visibility is controlled by `currentUser` check (authenticated users only)

**Wrapper Functions**:
```javascript
async function toggleKOCharacter(cardId, index) {
    await window.SimulateKO.toggleKOCharacter(cardId, index, {
        renderCardView: renderDeckCardsCardView,
        renderListView: renderDeckCardsListView,
        renderTileView: displayDeckCardsForEditing
    });
}

function applyKODimming() {
    window.SimulateKO.applyDimming();
}
```

**Draw Hand Integration**:
```javascript
// In displayDrawnCards function
if (window.SimulateKO && window.SimulateKO.shouldDimCard) {
    const shouldDim = window.SimulateKO.shouldDimCard(
        card, 
        window.availableCardsMap || new Map(), 
        window.deckEditorCards || []
    );
    if (shouldDim) {
        cardElement.classList.add('ko-dimmed');
    }
}
```

**Cleanup on Card Removal**:
```javascript
// In removeCardFromEditor function
if (removedCard && removedCard.type === 'character' && window.SimulateKO) {
    window.SimulateKO.removeCharacter(removedCard.cardId);
}
```

#### `public/css/index.css`

**KO Button Styling**:
```css
.ko-btn {
    background: rgba(255, 107, 107, 0.2);
    color: #ff6b6b;
    border: 1px solid rgba(255, 107, 107, 0.3);
    padding: 3.3px 6.6px;
    border-radius: 3.3px;
    cursor: pointer;
    font-size: 11px;
    transition: all 0.3s ease;
}

.ko-btn.active {
    background: #ff6b6b;
    color: rgba(26, 26, 46, 0.9);
    border-color: #ff6b6b;
}
```

**Dimming Styling**:
```css
.deck-card-editor-item.ko-dimmed,
.deck-card-card-view-item.ko-dimmed,
.deck-list-item.ko-dimmed,
.drawn-card.ko-dimmed {
    opacity: 0.375 !important; /* 25% more dimmed (was 0.5, now 0.375) */
    filter: grayscale(0.4);
}
```

---

## Implementation Details

Shared dimming rules apply to both stacks. State management below describes the **legacy v1** module; v2 uses `koCharacterIds: Set<string>` in React (`DeckEditorPage.tsx`) with the same logical rules in `simulateKo.ts`.

### State Management (legacy v1)

**Private State**:
- `koCharacters`: A `Set<string>` containing card IDs of KO'd characters
- Synced with `window.koCharacters` for backward compatibility

**Initialization**:
- Module initializes on page load (DOMContentLoaded or immediate)
- Creates fresh `Set` on initialization
- Copies existing state from `window.koCharacters` if present

### KO Toggle Flow

1. **User clicks KO button** → `toggleKOCharacter()` called
2. **Authentication check** → Verifies user is logged in
3. **Toggle state** → `toggleKO()` adds/removes card ID from `koCharacters` Set
4. **Sync state** → Updates `window.koCharacters` for compatibility
5. **Re-render** → Preserves current view mode and re-renders:
   - Detects view mode (Card View, List View, or Tile View)
   - Calls appropriate render function
   - Updates button states and card visibility
6. **Apply dimming** → After 100ms delay:
   - Calls `applyDimming()` for deck contents
   - Refreshes draw hand if displayed

### Dimming Logic

The dimming logic checks each card type and applies different rules:

**Character Cards**:
- Dimmed if their card ID is in `koCharacters` Set

**Special Cards**:
- Dimmed if they belong to a KO'd character (by character name matching)
- "Any Character" specials are never dimmed

**Advanced Universe Cards**:
- Dimmed if they belong to a KO'd character (by character name matching)

**Power Cards**:
- Dimmed if **no active character** can meet the power requirement
- Checks each active character's stats against the requirement
- Supports: Energy, Combat, Brute Force, Intelligence, Any-Power, Multi-Power
- **Multi-Power**: Uses sum of two highest stats (not Math.max)
- Supports both `'Multi-Power'` and `'Multi Power'` variants

**Teamwork Cards**:
- Special rule: If only one active character remains (and total > 1 with at least one KO'd), dim all teamwork cards
- Otherwise: Dimmed if team stats can't meet the `to_use` requirement
- Parses `to_use` field (e.g., "8 Intelligence", "7 Combat")

**Ally Cards**:
- Special rule: If only one active character remains (and total > 1 with at least one KO'd), dim all ally cards
- Otherwise: Dimmed if **no active character** individually meets the stat requirement
- Checks `stat_to_use` (e.g., "5 or less", "7 or higher") and `stat_type_to_use` (e.g., "Energy", "Combat")
- Checks each active character individually (not team stats)

**Training Cards**:
- Dimmed if **no active character** can use the training card
- Checks `type_1`, `type_2`, and `value_to_use` against active character stats

**Basic Universe Cards**:
- Dimmed if **no active character** meets the requirement
- Checks `type_1`, `type_2`, and `value_to_use` against active character stats

### Active Character Calculation

**`getActiveCharacters()`**:
- Filters deck cards to character type
- Excludes KO'd characters (checks `koCharacters` Set)
- Retrieves character data from `availableCardsMap`
- Returns array of character objects with stats:
  ```javascript
  {
    cardId: string,
    name: string,
    energy: number,
    combat: number,
    brute_force: number,
    intelligence: number
  }
  ```

**Special Character Overrides**:
- **John Carter**: Brute Force stat is overridden to 8 (regardless of actual stat)
- **Time Traveler**: Intelligence stat is overridden to 8 (regardless of actual stat)

### Team Stats Calculation

**`calculateActiveTeamStats()`**:
- Gets active characters (excluding KO'd)
- Calculates maximum values across all active characters:
  ```javascript
  {
    maxEnergy: number,
    maxCombat: number,
    maxBruteForce: number,
    maxIntelligence: number
  }
  ```
- Applies special character overrides (John Carter, Time Traveler)

---

## Card Types Affected

### ✅ Cards That Dim When Affected Characters Are KO'd

| Card Type | Dimming Condition |
|-----------|------------------|
| **Character** | Card itself is KO'd |
| **Special** | Belongs to KO'd character (by name) |
| **Advanced Universe** | Belongs to KO'd character (by name) |
| **Power** | No active character can meet requirement |
| **Teamwork** | Team can't meet requirement OR only one active character remains |
| **Ally** | No active character meets requirement OR only one active character remains |
| **Training** | No active character can use the training |
| **Basic Universe** | No active character meets requirement |

### ❌ Cards That Never Dim

- **Locations** - Not affected by character KO's
- **Missions** - Not affected by character KO's
- **Events** - Not affected by character KO's
- **Aspects** - Not affected by character KO's
- **"Any Character" Specials** - Usable by any character

### Special Cases

**Multi-Power Cards**:
- Requirement: Sum of character's two highest stats
- Example: Character with [8, 4, 3, 2] stats → sum(8, 4) = 12
- Uses correct calculation (not Math.max like Any-Power)

**Teamwork Cards - Single Character Rule**:
- When: Total characters > 1, at least one KO'd, only one active remains
- Action: All teamwork cards dim (regardless of stat requirements)
- Reason: Teamwork cards require multiple characters

**Ally Cards - Single Character Rule**:
- When: Total characters > 1, at least one KO'd, only one active remains
- Action: All ally cards dim (regardless of stat requirements)
- Reason: Ally cards require multiple characters

---

## API Reference

> **Note:** There is no REST/HTTP API for Simulate KO. This section documents the **legacy v1** `window.SimulateKO` global only. v2 uses pure functions in `frontend/src/lib/decks/simulateKo.ts` (see Code Organization).

### `window.SimulateKO` (legacy v1)

The public API exposed on the `window` object.

#### `init()`
Initialize the module state. Called automatically on page load.

```javascript
window.SimulateKO.init();
```

#### `isKOd(cardId: string): boolean`
Check if a character is currently KO'd.

```javascript
const isKOd = window.SimulateKO.isKOd('character-123');
```

#### `toggleKOCharacter(cardId: string, index: number, renderFunctions: Object): Promise<void>`
Toggle KO state for a character and trigger re-render.

**Parameters**:
- `cardId`: The character card ID
- `index`: The index of the character in `deckEditorCards`
- `renderFunctions`: Object with render functions:
  ```javascript
  {
    renderCardView: Function,
    renderListView: Function,
    renderTileView: Function
  }
  ```

**Example**:
```javascript
await window.SimulateKO.toggleKOCharacter('character-123', 0, {
    renderCardView: renderDeckCardsCardView,
    renderListView: renderDeckCardsListView,
    renderTileView: displayDeckCardsForEditing
});
```

#### `applyDimming(): void`
Apply dimming to cards in the deck contents pane.

```javascript
window.SimulateKO.applyDimming();
```

#### `shouldDimCard(card: Object, availableCardsMap: Map, deckCards: Array): boolean`
Determine if a single card should be dimmed.

**Parameters**:
- `card`: The card object (from `deckEditorCards`)
- `availableCardsMap`: Map of available card data
- `deckCards`: All deck cards (for context)

**Returns**: `true` if card should be dimmed, `false` otherwise

**Example**:
```javascript
const shouldDim = window.SimulateKO.shouldDimCard(
    card,
    window.availableCardsMap,
    window.deckEditorCards
);
```

#### `removeCharacter(cardId: string): void`
Remove a character from KO state (cleanup when character is removed from deck).

```javascript
window.SimulateKO.removeCharacter('character-123');
```

#### `getActiveCharacters(): Array`
Get active (non-KO'd) characters from the deck.

**Returns**: Array of character objects with stats

```javascript
const activeCharacters = window.SimulateKO.getActiveCharacters();
```

#### `calculateActiveTeamStats(): Object`
Calculate team stats from active characters.

**Returns**: Object with max stats:
```javascript
{
    maxEnergy: number,
    maxCombat: number,
    maxBruteForce: number,
    maxIntelligence: number
}
```

```javascript
const teamStats = window.SimulateKO.calculateActiveTeamStats();
```

---

## Tests

### v2 unit tests

**File**: `tests/unit/simulate-ko.test.ts`

**Module under test**: `frontend/src/lib/decks/simulateKo.ts` (`buildKoDimmingContext`, `shouldDimDeckCard`, `calculateActiveTeamStats`, `toggleKoCharacterId`, `pruneKoCharacterIds`, etc.)

**Coverage**: Character, special, power (incl. Multi-Power sum-of-two-highest), teamwork, ally, training, basic universe, single-character rule, John Carter / Time Traveler overrides, and edge cases.

**Running**:
```bash
npm run test:unit -- simulate-ko.test.ts
```

### Legacy unit tests (draw hand + KO dimming)

**Files**: `tests/unit/draw-hand-ko-dimming-character-special.test.ts`, `draw-hand-ko-dimming-teamwork-ally.test.ts`, `draw-hand-ko-dimming-power.test.ts`, `draw-hand-ko-dimming-training-universe.test.ts`, `draw-hand-ko-dimming-edge-integration.test.ts`

**Helpers**: `tests/helpers/drawHandKoDimmingTestHelpers.ts`

**Coverage**: Legacy `simulate-ko.js` + `draw-hand.js` integration — character, special, power, teamwork, ally, training, basic universe, and edge cases.

**Running**:
```bash
npm run test:unit -- draw-hand-ko-dimming
```

**v2 note**: v2 Draw Hand KO dimming is covered by `simulate-ko.test.ts` (rules) + React wiring in `DrawHandPanel.tsx`; draw logic in `draw-hand-v2.test.ts`. See [`DRAW_HAND_FEATURE.md`](DRAW_HAND_FEATURE.md).

### Integration Tests

**File**: `tests/integration/ko-feature-dimming.test.ts`

**Purpose**: Verify that decks can be properly constructed with all card types affected by KO feature

**Test Categories**:
1. **Character Card Dimming** - Creates decks with multiple characters
2. **Ra Special Cards Dimming** - Tests Ra's special cards
3. **Ra Advanced Universe Cards Dimming** - Tests Ra's advanced universe cards (8 Energy)
4. **Power Cards Dimming** - Tests high-value Energy and Multi-Power cards
5. **Teamwork Cards Dimming** - Tests teamwork cards with stat requirements and single character rule
6. **Ally Cards Dimming** - Tests ally cards with stat requirements and single character rule
7. **Training Cards Dimming** - Tests training cards
8. **Basic Universe Cards Dimming** - Tests basic universe cards
9. **Comprehensive Multi-Character Test** - Creates deck with all card types

**Running Tests**:
```bash
npm run test:integration -- ko-feature-dimming.test.ts
```

---

## Visual Design

### v2 React deck editor

See [`STYLE_GUIDE_V2.md`](../../STYLE_GUIDE_V2.md) — **Semantic (KO simulation)** tokens and **Deck Editor — Simulate KO**:

| Element | Classes / tokens |
|---------|------------------|
| KO toggle | `.deck-editor__ko-btn` — `--color-ko-soft` fill, `--color-ko` text, `--color-ko-border` border |
| KO active | `.deck-editor__ko-btn.is-active` — `--color-ko` fill, `--color-text-on-accent` label |
| KO-dimmed art | `.deck-editor__card--ko-dimmed .deck-editor__card-media` — `filter: grayscale(0.7) brightness(0.55)` |

CSS: [`DeckEditorPage.css`](../../frontend/src/features/deck-editor/DeckEditorPage.css).

### Legacy (v1)

#### KO Button

**Normal State**:
- Background: `rgba(255, 107, 107, 0.2)` (light red)
- Text Color: `#ff6b6b` (red)
- Border: `rgba(255, 107, 107, 0.3)` (red border)
- Size: `3.3px 6.6px` padding, `11px` font size
- Border Radius: `3.3px`

**Active State** (KO'd):
- Background: `#ff6b6b` (solid red)
- Text Color: `rgba(26, 26, 46, 0.9)` (dark text)
- Border: `#ff6b6b` (red border)
- Inverted color scheme for visual distinction

**Hover State**:
- Background: `rgba(255, 107, 107, 0.3)` (slightly brighter)
- Border: `rgba(255, 107, 107, 0.4)` (slightly brighter)

### Dimmed Cards (legacy)

**Visual Treatment**:
- Opacity: `0.375` (37.5% - more dimmed than previous 50%)
- Grayscale Filter: `0.4` (40% desaturated)
- Applied to: `.deck-card-editor-item`, `.deck-card-card-view-item`, `.deck-list-item`, `.drawn-card`

**Hover State**:
- Maintains same dimming level (doesn't brighten on hover)

**CSS Classes**:
- `.ko-dimmed` - Applied to cards that should be dimmed

### Button Spacing (legacy)

**Consistent Spacing**:
- All buttons in `.deck-card-editor-actions` use `gap: 0.5rem`
- KO button has no extra margin (removed `margin-left: 4px` for consistency)
- Buttons appear in order: Change Art, -1/+1, -, KO, Reserve

---

## Special Rules

### Single Character Rule

**Applies To**: Teamwork cards and Ally cards

**Condition**: 
- Total characters in deck > 1
- At least one character is KO'd
- Only one active (non-KO'd) character remains

**Action**: All teamwork/ally cards are dimmed, regardless of stat requirements

**Reasoning**: Teamwork and ally cards require multiple characters to be effective. When only one character remains active, these cards cannot be used.

**Example**:
- Deck has: Ra (8 Energy), Leonidas (8 Combat), King Arthur (8 Combat)
- Ra is KO'd → Only Leonidas and King Arthur remain active → Teamwork cards still usable
- Leonidas is also KO'd → Only King Arthur remains active → All teamwork/ally cards dim

### Multi-Power Calculation

**Rule**: Multi-Power cards require the **sum of a character's two highest stats**

**Not**: Math.max (which is used for Any-Power cards)

**Example**:
- Character stats: Energy 8, Combat 4, Brute Force 3, Intelligence 2
- Multi-Power 10: sum(8, 4) = 12 ≥ 10 ✓ Usable
- Multi-Power 13: sum(8, 4) = 12 < 13 ✗ Not usable

**Variants Supported**:
- `'Multi-Power'` (with hyphen)
- `'Multi Power'` (with space)

### Character Stat Overrides

**John Carter**:
- Brute Force stat is treated as 8 (regardless of actual stat value)
- Applied when checking power card requirements

**Time Traveler**:
- Intelligence stat is treated as 8 (regardless of actual stat value)
- Applied when checking power card requirements

---

## Troubleshooting

### v2 React deck editor

#### KO button not appearing

**Possible causes**:
1. User not signed in — `canSimulateKo = Boolean(user)` in `DeckEditorPage.tsx`
2. Card is not a character — KO only on `entry.type === 'character'`
3. Wrong route — v2 deck editor is `/users/:userId/decks/:deckId` (Vite SPA on `:5173`)

**Solution**: Confirm `user` from `AuthProvider` (including GUEST role) and character tile type.

#### KO toggles but cards do not dim

**Possible causes**:
1. `koCharacterIds` state not updating
2. Catalog card missing from `cardIndex` for a deck entry
3. Expecting whole-card dimming — v2 dims **art only** (footer stays full contrast)

**Solution**: Check React state and `buildKoDimmingContext` / `shouldDimDeckCard`; verify catalog resolution for deck cards.

#### Character max stats unchanged after KO

v2 **should** update Character max when any character is KO'd. If values look wrong, verify `koCharacterIds.size > 0` and `calculateActiveTeamStats(koCtx)`.

### Legacy (v1)

#### KO Button Not Appearing

**Possible Causes**:
1. User not logged in - KO feature requires authentication
2. Card is not a character - KO button only appears on character cards
3. View mode issue (legacy only) — check Tile, Card, or List view

**Solution**: Verify `currentUser` is set and card type is 'character'

#### KO Button Not Working

**Possible Causes**:
1. `window.SimulateKO` not initialized
2. `window.currentUser` not set
3. JavaScript error in console

**Solution**: 
- Check browser console for errors
- Verify `window.SimulateKO` exists: `console.log(window.SimulateKO)`
- Verify user is logged in: `console.log(window.currentUser)`

#### Cards Not Dimming

**Possible Causes**:
1. `applyDimming()` not called after KO toggle
2. Card type not supported for dimming
3. Card data missing from `availableCardsMap`

**Solution**:
- Check that `applyDimming()` is called after re-render
- Verify card type is in supported list
- Check `window.availableCardsMap` has card data

#### Draw Hand Not Dimming (legacy v1 only)

**Applies to**: `public/js/components/draw-hand.js` — not the v2 React `DrawHandPanel`.

**Possible Causes**:
1. `shouldDimCard` not called in `displayDrawnCards`
2. `window.SimulateKO` not available
3. Draw hand not refreshing after KO toggle

**Solution**:
- Verify `displayDrawnCards` calls `shouldDimCard` for each card
- Check that `toggleKOCharacter` refreshes draw hand if displayed
- Verify `window.SimulateKO.shouldDimCard` exists

**v2**: KO dimming in Draw Hand is automatic via React state — see [`DRAW_HAND_FEATURE.md`](DRAW_HAND_FEATURE.md).

#### Multi-Power Cards Not Dimming Correctly

**Possible Causes**:
1. Using Math.max instead of sum of two highest
2. Power type variant mismatch ('Multi-Power' vs 'Multi Power')

**Solution**:
- Verify `simulate-ko.js` uses sum calculation for Multi-Power
- Check both variants are handled in switch statement
- Test with both 'Multi-Power' and 'Multi Power' variants

---

## Related Documentation

- **v2 deck editor**: [`frontend/src/features/deck-editor/DeckEditorPage.md`](../../frontend/src/features/deck-editor/DeckEditorPage.md)
- **v2 visual tokens**: [`STYLE_GUIDE_V2.md`](../../STYLE_GUIDE_V2.md) (Simulate KO section)
- **v2 architecture**: [`FRONTEND_V2.md`](FRONTEND_V2.md)
- **Legacy style guide**: [`STYLE_GUIDE.md`](STYLE_GUIDE.md) (`.ko-btn` styling)
- **Legacy mobile DEV**: [`DECK_EDITOR_MOBILE_VIEW.md`](DECK_EDITOR_MOBILE_VIEW.md) (overflow ⋯ KO — v1 only)
- **v2 Draw Hand**: [`DRAW_HAND_FEATURE.md`](DRAW_HAND_FEATURE.md)
- **Legacy draw hand**: [`public/js/components/DRAW_HAND.md`](../../public/js/components/DRAW_HAND.md)
- **Legacy card view**: [`CARD_VIEW_DOCUMENTATION.md`](CARD_VIEW_DOCUMENTATION.md)

---

## Version History

- **v1.2** (2026-06-17): v2 Draw Hand shipped
  - Top slide-out `DrawHandPanel` + `drawHand.ts` + `deckCardCatalog.ts`
  - KO dimming integrated without re-draw; docs in [`DRAW_HAND_FEATURE.md`](DRAW_HAND_FEATURE.md)
- **v1.1** (2026-06-17): v2 documentation reconciliation
  - v2 UX, visual design, tests, and troubleshooting sections
  - V1 vs V2 parity matrix
  - GUEST availability documented for v2
- **v1.0**: Initial legacy implementation
  - KO feature available to all authenticated users
  - Multi-Power dimming logic fixed (sum of two highest stats)
  - Consistent button spacing
  - Comprehensive unit and integration tests
  - Full integration with deck contents and draw hand panes

---

## Contributors

- Feature implementation and testing
- Documentation: Auto-generated comprehensive guide; v2 reconciliation 2026-06-17

---

*Last Updated: 2026-06-17*

