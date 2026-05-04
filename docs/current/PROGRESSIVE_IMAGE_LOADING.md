# Progressive image loading — best practice and implementation

This doc describes industry best practice for smooth thumbnail-to-full-res transitions (no flash) and how we implement it in the deck editor and hover modal.

---

## Problem

Replacing `img.src` on the **same** element causes the browser to clear and repaint. That produces a visible **flash** when the high-res image takes over. CSS transitions on that same element do not prevent one frame of clear/repaint in many browsers. **Avoid single-element src swap** for progressive loading.

---

## Industry approach: two-layer (overlay) + fade-in

Common pattern (Medium, Unsplash, Next.js blur/LQIP, CSS-Tricks “blur up”):

1. **Keep the placeholder visible** — thumbnail or low-res/blurred image in a bottom layer; never change its `src`.
2. **Load full-res in a second element** — a second `<img>` (or layer) positioned on top, same size, initially hidden (e.g. `opacity: 0`).
3. **Reveal with a transition** — when the full-res image is ready, set the top layer’s `src` (from cache) and transition it to visible (e.g. `opacity: 1`). The thumbnail remains underneath until the full-res has painted — no blank frame.

We use sharp thumbnails rather than a tiny blurred placeholder, so a simple opacity fade of the full-res layer is sufficient.

---

## Decode before reveal

In some browsers (notably Firefox and Safari), `onload` can fire when the image data is fetched but **before** decoding is complete. If we add the “loaded” class and fade in the full-res layer in the same tick as setting its `src`, the first frame at full opacity can show a blank or partially decoded image — which looks like a flash.

**Rule:** Use the **in-DOM** full-res `<img>`’s `decode()` and only then add the class that triggers the fade-in. That way the first painted frame at full opacity is fully decoded.

- `HTMLImageElement.decode()` returns a Promise that resolves when the image is decoded and ready to display (see [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode)).
- After setting the full-res layer’s `src`, call `fullResLayer.decode().then(() => addLoadedClass).catch(() => addLoadedClass)` so we still reveal on decode failure and don’t leave the image hidden forever.

---

## Our implementation

Where we do thumb → full-res (deck editor card-view, card hover modal):

1. **Two layers**  
   - Deck editor: `.card-view-image-thumb` (thumbnail, `src` never changed) and `.card-view-image-full` (no initial `src`) inside `.card-foil-img-wrap`.  
   - Hover modal: thumb img + `.card-hover-image-full` inside the image wrap.

2. **Full-res layer styling**  
   - `opacity: 0`, `transition: opacity 0.2s ease-out`.  
   - When the `--loaded` class is added, `opacity: 1`.

3. **Load sequence**  
   - Preload full-res in a temporary `new Image()`.  
   - On preload `onload`: set the full-res **layer’s** `src` to the full-res URL (from cache).  
   - **Decode before reveal:** call the full-res layer’s `decode().then(...).catch(...)` and only in those callbacks add the `--loaded` class.  
   - Do not add the class in the same tick as setting `src`; that avoids the decode-delay flash.

4. **Single img when no thumb**  
   - For card types without thumbnails (e.g. special, power), we keep a single `<img class="card-view-image">` with full-res only — no second layer.

Entry points:

- Deck editor: `getDeckEditorCardViewInitialImagePath`, `initDeckEditorCardViewProgressiveLoad()` in `public/js/deck-editor-rendering.js`.
- Hover modal: two-layer block in `public/js/card-hover-modal.js` (and inline equivalent in `public/deck-builder.html`).

---

## References

- [MDN: HTMLImageElement.decode()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode)
- `public/js/deck-editor-rendering.js` — `initDeckEditorCardViewProgressiveLoad()` (deck editor card-view)
- `public/js/card-hover-modal.js` — same two-layer + fade for hover modal
- [IMAGE_PIPELINE.md](IMAGE_PIPELINE.md) — thumbnail generation and pipeline
