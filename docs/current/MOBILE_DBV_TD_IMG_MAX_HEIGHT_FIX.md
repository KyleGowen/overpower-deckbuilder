# Mobile DBV image sizing fix — `td img { max-height: 180px }` override

**Status:** Proven fix (Special Cards tab, Mar 2026).  
**Applies to:** Every Card Database tab that renders card images inside `<td>` elements on mobile.

---

## The problem

`public/css/database-view.css` has a broad desktop rule:

```css
td img {
    display: block;
    margin: 0 auto;
    width: 120px !important;
    height: auto !important;
    max-height: 180px !important;          /* ← the culprit */
}
```

This constrains **all** table images to 120×180px (portrait thumbnail size for desktop columns). On mobile, `mobile-layout.css` overrides `width` and `height` to let images scale larger, but **never overrides `max-height`**. Combined with `object-fit: contain` (applied via CSS or inline style), portrait images (e.g. 819×1114 natural) scale down to fit within 180px height — appearing only ~132px wide in a ~700px viewport.

**Symptom:** Image element is sized correctly (e.g. 668px wide via CSS), but the visible image content is tiny and centered inside the element box, surrounded by empty space. Adding a `border` to the `img` confirms the element is wide but the content is squished.

---

## The fix (repeatable pattern)

Add `max-height: none !important;` to the mobile image rules for each table. This must go in **two places** per tab:

### 1. `.layout-mobile` selector (class-based)

```css
.layout-mobile #TABLE-ID tbody td:first-child .card-image-container:not(.card-image-container--with-nav) img:not(.horizontal-card) {
    /* ...existing width/height/flex rules... */
    max-height: none !important;    /* override td img { max-height: 180px !important } */
}

.layout-mobile #TABLE-ID tbody td:first-child .card-image-container.card-image-container--with-nav img:not(.horizontal-card) {
    /* ...existing width/height/flex rules... */
    max-height: none !important;    /* override td img { max-height: 180px !important } */
}
```

### 2. `@media (max-width: 900px)` mirror selector (viewport-based)

The `@media` mirror ensures narrow viewports get large art even when `preferDesktopLayout` forces `layout-desktop`:

```css
@media (max-width: 900px) {
    #database-view #TABLE-ID tbody td:first-child .card-image-container:not(.card-image-container--with-nav) img:not(.horizontal-card) {
        /* ...existing rules... */
        max-height: none !important;
    }

    #database-view #TABLE-ID tbody td:first-child .card-image-container.card-image-container--with-nav img:not(.horizontal-card) {
        /* ...existing rules... */
        max-height: none !important;
    }
}
```

### Landscape images (`img.horizontal-card`)

Landscape images already use `max-height: var(--dbv-mobile-special-tile-img-landscape-max-h) !important` (or equivalent), which overrides the 180px cap. **No additional fix needed** for landscape art.

---

## Checklist for applying to a new tab

Replace `#TABLE-ID` with the table's actual ID (e.g. `#special-cards-table`, `#characters-table`, `#advanced-universe-table`, etc.).

1. **Find the mobile image rules** in `public/css/mobile-layout.css` for the target table.
2. **Check if `max-height: none !important` is already present** on the portrait `img` rules (both `.layout-mobile` and `@media` mirror).
3. If missing, **add `max-height: none !important`** to both non-nav and with-nav portrait image selectors.
4. **Check inline styles** in the JS display function (e.g. `displaySpecialCards`, `displayCharacters` in `card-display.js`, or `card-display-functions.js`). The mobile path should **not** set `max-height: 180px` in inline styles. If it does, remove it from the mobile branch.
5. **Hard reload** the browser (CSS may be cached).
6. **Verify** with DevTools: computed `max-height` on the `img` should be `none`, not `180px`.

---

## Tabs where this fix has been applied

| Tab | Table ID | Fix applied | Date |
|-----|----------|-------------|------|
| Special Cards | `#special-cards-table` | Yes | Mar 2026 |
| Characters | `#characters-table` | Check needed | — |
| Universe: Advanced | `#advanced-universe-table` | Pending | — |
| Locations | `#locations-table` | Pending | — |
| Aspects | `#aspects-table` | Pending | — |
| Missions | `#missions-table` | Pending | — |
| Events | `#events-table` | Pending | — |
| Universe: Teamwork | `#teamwork-table` | Pending | — |
| Universe: Ally | `#ally-universe-table` | Pending | — |
| Universe: Training | `#training-table` | Pending | — |
| Universe: Basic | `#basic-universe-table` | Pending | — |
| Power Cards | `#power-cards-table` | Pending | — |

---

## Horizontal clipping (Special Cards, Mar 2026 follow-up)

Portrait list art used **`width: min(calc(100vw - 24px), 870px)`**, which can be **wider than the actual table cell** (section padding, row padding, scrollbar). Desktop height-lock rules leave **`overflow: hidden`** on **`td` / `tr`**, so the **right edge of the image was clipped**. **Fix:** use **`--dbv-mobile-special-portrait-img: min(100%, 870px)`** so **`width`** is relative to the card cell; **`overflow: visible`** on locked special rows on mobile as a safety net; **with-nav** portrait uses **`flex: 1 1 0`** between arrows instead of a second vw-based token. **`#imageModal[data-open-context='special']`:** set **`width` / `max-width`** to the modal cap so the image scales to the teal frame width first.

---

## Why CSS specificity alone isn't enough

The desktop rule uses `td img` with `!important`. Mobile rules use longer selectors (higher specificity) **and** `!important` on `width` and `height` — but **CSS specificity does not matter when both sides use `!important`**: in that case, the rule that appears **later in load order** wins. Since `mobile-layout.css` loads after `database-view.css`, adding `max-height: none !important` in `mobile-layout.css` correctly overrides the desktop `max-height: 180px !important`.

Without the explicit `max-height: none !important`, the mobile rules only override `width` and `height` — the desktop `max-height` persists unchallenged.

---

## Debugging tips

If images still appear small after applying the fix:

1. **Check `layout-mobile` class** on `<html>` — if missing, mobile CSS rules don't apply.
2. **Inspect computed styles** on the `img` element — look for `max-height` (should be `none`), `object-fit`, `width`, `height`.
3. **Check inline styles** — JS display functions may set inline `max-height` or `object-fit: contain` that override CSS.
4. **Hard reload** — `Cmd+Shift+R` / `Ctrl+Shift+R` to bypass CSS cache.
5. **Check the `@media` mirror** — if `preferDesktopLayout` is set, `.layout-mobile` selectors won't match; the `@media (max-width: 900px)` block must also have the fix.

---

## References

- Root cause analysis: [`docs/current/MOBILE_DBV_CARD_IMAGE_TRIES.md`](MOBILE_DBV_CARD_IMAGE_TRIES.md) §"Confirmed fix"
- Desktop rule: `public/css/database-view.css` lines ~269–276 (`td img`)
- Mobile overrides: `public/css/mobile-layout.css` (search `max-height: none !important`)
- Mobile design roadmap: [`MOBILE_DESIGN.md`](../../MOBILE_DESIGN.md) §10.3
- Style guide: [`docs/current/STYLE_GUIDE.md`](STYLE_GUIDE.md) — Mobile Adaptations → Card database
