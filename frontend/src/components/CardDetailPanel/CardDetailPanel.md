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
| `hasFoil` | `boolean` | When set, renders **Has Foil** Yes/No in Details (foil variant exists). |
| `isFoil` | `boolean` | When set, renders **Is Foil** Yes/No in Details (this row is a foil printing). |
| `setDisplayName` | `string` | Friendly set name for the **Set** Details row (falls back to `card.set` code when omitted). |

## Details list
Auto-built from the card's own fields, minus a `HIDDEN_FIELDS` set (ids, image paths,
stats, ability/effect fields, timestamps, `is_foil`, `threat_level`, `set`). Keys are humanized
(`set_number` → "Set Number"); booleans render Yes/No; arrays join with commas; empty
values are skipped. Pass `hasFoil` to show foil availability from the foil-card map.

## Character-specific layout
- Art frame uses `.card-detail__image--landscape` (`aspect-ratio: 380 / 280`) instead of portrait `5 / 7`.
- The fifth stat tile shows gray **Threat** (`threat_level`) instead of purple **Total**.

## Notes
- Uses `cardStats` / `cardAbilityText` from `catalogTypeMap` so stat/ability extraction is
  consistent across card types.
- Full art uses `CardImage` with `useThumbnail={false}` + `.card-image--contain`.
