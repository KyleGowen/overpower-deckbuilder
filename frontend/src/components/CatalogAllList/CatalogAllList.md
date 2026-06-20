# CatalogAllList

Text-only vertical list for the **All** tab on Database and Collection. No card images.

## Row layout (desktop)

CSS Grid spread across the row (`catalog-all-list__row`):

| Column | Content |
|--------|---------|
| `#` | Set number (`#` prefix, monospace, `4.5rem`) |
| Name | `cardDisplayName` (or `formatName`); foil cards append `✦` |
| Type | `badge` with type `shortLabel` (right-aligned in column) |
| Set | `badge` with friendly set name via `setNameLookup` (left-aligned; ellipsis when long) |
| Spacer | Flexible gap before trailing controls |
| Trailing | Optional slot (Collection: `QuantityStepper`) |

**Collection** (`typeBetweenNumberAndName`): `#` → type → name → set. Fixed-width scan
columns (`--catalog-all-num-width`, `--catalog-all-type-width`) keep names aligned for
skimming; `#` uses tabular numerals.

The click target (`catalog-all-list__main`) spans the first four columns via subgrid.

Collection rows add `catalog-all-list__row--has-trailing` for a sixth column.

## Mobile

Default (`layout-mobile`):

- **Row 1:** set **code** (monospace) + `#` + name; trailing stepper pinned right when present.
- **Row 2:** type badge only (friendly set name hidden; set code `title` holds full name when known).

Collection (`catalog-all-list--type-after-number`):

- **Row 1:** set code + `#` + type + name (+ stepper); single row, fixed scan-band widths.
- `compactTypeLabels`: mobile uses 3-letter type abbreviations (`Spc`, `Chr`, …); `title` holds full label.

## Props

- `items` — `{ card, catalogType }[]`
- `selectedId` — highlights open detail row
- `onSelect` — row body click (trailing slot uses `stopPropagation` via stepper wrapper)
- `renderTrailing?`, `dimmed?`
- `setNameLookup?` — `buildSetNameLookup` map for friendly set names in the Set column
- `formatName?` — optional row label formatter (default: `cardDisplayName`)
- `typeBetweenNumberAndName?` — Collection All: type badge between `#` and name (default: name then type)
- `compactTypeLabels?` — use `compactLabel` abbreviations for type badge (Collection All mobile)

## CSS

`catalog-all-list`, `catalog-all-list--type-after-number`, `catalog-all-list__row`,
`catalog-all-list__row--has-trailing`, `catalog-all-list__set-code`, `catalog-all-list__set-badge`,
`.is-selected`, `.is-dimmed`
