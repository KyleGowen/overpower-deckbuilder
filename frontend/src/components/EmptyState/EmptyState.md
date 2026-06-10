# EmptyState

Friendly placeholder for empty/error results: icon, title, message, and an optional action.

## Props
| Prop | Type | Notes |
|---|---|---|
| `title` | `string` | Headline (e.g. "No decks yet"). |
| `message` | `string` | Supporting copy. |
| `icon` | `ReactNode` | Leading glyph. |
| `action` | `ReactNode` | Optional CTA (e.g. a "New Deck" button). |
| `variant` | `'default' \| 'error'` | `error` tints for failure states. |

## Notes
- Used for no-results, no-decks, no-owned-cards, and load-error states across pages.
