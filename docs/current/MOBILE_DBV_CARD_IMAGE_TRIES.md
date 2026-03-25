# Mobile DBV card art & image modal — what we tried

This document records approaches we implemented for **larger card images** on the Card Database (DBV) **mobile layout** (`html.layout-mobile`) and for the **full-screen image preview** (`#imageModal`, `openModal` in `public/js/modal-ui.js`). **Despite these changes, Kyle still saw little or no visible improvement** in some environments. The **root cause** was found and fixed (Mar 2026): `database-view.css` `td img { max-height: 180px !important }` was capping all table images. See **“Confirmed fix”** below and the repeatable fix pattern in [`MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md`](MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md). Keep this file when iterating so we do not lose context on what worked vs what failed.

---

## Two different surfaces (do not conflate them)

| Surface | Where | What users tap |
|--------|--------|------------------|
| **List / row art** | `#characters-table` / `#special-cards-table` tbody, `.card-image-container img` | Card row in the tab; not the black overlay |
| **Lightbox** | `#imageModal` + `#modalImage` | Tap/zoom the image; uses `data-full-res` when set |

Fixes for one surface do not fix the other. Screenshots and reports should name which one failed.

---

## List row art (Characters + Special Cards tabs)

### What we tried

1. **Shared viewport tokens on `#database-view`**  
   - `--dbv-mobile-tile-img-max`, `--dbv-mobile-tile-img-landscape-max-h` (nearly full row width; landscape **height** cap for **table** rows — All-tab grid **`horizontal-card`** uses **`width: 100%`** + **`max-height: none`** for width parity with portrait tiles).  
   - **Files:** `public/css/mobile-layout.css` (All tab + table rows).

2. **Flex + `width: 100%` on tbody `img`**  
   - `flex: 1 1 0`, `min-width: 0`, `width: 100%`, `max-width: var(--dbv-mobile-tile-img-max)` so portrait art would grow between prev/next arrows.  
   - **Intent:** Overcome `width: auto` staying at **intrinsic** bitmap width.  
   - **Files:** `public/css/mobile-layout.css` (later revised).

3. **Explicit `vw`-based portrait widths**  
   - `--dbv-mobile-table-portrait-img`, `--dbv-mobile-table-portrait-img-with-nav` (`min(calc(100vw - …), Npx)`).  
   - Selectors: `img:not(.horizontal-card)` vs `img.horizontal-card` (landscape still uses flex + max-height token).  
   - **With-nav** narrows the target when `.card-image-container--with-nav` (alternate art).  
   - **Files:** `public/css/mobile-layout.css`; unit coverage in `tests/unit/layout-mode-and-viewport.test.ts`.

4. **Special Cards only — ~1.5× list + hover + lightbox**  
   - **`#special-cards-table`** defines **`--dbv-mobile-special-portrait-img`** (**`min(100%, 870px)`**), **`--dbv-mobile-special-tile-img-max`**, **`--dbv-mobile-special-tile-img-landscape-max-h`**; portrait with nav uses flex growth between arrows (Characters / All unchanged).  
   - **Hover:** `.layout-mobile .card-hover-modal[data-card-type='special']` — larger **`max-width`/`max-height`**, **`padding: 6px`**; **`card-hover-modal.js`** **`positionModal`** uses a larger clamp box when **`isLayoutMobile()`** and **`cardType === 'special'`**.  
   - **Lightbox:** List **`img`** **`data-dbv-lightbox-context="special"`** → **`openModal`** sets **`#imageModal[data-open-context='special']`** → **`mobile-layout.css`** raises **`#modalImage`** caps.  
   - **Files:** `public/css/mobile-layout.css`, `public/js/card-display.js`, `public/js/modal-ui.js`, `public/js/card-hover-modal.js`.  
   - **Follow-up:** **`@media (max-width: 900px)`** block duplicates tbody + hover + lightbox for **`#database-view #special-cards-table`** so **`layout-desktop`** (**`preferDesktopLayout`**) on a narrow viewport no longer leaves **120px** list art; **`isNarrowViewportDbvBand()`** in **`card-display.js`** aligns Special inline styles and height locks with that band.

### Why it might still look “unchanged”

- **`layout-mobile` not active:** Breakpoint / `preferDesktopLayout` / devtools device mode without the class on `<html>` → desktop table rules (e.g. fixed column %, `max-width: 316px` inline from JS) still apply.  
- **Caching:** Stale `mobile-layout.css` or `index.css` without hard refresh.  
- **Asset dimensions:** If the served file is genuinely small, upscaling is blurry; users may perceive “same size” if the cap is still below expectations.  
- **Conflicting rules:** `database-view.css` row locks, `card-tables.css` / `index.css` media blocks, or inline styles from `public/js/card-display.js` can still win in edge cases (verify computed styles in DevTools).  
- **Wrong tab / expectation:** Characters vs Specials share patterns but history evolved separately; one tab may have regressed.

### Code pointers (current)

- `public/css/mobile-layout.css` — search `--dbv-mobile-table-portrait-img`, `#special-cards-table tbody td:first-child .card-image-container`, `#characters-table tbody td:first-child .card-image-container`.  
- `public/js/card-display.js` — `displaySpecialCards`, `displayCharacters`, `isLayoutMobileForCardDisplay`, `applyDbvHorizontalCardClass`, `navigateCardImage`.

---

## Confirmed fix — `max-height: none !important` (Mar 2026)

### Root cause

`database-view.css` line ~275: **`td img { max-height: 180px !important; }`** — a broad desktop rule that caps ALL table images. Mobile CSS overrode `width` and `height` but **never overrode `max-height`**. With `object-fit: contain` + `max-height: 180px`, portrait images (819×1114 natural) scaled to fit 180px tall, appearing only ~132px wide in a ~700px viewport — the element box was correct but the image content was tiny.

