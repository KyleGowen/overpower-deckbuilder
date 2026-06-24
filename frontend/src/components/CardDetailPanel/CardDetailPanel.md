# CardDetailPanel

Slide-out panel showing full detail for a catalog card: full art, type/set/rarity/number
chips, an action slot, an Ability section, and an auto-generated Details key/value list.

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

**Any Character special flags:** `is_cataclysm`, `is_assist`, and `is_ambush` render as
**Is Cataclysm**, **Is Assist**, and **Is Ambush** only when `type === 'special-cards'`
and the linked character is **Any Character** (`cardCharacterName` + `isAnyCharacterName`).
Character-linked specials omit these rows. Logic lives in `cardDetailFields.ts`
(`shouldShowCardDetailField`).

## Landscape art frames (characters, locations, events)
- **Characters**: `.card-detail__image--characters` — `aspect-ratio: 380 / 280` (matches DB grid `CardTile`).
- **Locations & events**: `.card-detail__image--locations` / `.card-detail__image--events` — `aspect-ratio: 236 / 151` (matches DB grid `CardTile`).
- **All other types**: default portrait `.card-detail__image` — `aspect-ratio: 5 / 7`.
- Full art uses `CardImage` with `useThumbnail={false}` + `.card-image--contain`.

## Notes
- Uses `cardAbilityText` from `catalogTypeMap` so ability extraction is consistent across card types.
- Primary stats (Energy, Combat, Brute Force, Intelligence, Threat) are shown on character card art — no duplicate stat row in the slide-out.
