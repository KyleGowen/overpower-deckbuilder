# StatIconBadge

Reusable badge: power-type or threat PNG with a **bold black number** centered on top (character-card style).

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | `StatIconType` | – | `energy`, `combat`, `brute_force`, `intelligence`, `threat_level` |
| `value` | `number \| string` | – | Displayed on the icon (e.g. `6`, `74`, or `74/76`) |
| `size` | `'sm' \| 'md'` | `'md'` | `sm` = 18×18 (meta bar threat); `md` = 32×32 (deck stat row) |
| `title` | `string` | – | Tooltip; defaults to `{label}: {value}` |
| `className` | `string` | – | Extra class on root `.stat-icon-badge` |

## CSS

- Root: `.stat-icon-badge`, size modifiers `.stat-icon-badge--sm`, `.stat-icon-badge--md` (`overflow: visible`)
- Icon: `.stat-icon-badge__icon` — **110%** of container width/height (PNG 10% larger; overlay numbers stay same font size)
- Overlay value: `.stat-icon-badge__value` (black, centered); `.stat-icon-badge__value--wide` for 2+ characters at `sm`

## Usage

- **Deck tiles** (`DeckTile`): threat in meta bar (`sm`); character max primaries in stats row (`md`)
- Icon paths from [`statIconTypes.ts`](../../lib/icons/statIconTypes.ts) via `assetUrl()`

## Helpers

- `buildStatIconBadgeLabel(type, value)` — `{label}: {value}` for `aria-label` / tests (exported from `statIconTypes.ts`)