### What fixed it

Added **`max-height: none !important;`** to the portrait image rules in both `.layout-mobile` and `@media (max-width: 900px)` selectors in `mobile-layout.css`. This overrides the desktop 180px cap so images scale to their full proportional height based on width.

### Repeatable pattern

This fix applies to **every DBV tab** that renders card images inside `<td>`. Full checklist and template selectors: **[`docs/current/MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md`](MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md)**.

---

## Confirmed failed / ineffective (user QA)

Add entries here when a shipped approach **still matches the old symptom** in the real UI (screenshot or device), so the next agent does not assume it worked.

### Special Cards list — art still small vs row “frame” (~Mar 2026, pre-max-height fix)

- **Report:** After implementing **(4)** Special-only **`--dbv-mobile-special-*`** tokens, **`.layout-mobile`** hover/lightbox scaling, the **`@media (max-width: 900px)`** duplicate block for **`#database-view #special-cards-table`**, **`isNarrowViewportDbvBand()`** in **`displaySpecialCards`**, and **`positionModal`** widening for **`special`** at ≤900px — **Kyle still saw** Special tab list art occupying only a fraction of the dark card row (e.g. “Don’t Let it Get Away!”), with lots of empty horizontal space in the row container. **Local:** `localhost:8085`, mobile-style layout with filter strip and stacked rows.
- **Conclusion:** ~~Treat this stack as not sufficient~~ **RESOLVED** — the missing piece was `max-height: none !important` to override `td img { max-height: 180px !important }`. See "Confirmed fix" section above.
- **Original hypotheses checked:**  
  - **`horizontal-card`** applied to art that reads as “portrait” in the UI → landscape branch (`max-height` / flex) dominates and shrinks perceived size.  
  - **`#database-view` ancestor** missing or different in the live DOM path so **`#database-view #special-cards-table`** rules never match.  
  - **Stronger rule** elsewhere (inline, `database-view.css` **`td img`**, or another sheet) still winning — inspect **Computed** on the list **`img`**.  
  - **Stale assets / cache** (unlikely if server restarted; still worth a hard refresh with cache disabled).

---

## Image preview modal (`#imageModal`)

### What we tried

1. **Scoped rules so the teal frame is not a fixed 400px shell**  
   - `#imageModal .modal-content`: `width: fit-content`, flex column, `max-width: min(400px, 92vw)`.  
   - `#imageModal #modalImage`: viewport-ish `max-width` / `max-height` on desktop.  
   - **File:** `public/css/index.css`.

2. **Mobile overrides**  
   - `.layout-mobile #imageModal .modal-content`: `width: fit-content !important`, `max-width: calc(100vw - 20px)`.  
   - `#modalImage`: `max-width: calc(100vw - 32px)`, `max-height: calc(100vh - 160px)` and `calc(100dvh - 160px)`.  
   - `#modalCaption`: `max-width: calc(100vw - 32px)`.  
   - **File:** `public/css/mobile-layout.css` (after generic `.layout-mobile .modal-content`).  
   - **Tests:** `layout-mode-and-viewport.test.ts` (regex on `#imageModal`).

3. **`openModal` already prefers `data-full-res`**  
   - **File:** `public/js/modal-ui.js`.

### Why it might still look “frame huge, image tiny”

- **Bitmap not scaling:** If `#modalImage` effective size is still driven by intrinsic dimensions + a constraint we missed, the flex parent can be large while the bitmap stays small (check computed `width`/`max-width`/`max-height` on `#modalImage` and parent).  
- **Not mobile mode:** Same `layout-mobile` caveat as list rows.  
- **Other CSS:** Global `.modal-content img` or `#modalCaption` order/specificity; deck-builder or alternate HTML shells if they duplicate modal markup without the same CSS load order.  
- **User expectation:** “Fill the frame” vs “fit-content hug” — we optimized for **hug + viewport caps**, not necessarily **100% of modal backdrop**.

### Code pointers (current)

- `public/css/index.css` — `#imageModal`.  
- `public/css/mobile-layout.css` — `.layout-mobile #imageModal`.  
- `public/index.html` — `#imageModal` markup.  
- `docs/current/STYLE_GUIDE.md` — “Card image preview modal” under Modals.

---

## Recommendations for applying to other tabs

1. **Follow the repeatable fix pattern** in [`MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md`](MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md) — it has a checklist and template selectors for each table.
2. **Reproduce with DevTools:** Confirm `html` has `layout-mobile`, identify which surface (list vs modal), note computed styles on the **`img`** (not only the wrapper).  
3. **Don’t remove this doc** when fixing the issue — **append** what finally worked and delete or narrow misleading STYLE_GUIDE claims if behavior changes.  
4. **Consider JS:** If CSS keeps losing (inline styles, load order, table layout), set a dedicated class on DBV row images in `card-display.js` when `isLayoutMobile()` and style that class in one place.  
5. **Modal:** If hug + max dimensions is insufficient, try an explicit **min** width/height on `#modalImage` for mobile only, or `image-set` / guaranteed large `src` — only after verifying `modalImage.src` is actually full-res.

---

## References

- Mobile strategy: [MOBILE_DESIGN.md](../../MOBILE_DESIGN.md) (§10 DBV).  
- Visual spec (may describe intended, not actual): [STYLE_GUIDE.md](STYLE_GUIDE.md) — Mobile adaptations, Modals.  
- **Repeatable fix pattern:** [MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md](MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md) — checklist + template selectors for every DBV tab.
- Guest UX precedent for “we tried this” docs: [GUEST_DECK_LESSONS_LEARNED.md](GUEST_DECK_LESSONS_LEARNED.md).
