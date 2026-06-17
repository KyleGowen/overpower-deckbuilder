# Draw Hand Feature Documentation

## Table of Contents

1. [Overview](#overview)
2. [V1 vs V2 Parity](#v1-vs-v2-parity)
3. [User Experience](#user-experience)
4. [Code Organization](#code-organization)
5. [Draw Rules](#draw-rules)
6. [Catalog Resolution](#catalog-resolution)
7. [Tests](#tests)
8. [Visual Design](#visual-design)
9. [Simulate KO Integration](#simulate-ko-integration)
10. [Troubleshooting](#troubleshooting)
11. [Related Documentation](#related-documentation)

---

## Overview

**Draw Hand** simulates drawing a random opening hand from a deck. It excludes characters, locations, and missions from the draw pile, draws **8** playable cards by default, and may draw a **9th** when an event is in the first eight and the pile has more than eight cards.

### Key characteristics

| Property | Value |
|----------|--------|
| **Persistence** | None — in-memory only; resets on close or page refresh |
| **Availability** | All visitors (signed-out read-only decks included) when the deck has **≥8 playable** cards |
| **KO interaction** | Drawn cards dim when Simulate KO makes them unusable (no re-randomize on KO toggle) |
| **Pre-placed / `exclude_from_draw`** | Rows count toward the 8-card enable threshold but are **omitted** from the draw pile |
| **HTTP API** | None — client-only |

---

## V1 vs V2 Parity

| Concern | V1 legacy | V2 React | Note |
|---------|-----------|----------|------|
| Draw rules | `draw-hand.js` | `drawHand.ts` | **Parity** — 8 cards, 9th on event, pile exclusions |
| Enable threshold | ≥8 playable | `canDrawHand()` | **Parity** |
| `exclude_from_draw` | Supported | Supported | **Parity** |
| Entry control | `#drawHandBtn` in utility row | **Draw Hand** in `.deck-editor__actions` | Playtest placeholder removed in v2 |
| Panel UX | Replaces deck contents / mobile vertical fan | **Top slide-out overlay** — grid stays visible behind blur | **V2 UX** |
| Desktop layout | Grid or horizontal row by viewport | Single row, **210px** portrait slots, scale-to-fit | **V2 UX** |
| Mobile layout | Vertical accordion fan + thumb-drag | **Horizontal snap carousel**, **165px** slots | **V2 UX** |
| Event rotation | 90° CCW in portrait slot | Same — `.draw-hand__event-rotate` | **Parity** |
| Drag reorder | Desktop fine pointer | Desktop fine pointer only | **Parity** |
| KO dimming | `ko-dimmed` on whole card | Art-only `.deck-editor__card--ko-dimmed` | Matches v2 KO presentation |
| KO refresh | `DrawHand.refresh()` re-renders | React re-render on `koCharacterIds` change | **Parity** intent |
| Card names / art | `availableCardsMap` + `getCardImagePath` | `deckCardCatalog.ts` + `CardImage` | v2 normalizes underscore deck types |
| Card detail | Legacy hover / modal patterns | `CardDetailPanel` on tile click | **V2** |

---

## User Experience

### v2 React deck editor (production SPA)

Route: `/users/:userId/decks/:deckId` — [`DeckEditorPage.tsx`](../../frontend/src/features/deck-editor/DeckEditorPage.tsx).

1. **Draw Hand** button in the sticky header (`.deck-editor__actions`). Disabled with tooltip when playable count &lt; 8.
2. First click **opens** the panel and draws; button gets `.is-active`. Second click, **×**, or backdrop **closes** and clears the hand.
3. **Drawn hand** panel slides down from the top (`SlideOutPanel` `side="top"`, `position="absolute"`). Deck grid remains visible behind the shared blurred scrim.
4. **Desktop**: one horizontal row of 8–9 cards at deck-editor portrait width; `ResizeObserver` scales the row to fit. Drag-and-drop reorder on fine pointers.
5. **Mobile** (`.layout-mobile`): horizontal scroll with `scroll-snap-type: x mandatory`; no uniform scale-down.
6. **Events** display landscape art rotated 90° CCW inside the portrait slot (draw-hand only).
7. **Draw again** in the panel footer redraws without closing.
8. Tapping a drawn card opens **CardDetailPanel** when catalog data resolves.

Full feature notes: [`DeckEditorPage.md`](../../frontend/src/features/deck-editor/DeckEditorPage.md).

### Legacy v1 deck editor

- **Desktop**: `#drawHandSection` replaces deck contents; horizontal card row.
- **Mobile** (`layout-mobile`): vertical fan accordion — see [STYLE_GUIDE.md § Draw Hand mobile (legacy v1)](STYLE_GUIDE.md#draw-hand-mobile-legacy-v1-layout-mobile) and [`public/js/components/DRAW_HAND.md`](../../public/js/components/DRAW_HAND.md).
- **Entry**: `#drawHandBtn` in deck editor utility actions (or hamburger menu on mobile DEV).

---

## Code Organization

### v2 React SPA

| File | Role |
|------|------|
| [`DeckEditorPage.tsx`](../../frontend/src/features/deck-editor/DeckEditorPage.tsx) | `drawHandOpen`, `drawnCards`, toggle/redraw/reorder handlers |
| [`drawHand.ts`](../../frontend/src/lib/decks/drawHand.ts) | `countPlayableCards`, `canDrawHand`, `buildDrawPile`, `drawRandomHand` |
| [`DrawHandPanel.tsx`](../../frontend/src/features/deck-editor/DrawHandPanel.tsx) | Top overlay UI, KO dimming, card detail wiring |
| [`DrawHandPanel.css`](../../frontend/src/features/deck-editor/DrawHandPanel.css) | Row, scale, event rotation, mobile carousel |
| [`useDrawHandScale.ts`](../../frontend/src/features/deck-editor/useDrawHandScale.ts) | Desktop `ResizeObserver` scale |
| [`deckCardCatalog.ts`](../../frontend/src/lib/decks/deckCardCatalog.ts) | Catalog index build + `resolveDeckCatalogCard`, `deckCardDisplayName` |
| [`CardImage`](../../frontend/src/components/CardImage/CardImage.tsx) | Thumb → full-res fallback; `onImageFailed` for missing-art label |
| [`SlideOutPanel`](../../frontend/src/components/SlideOutPanel/SlideOutPanel.tsx) | `side="top"`, `position="absolute"` overlay |

### v1 legacy

| File | Role |
|------|------|
| [`public/js/components/draw-hand.js`](../../public/js/components/draw-hand.js) | Module + `window.DrawHand` API |
| [`public/css/draw-hand.css`](../../public/css/draw-hand.css) | Desktop row + shared card chrome |
| [`public/css/deck-editor-mobile.css`](../../public/css/deck-editor-mobile.css) | Mobile vertical fan |

---

## Draw Rules

Implemented in [`drawHand.ts`](../../frontend/src/lib/decks/drawHand.ts) (ports legacy `draw-hand.js`).

**Non-playable types** (never in pile): `character`, `location`, `mission`.

**Playable types**: power, special, event, aspect, advanced-universe, teamwork, ally-universe, training, basic-universe (and legacy underscore variants in deck rows).

**Pile construction**: one pile slot per physical copy (`quantity` expanded); skips `exclude_from_draw === true`.

**Draw algorithm**:
1. Pick up to **8** unique random pile indices.
2. If any drawn card is an **event** and the pile has **>8** cards and fewer than **9** drawn, attempt one more unique draw.

---

## Catalog Resolution

Deck rows from `GET /decks/:id/full` carry only `{ type, cardId, quantity }` — no `name` or `image`. Draw Hand resolves display data from the catalog index built in `DeckEditorPage`.

[`deckCardCatalog.ts`](../../frontend/src/lib/decks/deckCardCatalog.ts):

- **`normalizeDeckCardType`** — `ally_universe` → `ally-universe`, etc.
- **`buildDeckCardIndex`** — keys: `` `${normalizedType}:${id}` ``, raw type alias, and **`cardId` alone** (UUID fallback).
- **`resolveDeckCatalogCard`** — tries normalized key, raw key, then id-only.
- **`deckCardDisplayName`** — `entry.name` → catalog name → `Unknown {Type} card` (never generic `"Card"`).

**Images**: `entry.defaultImage` (alternate art on instance) → `imagePathFromCard(catalog)` → `CardImage` with deck-grid thumbnail policy (thumbs except locations/events; thumb failure falls back to full-res).

**Missing art**: `.draw-hand__missing-art` shows the resolved card name under the tile; `title` / `aria-label` on the image button match.

---

## Tests

### v2 unit tests

| File | Coverage |
|------|----------|
| `tests/unit/draw-hand-v2.test.ts` | Pile build, enable threshold, 8/9 draw logic |
| `tests/unit/deck-card-catalog.test.ts` | Type normalization, index lookup, display names |
| `tests/unit/simulate-ko.test.ts` | KO dimming rules (shared with draw hand via `shouldDimDeckCard`) |

```bash
npm run test:unit -- draw-hand-v2.test.ts deck-card-catalog.test.ts simulate-ko.test.ts
```

### Legacy unit tests

| Files | Coverage |
|-------|----------|
| `tests/unit/draw-hand-module.test.ts` | Legacy module API |
| `tests/unit/draw-hand-ui-wrappers.test.ts` | UI wrappers |
| `tests/unit/draw-hand-ko-integration.test.ts` | Legacy KO hook |
| `tests/unit/draw-hand-ko-dimming-*.test.ts` (5 files) | Legacy dimming per card type — helpers in `tests/helpers/drawHandKoDimmingTestHelpers.ts` |

---

## Visual Design

### v2 tokens

See [`STYLE_GUIDE_V2.md`](../../STYLE_GUIDE_V2.md) — **Deck Editor — Draw Hand** and [`STYLE_GUIDE.md`](STYLE_GUIDE.md) — **Deck Editor Draw Hand (v2 SPA)**.

Summary:

| Element | Spec |
|---------|------|
| Trigger | `.deck-editor__actions .btn-ghost`; `.is-active` when open (accent border/background) |
| Panel | `.draw-hand-slideout` on `SlideOutPanel`; `max-height: 70vh` desktop, `55vh` mobile |
| Card width | `--deck-editor-portrait-col`: **210px** desktop, **165px** mobile |
| Row scale | `--draw-hand-scale` via `useDrawHandScale` (desktop only) |
| Event rotate | `.draw-hand__event-rotate` — `rotate(-90deg)` inside portrait slot |
| Missing art | `.draw-hand__missing-art` — `font-size-xs`, muted, ellipsis |
| Redraw | `.draw-hand__redraw` — centered footer, `min-width: 140px` |

### Legacy mobile fan

v1 only — [`STYLE_GUIDE.md` § Draw Hand mobile (legacy v1)](STYLE_GUIDE.md#draw-hand-mobile-layout-mobile).

---

## Simulate KO Integration

When **Simulate KO** marks characters as knocked out, drawn cards that would be unusable in the main grid are dimmed in the hand:

- **Logic**: `shouldDimDeckCard(entry, catalogCard, koCtx)` from [`simulateKo.ts`](../../frontend/src/lib/decks/simulateKo.ts).
- **Presentation**: `.deck-editor__card--ko-dimmed` on `.deck-editor__card-media` (art only).
- **Refresh**: `drawHandKoCtx` is recomputed when `koCharacterIds` changes; the hand is **not** re-randomized.

Full KO spec: [`SIMULATE_KO_FEATURE.md`](SIMULATE_KO_FEATURE.md).

---

## Troubleshooting

### v2 — tooltip or label says "Unknown … card"

Catalog lookup failed for that `type` + `cardId`. Check:

1. Deck row `type` — underscore universe types should normalize (if not, file a bug).
2. `cardId` matches catalog `id` (stale/orphan deck row).
3. Catalog query for that type still loading (rare race on first paint).

### v2 — grey placeholder image

1. Confirm the same card in the **deck grid** — if grid art loads, draw hand should too (shared `CardImage` + catalog).
2. Check network for thumbnail vs full-res 404.
3. Read `.draw-hand__missing-art` under the tile for the card name.

### v2 — Draw Hand button disabled

Deck has fewer than **8 playable** cards (characters/locations/missions do not count; `exclude_from_draw` rows **do** count toward the threshold).

### Legacy v1 — Draw Hand not dimming with KO

See [`SIMULATE_KO_FEATURE.md` § Troubleshooting](SIMULATE_KO_FEATURE.md#troubleshooting) (legacy `displayDrawnCards` / `DrawHand.refresh()`).

---

## Related Documentation

- **v2 deck editor**: [`frontend/src/features/deck-editor/DeckEditorPage.md`](../../frontend/src/features/deck-editor/DeckEditorPage.md)
- **v2 KO**: [`SIMULATE_KO_FEATURE.md`](SIMULATE_KO_FEATURE.md)
- **v2 architecture**: [`FRONTEND_V2.md`](FRONTEND_V2.md)
- **v2 visual tokens**: [`STYLE_GUIDE_V2.md`](../../STYLE_GUIDE_V2.md)
- **Legacy module**: [`public/js/components/DRAW_HAND.md`](../../public/js/components/DRAW_HAND.md)
- **Legacy mobile DEV**: [`DECK_EDITOR_MOBILE_VIEW.md`](DECK_EDITOR_MOBILE_VIEW.md)

---

*Last updated: 2026-06-17*
