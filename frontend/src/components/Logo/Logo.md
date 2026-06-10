# Logo

The Excelsior wordmark/emblem. Resolves its image via `assetUrl()`
([`lib/images/cardImages.ts`](../../lib/images/cardImages.ts)) so it loads from the CDN in
production and from local static assets in dev.

## Props
| Prop | Type | Notes |
|---|---|---|
| `height` | `number` | Render height in px (width scales). |
| `className` | `string` | Passthrough. |

## Notes
- Used in the desktop top nav and the Login hero.
- Never hardcode the asset path; the `assetUrl()` helper applies the CDN base.
