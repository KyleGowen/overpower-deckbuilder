# LegalityErrorsPopover

Wraps a legality badge/trigger and surfaces deck validation error messages, either as a
hover/focus tooltip or a persistent inline list.

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `errors` | `string[]` | – | Validation messages. When empty, renders `children` unchanged (no wrapper). |
| `inline` | `boolean` | `false` | `true` = always-visible panel under the trigger (`role="note"`); `false` = hover/focus tooltip (`role="tooltip"`). |
| `children` | `ReactNode` | – | The trigger (e.g. the legality badge). |

## Notes
- Tooltip mode: the wrapper is focusable (`tabIndex={0}`, `aria-describedby` the list) and
  opens on `mouseenter`/`focus`, closes on `mouseleave`/`blur` (blur ignores focus moving to a
  child via `relatedTarget`). Open state toggles `.legality-errors-popover--open`.
- List id is generated with `useId()` so multiple instances stay isolated.
- Styling in [`LegalityErrorsPopover.css`](./LegalityErrorsPopover.css); the popover panel must
  layer above page content (z-index 9999 per the global popup rule). See
  [`.cursorrules`](./.cursorrules).
