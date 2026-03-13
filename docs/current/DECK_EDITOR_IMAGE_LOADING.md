# Deck editor image loading

Deck editor card-view images use **thumbnail-first + progressive full-res** for character, location, and mission so the panel loads quickly; other types use full-res only.

- **Card view** (tiles with “Change Art”): Initial `img.src` is the thumbnail for char/loc/mission; `initDeckEditorCardViewProgressiveLoad()` in `public/js/deck-editor-rendering.js` then preloads full-res and swaps when loaded. Same pattern as the card hover modal.
- **Hover modal**: Thumbnail first, then full-res for character, location, and mission (`card-hover-modal.js`; uses `toThumbnailPath` and `toThumbnailPathForType` from `card-image-utils.js`).

Path helpers: `getCardImagePath(..., { useThumbnail: true })`, `toThumbnailPath`, `toThumbnailPathForType`. Thumbnail generation and pipeline: see [IMAGE_PIPELINE.md](IMAGE_PIPELINE.md).
