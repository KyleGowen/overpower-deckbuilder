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
```

The `thumb/` directories are auto-generated. Never edit files inside `thumb/` directly — they will be overwritten on the next run.

---

## Thumbnail Dimensions

Dimensions match the exact CSS pixel sizes used on deck tiles. Changing either requires updating both.

| Card Type  | Width | Height | CSS Selector |
|------------|-------|--------|--------------|
| characters | 190px | 140px  | `.deck-character-card-display` |
| locations  | 250px | 160px  | `.deck-tile-location-preview` |
| missions   | 140px | 200px  | `.deck-tile-mission-preview` |

To change dimensions, update `THUMB_CONFIGS` in `src/scripts/generateCardThumbnails.ts` **and** the corresponding CSS in `public/css/deck-selection.css`.

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
🖼️  Generating card thumbnails (characters, missions, locations)...
   Dimensions: characters 190×140, locations 250×160, missions 140×200 | WebP quality: 80

📁 characters/  (190×140)
   ✓ spider-man.webp → thumb/spider-man.webp
   5 generated, 105 skipped, 0 error(s)

📁 missions/  (140×200)
   0 generated, 28 skipped, 0 error(s)

📁 locations/  (250×160)
   0 generated, 12 skipped, 0 error(s)

✅ Done: 5 generated, 145 skipped (up to date), 0 error(s)
```

---

## Deck editor card view

The deck editor’s **card view** (cards in the deck with “Change Art”, etc.) uses **thumbnail-first + progressive full-res** for character, location, and mission so the panel fills quickly instead of waiting on full-resolution images.

- **Initial load**: For character/location/mission, the visible `<img>` `src` is set to the thumbnail URL (via `toThumbnailPath` / `toThumbnailPathForType`). Other types (special, power, event, aspect, teamwork, ally-universe, etc.) have no thumbnails and use full-res only.
- **Progressive load (two-layer, no flash)**: After the card-view HTML is in the DOM, `initDeckEditorCardViewProgressiveLoad()` in `public/js/deck-editor-rendering.js` finds each `.card-view-image-full[data-full-res]`. It preloads the full-res image, then sets that layer’s `src` and adds `card-view-image-full--loaded` so the full-res fades in over the thumbnail. The thumbnail layer’s `src` is never changed. Same two-layer fade pattern is used in the card hover modal.
- **Helpers**: `getDeckEditorCardViewInitialImagePath(fullResPath, cardType)` returns the thumbnail URL for char/loc/mission, or the full-res path for other types.

Deck selection uses thumbnails (and in production, CDN) for list tiles. The deck editor uses thumbnails + progressive load from origin; the hover modal uses the same progressive pattern (thumbnail first, then full-res when loaded) for character, location, and mission.
