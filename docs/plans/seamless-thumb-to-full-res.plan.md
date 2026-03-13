# Seamless Thumbnail-to-Full-Res Transition (No Flash)

## Problem

Deck editor card-view tiles use **progressive loading**: the initial `img` shows a low-res thumbnail, then when the full-res image finishes loading, the code sets `img.src = fullRes`. Replacing `src` on the same element causes the browser to clear and repaint, producing a noticeable **flash**.

**Current flow:** [deck-editor-rendering.js](public/js/deck-editor-rendering.js) — `initDeckEditorCardViewProgressiveLoad()` finds `.card-view-image[data-full-res]`, preloads full-res in a temporary `Image()`, and on `onload` does `img.src = fullRes` (lines 37–42). Same pattern is used in [card-hover-modal.js](public/js/card-hover-modal.js) for the hover modal (thumbnail first, then `image.src = fullResPath` on load).

## Industry best practices (research summary)

- **Two-layer / overlay approach:** Keep the thumbnail visible and never change its `src`. Load the full-res image in a **second** element (or layer) positioned on top. When full-res is ready, set that layer's `src` (from cache) and **fade it in** (opacity 0 → 1). The thumbnail remains underneath until the full-res is painted — no blank frame.
- **Blur-up:** Same idea; the bottom layer can be a tiny blurred placeholder. We already have sharp thumbnails, so a simple fade of the full-res layer on top is sufficient.
- **Avoid single-element src swap:** Directly changing `img.src` on the same element is what causes the flash; CSS transitions on that same element do not prevent one frame of clear/repaint in many browsers.
- **References:** Medium, Unsplash, Next.js, and CSS-Tricks "Blur Up" / LQIP techniques all use a second layer and fade-in for the high-res image.

## Recommended approach: two-layer fade-in

Use a **stacked dual-image** pattern only where we actually do thumb → full-res (character, location, mission in deck card-view, and optionally the hover modal):

1. **Thumbnail layer:** Stays as the first (bottom) image; `src` never changes.
2. **Full-res layer:** Second `img` on top, same size, initially `opacity: 0` and no `src` (or empty). When the preloaded full-res fires `onload`, set this layer's `src` to the full-res URL (already in cache) and add a class that transitions opacity to 1. Thumbnail remains visible until full-res has painted.

No change to card types that don't use thumbnails (e.g. special, power): they continue to use a single `img` with full-res only.

---

## Implementation plan

### 1. Deck editor card-view (main fix)

**File:** [public/js/deck-editor-rendering.js](public/js/deck-editor-rendering.js)

