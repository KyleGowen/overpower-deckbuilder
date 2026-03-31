# Deck Background Feature — Cursor Context

> This file provides context for AI assistance when working on the deck background feature.
> It documents the service, API, frontend, and image directory so changes stay consistent.

---

## What the Feature Does

Users can choose a **background image** for the deck editor (card/tile view). The choice is stored per deck as `background_image_path` and applied as a full-bleed background behind the deck editor content. "None" means the default black background.

---

## Directories and Key Files

| Role | Path |
|------|------|
| **Background images** | `src/resources/images/backgrounds/landscape/` — only `.png` files; **auto-discovered** (no manifest). |
| **Backend service** | `src/services/deckBackgroundService.ts` — lists files, validates paths, 15‑min cache. |
| **API** | `GET /api/deck-backgrounds` (authenticated) → `{ success, data: string[] }` (paths). Deck PATCH/PUT accept `background_image_path` (string or null). |
| **Frontend** | `public/js/deck-background.js` — `DeckBackgroundManager`: loads list, modal picker, applies CSS `background-image` to editor. |
| **Deck payload** | `background_image_path` on deck metadata (e.g. `GET /api/decks/:id`, PATCH body). |

Paths are **relative to project root**, e.g. `src/resources/images/backgrounds/landscape/moriartynotext.png`. The frontend uses them as `/${path}` (e.g. `/src/resources/images/backgrounds/landscape/…`) for `url()`.

---

## Backend: DeckBackgroundService

- **`getAvailableBackgrounds()`** — `readdir` of `src/resources/images/backgrounds/landscape`, filter `.png`, return sorted paths; cached 15 minutes.
- **`validateBackgroundPath(imagePath)`** — ensures path is under `backgrounds`, then `fs.access(projectRoot + imagePath)`. Used when saving deck with `background_image_path`.
- **`clearCache()`** — use after adding/removing images if you need the list to refresh without restart.

No thumbnails: deck backgrounds are full-size images. The card thumbnail pipeline (`generateCardThumbnails.ts`) does **not** include `src/resources/images/backgrounds/`.

---

## Frontend: DeckBackgroundManager

- **Initialization** — `initialize(deckId, readOnly, deckMetadata?)`: loads current deck background, applies it, shows "Background" button in edit mode, fetches `/api/deck-backgrounds` to fill the picker.
- **Modal** — Grid of options: "None" first, then all paths from the API. Option label is derived from filename (e.g. `moriartyreapernotext.png` → "moriartyreaper").
- **Apply** — Sets `background-image: url(/${selectedBackground})` on the deck editor modal content; no background = black.

Button and modal are wired in the deck editor; `deck-editor-core.js` passes `background_image_path` on save.

---

## Adding a New Background

1. Add a `.png` file to `src/resources/images/backgrounds/landscape/`.
2. No code changes required — the service discovers all PNGs in that directory.
3. New listings appear after cache expiry (~15 min) or server restart. For immediate visibility, restart the server or call `deckBackgroundService.clearCache()`.

See `.cursorrules` in `src/resources/images/backgrounds/landscape/` for directory-specific rules.

---

## Tests

- **Unit**: `tests/unit/deck-background-service.test.ts`, `tests/unit/deck-background-manager.test.ts`
- **Integration**: `tests/integration/deck-background-api.test.ts`, `deck-background-full-flow.test.ts`, `deck-background-persistence.test.ts`

Integration tests expect paths like `src/resources/images/backgrounds/landscape/<name>.png` and that the API returns only paths under that directory.
