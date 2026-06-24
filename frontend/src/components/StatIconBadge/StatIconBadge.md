# StatIconBadge

Reusable badge: power-type or threat PNG with a **bold black number** centered on top (character-card style).

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | `StatIconType` | – | `energy`, `combat`, `brute_force`, `intelligence`, `threat_level` |
| `value` | `number \| string` | – | Displayed on the icon (e.g. `6`, `74`) — always a single number for threat |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | `sm` = 18×18 (meta bar threat); `md` = 32×32 (deck tile stat row); `lg` = 36×36 (deck editor header) |
| `title` | `string` | – | Tooltip and `aria-label`; defaults to `{label}: {value}`. Threat uses `formatThreatTooltip()` for `74/76` when over cap |
| `className` | `string` | – | Extra class on root `.stat-icon-badge` |

## CSS

- Root: `.stat-icon-badge`, size modifiers; `.stat-icon-badge--lighter-value-glow` for `combat` / `brute_force`; `.stat-icon-badge--stronger-value-glow` for `energy`
- Icon: `.stat-icon-badge__icon` — **110%** of container width/height (PNG 10% larger; overlay numbers stay same font size)
- Value halo: `.stat-icon-badge__value-halo` — soft semi-transparent white radial glow behind the number (always rendered)
- Overlay value: `.stat-icon-badge__value` (black, centered, light white text-shadow); `.stat-icon-badge__value--wide` for 2+ characters at `sm`

## Usage

- **Deck tiles** (`DeckTile`): threat in meta bar (`sm`); character max primaries in stats row (`md`)
- **Deck editor header** (`DeckEditorPage`): threat, character max, and icon totals — all `StatIconBadge` `lg` (36×36, 2× `sm`)
- Icon paths from [`statIconTypes.ts`](../../lib/icons/statIconTypes.ts) via `assetUrl()`

## Helpers

- `buildStatIconBadgeLabel(type, value)` — `{label}: {value}` for `aria-label` / tests (exported from `statIconTypes.ts`)
