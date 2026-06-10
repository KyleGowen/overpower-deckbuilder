# CardDetailPanel

Slide-out panel showing full detail for a catalog card: full art, type/set/rarity/number
chips, an action slot, the color-coded stat row (+ total), an Ability section, and an
auto-generated Details key/value list.

## Props
| Prop | Type | Notes |
|---|---|---|
| `card` | `CatalogCard \| null` | The card; renders nothing when null. |
| `type` | `CatalogType \| null` | Drives the type label. |
| `open` | `boolean` | Visibility (wraps `SlideOutPanel`). |
| `onClose` | `() => void` | Close handler. |
| `actions` | `ReactNode` | Action area under the header (e.g. Add to Deck button, or a collection `QuantityStepper`). |

## Details list
Auto-built from the card's own fields, minus a `HIDDEN_FIELDS` set (ids, image paths,
stats, ability/effect fields, timestamps). Keys are humanized (`set_number` → "Set Number",
`is_foil` → "Is Foil"); booleans render Yes/No; arrays join with commas; empty values are
skipped.

## Notes
- Uses `cardStats` / `cardAbilityText` from `catalogTypeMap` so stat/ability extraction is
  consistent across card types.
- Full art uses `CardImage` with `useThumbnail={false}` + `.card-image--contain`.
