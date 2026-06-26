# StatIconBadge

Reusable badge: power-type or threat PNG with a **bold black number** centered on top (character-card style).

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | `StatIconType` | – | `energy`, `combat`, `brute_force`, `intelligence`, `threat_level` |
| `value` | `number \| string` | – | Displayed on the icon (e.g. `6`, `74`) — always a single number for threat |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | `sm` = 18×18 (meta bar threat); `md` = 32×32 (deck tile stat row); `lg` = 40×40 (deck editor header) |
| `title` | `string` | – | Tooltip and `aria-label`; defaults to `{label}: {value}`. Threat uses `formatThreatTooltip()` for `74/76` when over cap |
| `className` | `string` | – | Extra class on root `.stat-icon-badge` |

## CSS

- Root: `.stat-icon-badge`, size modifiers
- Icon: `.stat-icon-badge__icon` — **130%** of container width/height (PNG larger than box so numerals sit in the center disc; overlay font sized separately)
- Overlay value: `.stat-icon-badge__value` — `font-family: var(--font-stat-value)` (Poppins 800, bundled via `@fontsource/poppins/800`); `font-weight: 800`; single-digit font sized to fill the disc per size (`8px` `sm`, `13px` `md`, `16px` `lg`); all values shifted down slightly (`translateY` **1px** `sm`, **2px** `md`, **2px** `lg`); `letter-spacing: -0.02em`; `font-variant-numeric: tabular-nums`; black, centered, no glow
- Double+ digits: `.stat-icon-badge__value--wide` keeps the single-digit font size and adds `transform: scaleX(0.7)` (with the size's `translateY`) so values like `10` / `13` / `79` stay tall and fill the round disc like the card art (no font shrink)

## Usage

- **Deck tiles** (`DeckTile`): threat in meta bar (`sm`); character max primaries in stats row (`md`)
- **Deck editor header** (`DeckEditorPage`): threat, character max, and icon totals — all `StatIconBadge` `lg` (40×40, 2× `sm`)
- Icon paths from [`statIconTypes.ts`](../../lib/icons/statIconTypes.ts) via `assetUrl()`

## Helpers

- `buildStatIconBadgeLabel(type, value)` — `{label}: {value}` for `aria-label` / tests (exported from `statIconTypes.ts`)