- **HTML (card-view tile):** When `instanceImagePath !== instanceFullResPath` (i.e. we're using a thumbnail), render **two** images inside `.card-foil-img-wrap`:
  - Thumb: `<img class="card-view-image card-view-image-thumb" src="${instanceImagePath}" alt="..." ...>` (no `data-full-res`).
  - Full-res layer: `<img class="card-view-image card-view-image-full" data-full-res="${instanceFullResPath}" alt="..." ...>` (no initial `src`; will be set and faded in by JS).
- When thumb and full-res are the same (no thumbnail), keep the current single `<img ... data-full-res="...">` to avoid extra DOM.

- **Progressive load (`initDeckEditorCardViewProgressiveLoad`):**
  - Query for the **full-res layer** only (e.g. `.card-view-image-full[data-full-res]` or the img that has `data-full-res` and no `src`/empty src). Skip tiles that only have a single img (no thumb path).
  - Preload full-res in a temporary `Image()` as today.
  - On load: set the **full-res layer's** `img.src = fullRes` and add a class (e.g. `card-view-image-full--loaded`) so CSS can transition opacity 0 → 1. Do **not** modify the thumbnail img.

**File:** [public/css/card-tables.css](public/css/card-tables.css) (or a small addition in [public/css/foil-effect.css](public/css/foil-effect.css) if preferred)

- **Stacking:** Ensure `.card-foil-img-wrap` is `position: relative` (if not already). Make `.card-view-image-thumb` and `.card-view-image-full` both `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;` (and existing object-position) so they overlap and keep the same layout as today.
- **Full-res layer:** `.card-view-image-full` — `opacity: 0`, `transition: opacity 0.2s ease-out` (or similar). `.card-view-image-full.card-view-image-full--loaded` (or equivalent class) — `opacity: 1`. So when JS adds the class after setting `src`, the full-res fades in over the thumb with no gap.

**Foil:** The foil shimmer is on `.card-foil-img-wrap`; having two imgs inside does not conflict. Both images sit under the same wrapper; foil styling remains as-is.

### 2. Card hover modal (optional, same pattern)

**File:** [public/js/card-hover-modal.js](public/js/card-hover-modal.js)

- When `thumbnailPath !== fullResPath`, use two elements in the modal: one img for thumb (shown immediately), one for full-res (hidden, then `src` set on load and faded in). When they're equal, keep a single img. This removes any flash on hover as well.

### 3. Documentation and tests

- **Docs:** Update [docs/current/DECK_EDITOR_IMAGE_LOADING.md](docs/current/DECK_EDITOR_IMAGE_LOADING.md) and [docs/current/IMAGE_PIPELINE.md](docs/current/IMAGE_PIPELINE.md) to describe the two-layer fade (no src swap on the same img).
- **Style guide:** If the project's STYLE_GUIDE.md covers deck editor or card imagery, add a short note on the progressive load pattern (two-layer, fade-in).
- **Tests:** Any unit or integration tests that assert on `.card-view-image` count or `data-full-res` (e.g. selectors in deck-editor or card-view tests) should be updated to allow either one img (no thumb) or two (thumb + full layer). No change to behavior from the user's perspective.

### 4. Adding Cursor context in the correct directories

Add Cursor-specific context so future edits to this feature stay consistent. The project already uses **co-located `.context.md`** files (e.g. [public/css/foil-effect.context.md](public/css/foil-effect.context.md), [src/services/deck-background.context.md](src/services/deck-background.context.md)) and optional **`.cursor/rules/`** `.mdc` rules.

- **`public/js/deck-editor-image-loading.context.md`** (new, in `public/js/`):
  - Short summary: deck editor card-view and (optionally) hover modal use **two-layer progressive load** (thumb + full-res layer, fade-in) to avoid flash when full-res replaces thumbnail.
  - Point to: `getDeckEditorCardViewInitialImagePath`, `initDeckEditorCardViewProgressiveLoad`, and the HTML pattern (`.card-view-image-thumb` + `.card-view-image-full` with `card-view-image-full--loaded`).
  - Reference full docs: [docs/current/DECK_EDITOR_IMAGE_LOADING.md](docs/current/DECK_EDITOR_IMAGE_LOADING.md), [docs/current/IMAGE_PIPELINE.md](docs/current/IMAGE_PIPELINE.md).
  - Note: do not swap `src` on the same img; use a second layer and opacity transition.

- **`public/css/card-tables.context.md`** (new, in `public/css/`, only if no existing context for card-view exists):
  - Brief note on card-view image stacking: `.card-foil-img-wrap` is `position: relative`; `.card-view-image-thumb` and `.card-view-image-full` are stacked (absolute/inset) with full-res fading in via `.card-view-image-full--loaded`. Cross-link to `foil-effect.context.md` for foil wrapper usage.

- `.cursor/rules/` rule** (if the project uses `.cursor/rules/`):
  - Create a file-scoped rule (e.g. `deck-editor-image-loading.mdc`) with `globs: public/js/deck-editor-rendering.js`, `public/js/card-hover-modal.js`, and optionally `public/css/card-tables.css`.
  - Description: "Two-layer progressive image load (thumb + full-res fade-in) for deck editor cards; do not swap src on the same img."
  - Content: One short paragraph summarizing the pattern and pointing to the `.context.md` files and docs.

Placement summary:

| Context type        | Directory / path                                      | Purpose |
|---------------------|--------------------------------------------------------|---------|
| `.context.md` (JS)   | `public/js/deck-editor-image-loading.context.md`      | Deck editor + hover modal image-load pattern |
| `.context.md` (CSS) | `public/css/card-tables.context.md` (if needed)        | Card-view image stacking and full-res fade |
| `.cursor/rules/`    | `.cursor/rules/deck-editor-image-loading.mdc` (optional)| File-scoped rule when editing those JS/CSS files |

### 5. Scope and edge cases

- **Single img when no thumb:** For card types without thumbnails, keep rendering a single `<img class="card-view-image" src="${instanceImagePath}" ...>` (no `.card-view-image-full`). `initDeckEditorCardViewProgressiveLoad` already skips when `img.src` already contains fullRes; with the new markup it will only target elements with class `card-view-image-full` (or with `data-full-res` and no src), so no regression.
- **Aspect ratio / layout:** Thumb and full-res are the same aspect ratio (same card art). Absolute positioning with same inset/width/height keeps layout identical; no CLS.
- **Error handling:** If full-res fails to load, leave the full-res layer hidden (opacity 0) so the thumbnail remains the only visible image. Optionally add `onerror` on the full-res layer to avoid repeated requests.

---

## Summary

| Area | Change |
|------|--------|
| Deck editor card-view | Two-layer markup when thumb ≠ full-res; full-res layer fades in via class; CSS stacking + opacity transition. |
| initDeckEditorCardViewProgressiveLoad | Target full-res layer only; set its `src` and add loaded class (no thumb src change). |
| Card hover modal | Optional: same two-layer + fade for thumb vs full-res. |
| CSS | Stacked absolute imgs; opacity 0 → 1 transition on full-res layer. |
| Docs/tests | Document pattern; adjust tests for optional second img. |
| **Cursor context** | Add `public/js/deck-editor-image-loading.context.md`; optionally `public/css/card-tables.context.md` and `.cursor/rules/deck-editor-image-loading.mdc`. |

This gives a smooth take-over of the lower-res thumbnail by the higher-res image with no visible flash or gap, in line with common progressive image loading practice, and keeps Cursor context in the correct directories for future edits.
