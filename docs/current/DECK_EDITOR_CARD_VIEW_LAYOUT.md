# Deck Editor Card View — Layout Pattern and Reusability

This document captures the **final, correct** Card View layout pattern so we never regress to the "noticeable frame" or wrong orientation issues. It is the single source of truth for how character, location, event, and portrait cards are styled.

## Orientation rule (do not change)

- **Landscape (exactly three types):** Character, location, and event **must** be landscape (horizontal aspect). No other types use landscape.
- **Portrait (all other types):** Mission, special, aspect, power, teamwork, ally-universe, training, basic-universe, advanced-universe **must** be portrait.

Orientation is set in `public/js/deck-editor-rendering.js` via `data-orientation="landscape"` or `"portrait"` on each `.deck-card-card-view-item`. CSS in `public/css/deck-editor-card-view.css` targets `[data-type="character"]`, `[data-type="location"]`, and `[data-type="event"]` for landscape; all other types use portrait rules.

## Reusable layouts

**Yes — the layouts are reusable.** The same CSS pattern is applied to all landscape cards (character, location, event) and all portrait cards (mission, special, etc.). Only dimensions (wrap height/width) differ by type; the structure and "no frame, image fills, bevelled corners, buttons below" behavior are shared.

- **Landscape:** One shared block in `deck-editor-card-view.css` for `.deck-card-card-view-item[data-type="character"]`, `[data-type="location"]`, and `[data-type="event"]` (and their `.card-foil-img-wrap`, `.card-view-image`, `.card-view-actions`). Wrap heights use `--cv-char-wrap-h` and `--cv-loc-ev-wrap-h` (defaults 184px / 160px; scaled at `@media` breakpoints).
- **Portrait:** One shared block for all other types via `:not([data-type="character"]):not([data-type="location"]):not([data-type="event"])`.

To add a new card type: assign it either landscape or portrait in `renderDeckCardsCardView()` (`data-type` and `data-orientation`) and, if landscape, extend the shared landscape block (selector + dimensions or custom properties); no new layout structure is required.

## Landscape pattern (character, location, event) — do not regress

Goal: **Image fills the frame with bevelled (rounded) corners; no visible border or inner frame; buttons below the image.** Same look for character, location, and event.

### Card item (`.deck-card-card-view-item`)

- **No visible frame:** `background: transparent !important`, `border: none !important`, `outline: none`, `box-shadow: none`. The card item must not draw a box; only the image and buttons are visible.
- **Layout:** `padding: 0`, `overflow: visible`, `align-items: stretch` so the image wrap can be full width.

### Image wrap (`.card-foil-img-wrap`)

- **No visible frame:** `border: none !important`, `background: transparent !important`, `outline: none !important`, `box-shadow: none !important`, `padding: 0 !important`. The wrap only clips the image; it must not show a border or background.
- **Clip to rounded shape:** `border-radius: 8px`, `overflow: hidden`, `box-sizing: border-box`.
- **Dimensions:** `width: 100%`, `margin: 0`. Height is type-specific (character 184px, location 160px, event 160px at 250px width).

### Images (`.card-view-image`, `.card-view-image-thumb`, `.card-view-image-full`)

- **Fill the wrap edge-to-edge:** `width: 100% !important`, `height: 100% !important`, `margin: 0 !important`, `padding: 0 !important`, `border: none !important`, `outline: none !important`, `box-shadow: none !important`.
- **Bevelled corners:** `border-radius: 8px !important` so the image corners match the wrap (no inner rectangular frame).
- **Display:** `display: block`, `vertical-align: top`. **Character:** `object-fit: cover`, `object-position: center top`. **Location and event:** `object-fit: contain`, `object-position: center center` so the full card (including bottom text) is visible and not clipped.

### Actions (`.card-view-actions`)

- **Below the image:** In document flow (not `position: absolute`). `padding: 8px` so the button row sits clearly under the image.

### Hover

- Card item: no border/background; only `transform: translateY(-2px)`.
- Image wrap: `box-shadow: 0 4px 12px rgba(78, 205, 196, 0.35)` for a teal glow only.

## Portrait pattern (mission, special, etc.)

- Card item has border and background (standard card look).
- `.card-foil-img-wrap` fills the card; `.card-view-actions` is `position: absolute; bottom: -35px` so buttons sit below the frame.
- Image fills frame; corners follow wrap/portrait styling.

## Common mistakes to avoid

1. **Adding a border or background to the landscape card item or wrap** — causes the "noticeable frame" and "border hiding behind" again. Keep them transparent and borderless.
2. **Setting landscape image `border-radius: 0`** — leaves sharp corners and can make a gap visible; use `border-radius: 8px` so the image has bevelled corners and fills the wrap.
3. **Using different layout structure for location vs character** — character, location, and event must share the same CSS pattern; only wrap height differs.
4. **Making event portrait** — event must stay landscape (same as location dimensions: 250×160 and scaled at breakpoints).
5. **Using cover for location/event** — location and event use `object-fit: contain` so the full card (including bottom text) is visible; using cover would clip the bottom site-wide (card view and hover modal).

## Files to touch when changing Card View layout

- **CSS:** `public/css/deck-editor-card-view.css` (landscape and portrait blocks, responsive `--cv-*` variables).
- **JS:** `public/js/deck-editor-rendering.js` (orientation logic, `data-type` / `data-orientation`).
- **Context:** `public/css/.cursorrules` (Card View bullets).
- **Docs:** `docs/current/STYLE_GUIDE.md` (Deck Editor Card View Styling), this file.

## References

- [STYLE_GUIDE.md](STYLE_GUIDE.md) — Deck Editor Card View Styling (dimensions, breakpoints).
- [PROGRESSIVE_IMAGE_LOADING.md](PROGRESSIVE_IMAGE_LOADING.md) — Two-layer progressive load pattern (thumb + full-res fade-in, decode before reveal).
- [PROGRESSIVE_IMAGE_LOADING.md](PROGRESSIVE_IMAGE_LOADING.md) — Decode-before-reveal pattern.
