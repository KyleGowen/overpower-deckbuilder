// Deck tile image/path helpers
// Extracted from public/index.html to reduce inline script size.

(function initDeckTileImages() {
    window.DeckSelection = window.DeckSelection || {};

    // CDN_BASE is set by /js/app-config.js (served dynamically from the server).
    // In production it is the CloudFront domain (e.g. https://xxxx.cloudfront.net).
    // In local dev it is an empty string, so all paths remain relative to the EC2 origin.
    const CDN_BASE = (window.APP_CDN_BASE || '').replace(/\/$/, '');

    // Convert full-res path to thumbnail path (characters, missions, locations).
    // e.g. .../characters/foo.webp → .../characters/thumb/foo.webp
    // e.g. .../missions/setname/card.webp → .../missions/thumb/setname/card.webp
    // e.g. .../locations/alternate/foo.png → .../locations/thumb/alternate/foo.webp
    function toThumbnailPathForType(fullPath, type) {
        if (!fullPath || typeof fullPath !== 'string') return fullPath;
        const base = '/src/resources/cards/images/' + type + '/';
        if (!fullPath.startsWith(base) || fullPath.includes('/thumb/')) return fullPath;
        const afterBase = fullPath.slice(base.length);
        const lastSlash = afterBase.lastIndexOf('/');
        const dir = lastSlash >= 0 ? afterBase.slice(0, lastSlash + 1) : '';
        const filename = lastSlash >= 0 ? afterBase.slice(lastSlash + 1) : afterBase;
        const baseName = filename.replace(/\.[^.]+$/, '');
        return CDN_BASE + base + 'thumb/' + dir + baseName + '.webp';
    }

    function maybeThumbnailForDeckTile(imagePath, card) {
        if (!imagePath) return imagePath;
        if (card.type === 'character' && imagePath.startsWith('/src/resources/cards/images/characters/')) {
            return toThumbnailPathForType(imagePath, 'characters');
        }
        if (card.type === 'mission' && imagePath.startsWith('/src/resources/cards/images/missions/')) {
            return toThumbnailPathForType(imagePath, 'missions');
        }
        if (card.type === 'location' && imagePath.startsWith('/src/resources/cards/images/locations/')) {
            return toThumbnailPathForType(imagePath, 'locations');
        }
        return imagePath;
    }

    // Helper function to get deck-card image path (characters + locations)
    // deck.cards entries include `defaultImage` for fast display when available.
    // Character images use thumbnails for faster deck selection load (especially in production).
    window.DeckSelection.getDeckCardImagePath = (card) => {
        if (!card) return null;

        if (card.defaultImage) {
            // Some cards store a prefixed path (e.g., "characters/foo.webp" or "locations/foo.webp")
            // while others store only the filename (e.g., "spartan_training_ground.webp").
            // For locations, image_path may include subdirs like "alternate/221_b_baker_st.png".
            const defaultImage = String(card.defaultImage);
            if (card.type === 'location') {
                const path = `/src/resources/cards/images/locations/${defaultImage}`;
                return maybeThumbnailForDeckTile(path, card);
            }
            if (defaultImage.includes('/')) {
                const path = `/src/resources/cards/images/${defaultImage}`;
                return maybeThumbnailForDeckTile(path, card);
            }
            if (card.type === 'character') {
                const path = `/src/resources/cards/images/characters/${defaultImage}`;
                return maybeThumbnailForDeckTile(path, card);
            }
            if (card.type === 'mission') {
                const path = `/src/resources/cards/images/missions/${defaultImage}`;
                return maybeThumbnailForDeckTile(path, card);
            }
            // Fallback for any other type (should be rare in deck list metadata)
            const path = `/src/resources/cards/images/${defaultImage}`;
            return maybeThumbnailForDeckTile(path, card);
        }

        // Fallback: construct from card name
        const cardName = (card.name || '').toLowerCase();
        if (!cardName) return null;

        const snakeCaseName = cardName.replace(/[^a-z0-9]/g, '_');
        if (card.type === 'location') {
            const path = `/src/resources/cards/images/locations/${snakeCaseName}.webp`;
            return maybeThumbnailForDeckTile(path, card);
        }
        if (card.type === 'mission') {
            const path = `/src/resources/cards/images/missions/${snakeCaseName}.webp`;
            return maybeThumbnailForDeckTile(path, card);
        }
        const path = `/src/resources/cards/images/characters/${snakeCaseName}.webp`;
        return maybeThumbnailForDeckTile(path, card);
    };

    // Optional deck background image (same path format used by deck editor background manager)
    window.DeckSelection.getDeckTileBackgroundInfo = (backgroundImagePath) => {
        const deckTileBackgroundPath = backgroundImagePath || null;
        const deckTileBackgroundUrl = deckTileBackgroundPath
            ? `/${String(deckTileBackgroundPath).replace(/'/g, '%27')}`
            : null;
        const deckTileBackgroundClass = deckTileBackgroundUrl ? ' deck-tile--has-bg' : '';
        const deckTileBackgroundStyle = deckTileBackgroundUrl
            ? ` style="--deck-tile-bg: url('${deckTileBackgroundUrl}')"`
            : '';

        return {
            deckTileBackgroundUrl,
            deckTileBackgroundClass,
            deckTileBackgroundStyle,
        };
    };
})();

