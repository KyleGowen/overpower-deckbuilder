# Image Pipeline — Card Thumbnails

## Overview

Card images on deck tiles are served as WebP thumbnails sized to exactly match the CSS display dimensions. Generating at display size reduces bytes transferred per tile by ~60% compared to serving full-resolution images.

The pipeline is handled by `src/scripts/generateCardThumbnails.ts` and runs automatically during `npm run dev` and `npm run build`.

---

## Directory Structure

```
src/resources/cards/images/
├── characters/
│   ├── <character-name>.webp       ← source image (full resolution)
│   ├── alternate/
│   │   └── <character-name>-alt.webp
│   └── thumb/                      ← generated thumbnails (do not edit)
│       ├── <character-name>.webp
│       └── alternate/
│           └── <character-name>-alt.webp
├── locations/
│   ├── <location-name>.webp
│   └── thumb/
│       └── <location-name>.webp
└── missions/
    ├── <mission-name>.webp
    └── thumb/
        └── <mission-name>.webp
├── specials/, power-cards/, events/, aspects/
├── advanced-universe/, teamwork-universe/, ally-universe/, training-universe/, basic-universe/
    └── thumb/   ← same pattern under each (mirrors source subdirs)
```

The same generator also fills `thumb/` under every **card-art** top-level folder (excluding `backgrounds/`). The `thumb/` directories are auto-generated. Never edit files inside `thumb/` directly — they will be overwritten on the next run.

---

## Thumbnail Dimensions

Dimensions match the exact CSS pixel sizes used on deck tiles. Changing either requires updating both.

| Preset (in `THUMB_CONFIGS`) | 2× source (Sharp) | Typical use |
|----------------------------|-------------------|-------------|
| Character-like (`cover`)   | 380×280           | characters, specials, power-cards, aspects, universe folders |
| Mission-like (`cover`)     | 280×400           | missions, events |
| Location-like (`contain` + transparent pad) | 500×320 | locations |

Deck tile CSS still targets characters / locations / missions in `public/css/deck-selection.css`. Other card types reuse the character or mission preset for list/search thumbnails.

To change dimensions, update `THUMB_CONFIGS` in `src/scripts/generateCardThumbnails.ts` **and** any CSS that assumes a fixed thumb aspect ratio.

### Resize fit (`cover` vs `contain`)

- **Characters** and **missions**: thumbnails use Sharp **`cover`** (fills the box; may crop edges).
- **Locations**: thumbnails use **`contain`** with a **transparent** letterbox (alpha 0). Promo / alternate location art often has a taller aspect ratio than the 250×160 tile box; **`cover` was cropping the top and bottom** in deck tiles, card DB tables, and the hover preview (thumb layer). **`contain`** keeps the full card visible; side gutters are transparent WebP pixels so the UI behind the image (deck tile background, table cell, etc.) shows through.

After changing resize behavior, regenerate all location thumbs once: `npm run generate:thumbnails -- --force` (otherwise mtime skip leaves old files).

---

## Adding New Card Images

1. Drop the source image into the correct type directory:
   - `src/resources/cards/images/characters/` for characters
   - `src/resources/cards/images/locations/` for locations
   - `src/resources/cards/images/missions/` for missions
2. Run `npm run generate:thumbnails`
3. Confirm the new thumbnail appears in the corresponding `thumb/` subdirectory
4. Commit both the source image and the generated thumbnail

**Never commit a source image without its corresponding thumbnail.**

---

## shouldSkip Logic

The script uses file modification times to avoid regenerating up-to-date thumbnails:

```typescript
function shouldSkip(sourcePath: string, thumbPath: string): boolean {
  if (!fs.existsSync(thumbPath)) return false;       // no thumb yet → generate
  const sourceStat = fs.statSync(sourcePath);
  const thumbStat  = fs.statSync(thumbPath);
  return thumbStat.mtimeMs >= sourceStat.mtimeMs;    // thumb is newer → skip
}
```

- If the thumbnail does not exist → generate it
- If the source image is newer than the thumbnail → regenerate it
- Otherwise → skip (already up to date)

This makes the script fast on subsequent runs (all existing thumbnails are skipped in milliseconds).

---

## Build Pipeline Integration

Thumbnail generation is wired into both the dev and build scripts in `package.json`:

```json
"dev":   "npm run generate:thumbnails && ts-node-dev ...",
"build": "npm run generate:thumbnails && tsc"
```

This means thumbnails are always fresh when:
- Starting the dev server (`npm run dev`)
- Building locally (`npm run build`)
- CI `build` job (calls `npm run build`)
- CI `integration-tests` job (calls `npm run build`)
- CI `build-docker` job (has an explicit `generate:thumbnails` step — redundant but harmless, `shouldSkip` makes it instant)

---

## Running Manually

```bash
npm run generate:thumbnails
```

Output example:
```
🖼️  Generating card thumbnails (all card-art directories; backgrounds excluded)...
   Presets: character-like 380×280 cover; mission/event-like 280×400 cover; locations 500×320 contain (2× retina) | WebP quality: 80

📁 characters/  (380×280, cover)
   ✓ spider-man.webp → thumb/spider-man.webp
   5 generated, 105 skipped, 0 error(s)

📁 specials/  (380×280, cover)
   0 generated, 274 skipped, 0 error(s)

✅ Done: … generated, … skipped (up to date), 0 error(s)
```

---

## Deck editor card view

The deck editor’s **card view** (cards in the deck with “Change Art”, etc.) uses **thumbnail-first + progressive full-res** for all card types that have `thumb/` assets (via `thumbImageSubdirForCardType` + `toThumbnailPathForType`) so the panel fills quickly instead of waiting on full-resolution images.

- **Initial load**: For character/location/mission, the visible `<img>` `src` is set to the thumbnail URL (via `toThumbnailPath` / `toThumbnailPathForType`). Other types (special, power, event, aspect, teamwork, ally-universe, etc.) have no thumbnails and use full-res only.
- **Progressive load (two-layer, no flash)**: After the card-view HTML is in the DOM, `initDeckEditorCardViewProgressiveLoad()` in `public/js/deck-editor-rendering.js` finds each `.card-view-image-full[data-full-res]`. It preloads the full-res image, then sets that layer’s `src` and adds `card-view-image-full--loaded` so the full-res fades in over the thumbnail. The thumbnail layer’s `src` is never changed. Same two-layer fade pattern is used in the card hover modal.
- **Helpers**: `getDeckEditorCardViewInitialImagePath(fullResPath, cardType)` returns the thumbnail URL for char/loc/mission, or the full-res path for other types.
- **Aspect alignment**: Card view uses **type-specific** dimensions for character, location, and event so the display box matches the same aspect ratio as the thumb config and deck selection (see Thumbnail Dimensions table). That way thumb and full-res use the same crop box and there is no visible sizing shift when full-res loads.

Deck selection uses thumbnails (and in production, CDN) for list tiles. The deck editor uses thumbnails + progressive load from origin; the hover modal uses the same progressive pattern (thumbnail first, then full-res when loaded) for character, location, and mission. The hover modal's full-res layer uses `object-fit: cover` (and `object-position: center top`) so it fully covers the thumbnail and the low-res image is never visible behind it.
