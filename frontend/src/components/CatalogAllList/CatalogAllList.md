# CatalogAllList



Text-only vertical list for the **All** tab on Database and Collection. No card images.



## Row layout (desktop)

CSS Grid spread across the row (`catalog-all-list__row`):



| Column | Content |

|--------|---------|

| `#` | Set number (`#` prefix, monospace, `4.5rem`) |

| Name | `cardDisplayName`; foil cards append `✦` |

| Type | `badge` with type `shortLabel` (right-aligned in column) |

| Set | `badge` with friendly set name via `setNameLookup` (left-aligned; ellipsis when long) |

| Spacer | Flexible gap before trailing controls |

| Trailing | Optional slot (Collection: `QuantityStepper`) |



The click target (`catalog-all-list__main`) spans the first four columns via subgrid.

Collection rows add `catalog-all-list__row--has-trailing` for a sixth column.



## Mobile

Two-row stack per item: `#` + name on top; type/set badges and trailing stepper on the

bottom row (`layout-mobile`).



## Props

- `items` — `{ card, catalogType }[]`

- `selectedId` — highlights open detail row

- `onSelect` — row body click (trailing slot uses `stopPropagation` via stepper wrapper)

- `renderTrailing?`, `dimmed?`
- `setNameLookup?` — `buildSetNameLookup` map for friendly set names in the Set column



## CSS

`catalog-all-list`, `catalog-all-list__row`, `catalog-all-list__row--has-trailing`,

`.is-selected`, `.is-dimmed`

