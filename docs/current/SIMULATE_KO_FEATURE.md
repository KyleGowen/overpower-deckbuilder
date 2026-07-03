# Simulate KO Feature Documentation

## Table of Contents

1. [Overview](#overview)
2. [User Experience](#user-experience)
3. [Code Organization](#code-organization)
4. [Implementation Details](#implementation-details)
5. [Card Types Affected](#card-types-affected)
6. [Tests](#tests)
7. [Visual Design](#visual-design)
8. [Special Rules](#special-rules)
9. [Troubleshooting](#troubleshooting)
10. [Related Documentation](#related-documentation)

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
- **HTTP API**: None — client-only

---

## User Experience

Route: `/users/:userId/decks/:deckId` — [`DeckEditorPage.tsx`](../../frontend/src/features/deck-editor/DeckEditorPage.tsx).

- **KO control**: [`KoToggleButton`](../../frontend/src/features/deck-editor/KoToggleButton.tsx) on character tiles in `.deck-editor__card-footer`, **before** the trash button. Reserve stays in `.deck-editor__card-reserve-wrap` at the bottom-left of the tile.
- **Availability**: Signed-in **GUEST**, **USER**, and **ADMIN** sessions. Signed-out visitors see no KO control. Read-only shared decks: KO still available for signed-in visitors (simulation only; no deck mutation).
- **Layout**: Single grouped tile grid by catalog type.
- **Dimming**: Affected cards get `.deck-editor__card--ko-dimmed` on **art only** (`.deck-editor__card-media` filter); footer controls stay full contrast.
- **Stats header**: **Character max** row uses active (non-KO) characters when `koCharacterIds.size > 0` via `calculateActiveTeamStats`. **Icon totals** stay deck-wide.
- **Draw Hand**: [`DrawHandPanel`](../../frontend/src/features/deck-editor/DrawHandPanel.tsx) dims KO-affected drawn cards via `shouldDimDeckCard` (re-renders on KO toggle without re-drawing). Full spec: [`DRAW_HAND_FEATURE.md`](DRAW_HAND_FEATURE.md).
- **Mobile**: Same tile-footer `KoToggleButton` (not a separate overflow menu).

### Button interaction

1. **Click KO Button**: Character is marked as KO'd, button state changes to active
2. **Visual Feedback**: Character and affected cards dim; button inverts colors
3. **Un-KO**: Click the button again to un-KO the character
4. **Multiple Characters**: Each character can be independently KO'd or un-KO'd

Full feature notes: [`DeckEditorPage.md`](../../frontend/src/features/deck-editor/DeckEditorPage.md).

---

## Code Organization

| File | Role |
|------|------|
| [`simulateKo.ts`](../../frontend/src/lib/decks/simulateKo.ts) | Pure dimming rules (`shouldDimDeckCard`, `buildKoDimmingContext`, `calculateActiveTeamStats`, etc.) |
| [`DeckEditorPage.tsx`](../../frontend/src/features/deck-editor/DeckEditorPage.tsx) | React state `koCharacterIds: Set<string>` |
| [`KoToggleButton.tsx`](../../frontend/src/features/deck-editor/KoToggleButton.tsx) | Character tile KO control |
| [`DrawHandPanel.tsx`](../../frontend/src/features/deck-editor/DrawHandPanel.tsx) | Draw Hand KO dimming integration |

Unit tests: `tests/unit/simulate-ko.test.ts`.

---

## Implementation Details

State: `koCharacterIds: Set<string>` in React (`DeckEditorPage.tsx`).

**KO toggle flow:**
1. User clicks KO → update `koCharacterIds`
2. Re-render deck grid and open Draw Hand panel (if any)
3. `shouldDimDeckCard` applied per card

**Dimming logic** (in `simulateKo.ts`):

- **Characters**: dimmed if card ID is in `koCharacterIds`
- **Special / Advanced Universe**: dimmed if they belong to a KO'd character (by name); "Any Character" specials never dim
- **Power**: dimmed if no active character meets requirement (Any-Power = max of four; Multi-Power = sum of two highest)
- **Teamwork / Ally**: team stat rules + single-character rule when only one active remains
- **Training / Basic Universe**: dimmed if no active character can use the card

**Special character overrides:** John Carter (Brute Force treated as 8), Time Traveler (Intelligence treated as 8).

---

## Card Types Affected

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

**Never dim:** Locations, Missions, Events, Aspects, "Any Character" specials.

---

## Tests

**File**: `tests/unit/simulate-ko.test.ts`

**Coverage**: Character, special, power (incl. Multi-Power sum-of-two-highest), teamwork, ally, training, basic universe, single-character rule, John Carter / Time Traveler overrides, and edge cases.

```bash
npm run test:unit -- simulate-ko.test.ts
```

**Integration**: `tests/integration/ko-feature-dimming.test.ts` — deck construction with all card types affected by KO.

---

## Visual Design

See [`STYLE_GUIDE_V2.md`](../../STYLE_GUIDE_V2.md) — **Deck Editor — Simulate KO**:

| Element | Classes / tokens |
|---------|------------------|
| KO toggle | `.deck-editor__ko-btn` — `--color-ko-soft` fill, `--color-ko` text, `--color-ko-border` border |
| KO active | `.deck-editor__ko-btn.is-active` — `--color-ko` fill, `--color-text-on-accent` label |
| KO-dimmed art | `.deck-editor__card--ko-dimmed .deck-editor__card-media` — `filter: grayscale(0.7) brightness(0.55)` |

CSS: [`DeckEditorPage.css`](../../frontend/src/features/deck-editor/DeckEditorPage.css).

---

## Special Rules

### Single Character Rule

When total characters > 1, at least one is KO'd, and only one active remains: all teamwork and ally cards dim.

### Multi-Power Calculation

Multi-Power requires the **sum of a character's two highest stats** (not Math.max). Supports `'Multi-Power'` and `'Multi Power'` variants.

### Character Stat Overrides

- **John Carter**: Brute Force treated as 8
- **Time Traveler**: Intelligence treated as 8

---

## Troubleshooting

### KO button not appearing

1. User not signed in — `canSimulateKo = Boolean(user)` in `DeckEditorPage.tsx`
2. Card is not a character
3. Wrong route — use `/users/:userId/decks/:deckId` on `:5173`

### KO toggles but cards do not dim

1. `koCharacterIds` state not updating
2. Catalog card missing from `cardIndex`
3. v2 dims **art only** — footer stays full contrast

### Character max stats unchanged after KO

Verify `koCharacterIds.size > 0` and `calculateActiveTeamStats(koCtx)`.

### Draw Hand not dimming with KO

KO dimming in Draw Hand is automatic via React state — see [`DRAW_HAND_FEATURE.md`](DRAW_HAND_FEATURE.md).

---

## Related Documentation

- **Deck editor**: [`frontend/src/features/deck-editor/DeckEditorPage.md`](../../frontend/src/features/deck-editor/DeckEditorPage.md)
- **Visual tokens**: [`STYLE_GUIDE_V2.md`](../../STYLE_GUIDE_V2.md)
- **Architecture**: [`FRONTEND_V2.md`](FRONTEND_V2.md)
- **Draw Hand**: [`DRAW_HAND_FEATURE.md`](DRAW_HAND_FEATURE.md)

---

*Last Updated: 2026-07-02*
