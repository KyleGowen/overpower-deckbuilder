# Deck editor image loading

Deck editor card-view images use **thumbnail-first + progressive full-res** for character, location, and mission so the panel loads quickly; other types use full-res only. To avoid a visible flash when full-res loads, we use a **two-layer fade**: the thumbnail stays visible and a second image layer fades in on top (no `src` swap on the same element).

- **Card view** (tiles with “Change Art”): When thumb ≠ full-res we render two images inside `.card-foil-img-wrap`: `.card-view-image-thumb` (thumbnail, `src` never changed) and `.card-view-image-full` (no initial `src`). `initDeckEditorCardViewProgressiveLoad()` in `public/js/deck-editor-rendering.js` preloads full-res, then sets the full-res layer’s `src` and adds `card-view-image-full--loaded` so it fades in over the thumb. When thumb === full-res (e.g. special, power) we use a single `<img class="card-view-image">`.
- **Hover modal**: Same two-layer pattern when thumb ≠ full-res (`card-hover-modal.js`): one img for thumb (shown immediately), one for full-res (opacity 0 → 1 when loaded). Uses `toThumbnailPath` and `toThumbnailPathForType` from `card-image-utils.js`.

Path helpers: `getCardImagePath(..., { useThumbnail: true })`, `toThumbnailPath`, `toThumbnailPathForType`. The thumbnail helpers support both site-relative paths and CDN-prefixed production paths, preserving the CDN origin while rewriting the pathname to `/thumb/`. Thumbnail generation and pipeline: see [IMAGE_PIPELINE.md](IMAGE_PIPELINE.md).

**Best practice (two-layer, decode before reveal):** See [PROGRESSIVE_IMAGE_LOADING.md](PROGRESSIVE_IMAGE_LOADING.md) for the full rationale and the decode-before-reveal rule.
