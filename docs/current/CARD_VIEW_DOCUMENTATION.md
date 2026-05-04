# Deck Editor Card View Documentation

> **AUTHORITATIVE SSOT:** [`DECK_EDITOR_CARD_VIEW_LAYOUT.md`](DECK_EDITOR_CARD_VIEW_LAYOUT.md)
>
> That file is the single source of truth for Card View layout rules (orientation, no-frame/border policy, bevelled corners, portrait vs landscape, common mistakes). **Read it before making any Card View CSS or JS changes.**

## Key files

- **CSS:** `public/css/deck-editor-card-view.css`
- **JS rendering:** `public/js/deck-editor-rendering.js`
- **Progressive image loading:** [`PROGRESSIVE_IMAGE_LOADING.md`](PROGRESSIVE_IMAGE_LOADING.md)
- **Style tokens:** [`STYLE_GUIDE.md`](STYLE_GUIDE.md) — "Deck Editor Card View Styling"

## Container class hierarchy (quick reference)

```
.deck-cards-editor.card-view
└── .card-view-category-section (per card type)
    ├── .card-view-category-header
    └── .card-view-category-cards
        └── .deck-card-card-view-item[data-type][data-orientation]
            ├── .card-foil-img-wrap
            │   ├── .card-view-image-thumb  (thumbnail; src never changes)
            │   └── .card-view-image-full   (full-res; fades in via --loaded class)
            └── .card-view-actions
```

Data attribute `data-orientation="landscape"` is set for character, location, and event; all others use `"portrait"`.
