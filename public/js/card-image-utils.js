// card-image-utils.js - Card image path utilities and ID mapping
// Extracted from public/index.html

// ===== mapDatabaseIdToDeckCardId, mapCardIdToDatabaseId, mapImagePathToActualFile, getCardImagePath =====

// CDN base URL injected by the server via /js/app-config.js (sets window.APP_CDN_BASE).
// In production this is the CloudFront domain; empty string in local dev.
// Card images are served from S3 via CloudFront in production and from local disk in dev.
const _CARD_IMAGE_CDN_BASE = (typeof window !== 'undefined' && window.APP_CDN_BASE || '').replace(/\/$/, '');

function mapDatabaseIdToDeckCardId(databaseId, cardType) {
    // This function is deprecated after UUID migration
    // We'll use a different approach based on card names or other attributes
    return null;
}

// Helper function to map card IDs to database IDs
// DEPRECATED: This function is no longer needed after UUID migration
// deck_cards.card_id now contains UUIDs that can be looked up directly
function mapCardIdToDatabaseId(cardId, cardType) {
    // This function is deprecated after UUID migration
    // deck_cards.card_id now contains UUIDs that can be looked up directly
    return null;
}

// Helper function to map database image paths to actual file paths
function mapImagePathToActualFile(imagePath) {
    if (!imagePath) return imagePath;
    
    // For all card types, the database now contains the full directory structure
    // like "characters/angry_mob_industrial_age.webp", "missions/the-warlord-of-mars/a_fighting_man_of_mars.webp", etc.
    // So we need to return the path after the first directory to preserve the directory structure
    
    // Check for common card type prefixes
    const prefixes = ['characters/', 'missions/', 'specials/', 'locations/', 'events/', 'aspects/', 'power-cards/', 'teamwork-universe/', 'ally-universe/', 'training-universe/', 'basic-universe/', 'advanced-universe/'];
    
    for (const prefix of prefixes) {
        if (imagePath.startsWith(prefix)) {
            return imagePath.substring(prefix.length);
        }
    }
    
    // Fallback: if no prefix matches, preserve the path as-is (may contain subdirs like alternate/)
    return imagePath;
}

// Convert full-res path to thumbnail path (characters, missions, locations).
// e.g. /src/resources/cards/images/characters/foo.webp → .../characters/thumb/foo.webp
// e.g. .../missions/setname/card.webp → .../missions/thumb/setname/card.webp
function toThumbnailPath(fullPath) {
    if (!fullPath || typeof fullPath !== 'string') return fullPath;
    const base = '/src/resources/cards/images/characters/';
    if (!fullPath.startsWith(base) || fullPath.includes('/thumb/')) return fullPath;
    const afterChars = fullPath.slice(base.length);
    const lastSlash = afterChars.lastIndexOf('/');
    const dir = lastSlash >= 0 ? afterChars.slice(0, lastSlash + 1) : '';
    const filename = lastSlash >= 0 ? afterChars.slice(lastSlash + 1) : afterChars;
    const baseName = filename.replace(/\.[^.]+$/, '');
    return base + 'thumb/' + dir + baseName + '.webp';
}

function toThumbnailPathForType(fullPath, type) {
    if (!fullPath || typeof fullPath !== 'string') return fullPath;
    const base = '/src/resources/cards/images/' + type + '/';
    if (!fullPath.startsWith(base) || fullPath.includes('/thumb/')) return fullPath;
    const afterBase = fullPath.slice(base.length);
    const lastSlash = afterBase.lastIndexOf('/');
    const dir = lastSlash >= 0 ? afterBase.slice(0, lastSlash + 1) : '';
    const filename = lastSlash >= 0 ? afterBase.slice(lastSlash + 1) : afterBase;
    const baseName = filename.replace(/\.[^.]+$/, '');
    return base + 'thumb/' + dir + baseName + '.webp';
}

// Ensure location alternate paths include locations/ folder (fixes /images/alternate/ -> /images/locations/alternate/)
function ensureLocationPathHasTypeFolder(path) {
    if (!path || typeof path !== 'string') return path;
    const badMatch = path.match(/^(\/src\/resources\/cards\/images\/)alternate\/(.+)$/);
    if (badMatch) {
        return badMatch[1] + 'locations/alternate/' + badMatch[2];
    }
    return path;
}

/** Images subdir under /src/resources/cards/images/ that has a thumb/ tree (matches generateCardThumbnails.ts). */
function thumbImageSubdirForCardType(cardType) {
    switch (cardType) {
        case 'character':
            return 'characters';
        case 'mission':
            return 'missions';
        case 'location':
            return 'locations';
        case 'special':
            return 'specials';
        case 'power':
            return 'power-cards';
        case 'event':
            return 'events';
        case 'aspect':
            return 'aspects';
        case 'advanced-universe':
        case 'advanced_universe':
            return 'advanced-universe';
        case 'teamwork':
            return 'teamwork-universe';
        case 'ally-universe':
        case 'ally_universe':
            return 'ally-universe';
        case 'training':
            return 'training-universe';
        case 'basic-universe':
        case 'basic_universe':
            return 'basic-universe';
        default:
            return null;
    }
}

// Internal path builder — returns a relative /src/resources/cards/images/... path.
// Use getCardImagePath() publicly; it applies the CDN prefix on top.
function _getCardImagePathRaw(card, cardType, options) {
    const useThumbnail = options && options.useThumbnail === true;
    function maybeThumbnail(path) {
        if (!useThumbnail || !path) return path;
        const folder = thumbImageSubdirForCardType(cardType);
        if (!folder) return path;
        return toThumbnailPathForType(path, folder);
    }
    function finalPath(path) {
        if (cardType === 'location') path = ensureLocationPathHasTypeFolder(path);
        return maybeThumbnail(path);
    }
    try {
        // After migration, alternate cards are separate cards, so we just use the card's image_path or image
        // Check for card.image_path first (for collection cards)
        if (card.image_path && typeof card.image_path === 'string' && card.image_path.trim() !== '') {
            const imagePath = card.image_path.trim();
            
            // If it's already a full path, use it directly (fix malformed paths missing card-type folder)
            if (imagePath.startsWith('/src/resources/cards/images/')) {
                // Fix: /images/alternate/xxx without locations/ causes 404 for location alternates
                const badAlternateMatch = imagePath.match(/^\/src\/resources\/cards\/images\/alternate\/(.+)$/);
                if (badAlternateMatch && cardType === 'location') {
                    return finalPath(`/src/resources/cards/images/locations/alternate/${badAlternateMatch[1]}`);
                }
                return finalPath(imagePath);
            }
            
            // If it's just a filename, construct the full path based on card type
                if (!imagePath.includes('/')) {
                switch (cardType) {
                    case 'character':
                        return maybeThumbnail(`/src/resources/cards/images/characters/${imagePath}`);
                    case 'special':
                        return maybeThumbnail(`/src/resources/cards/images/specials/${imagePath}`);
                    case 'power':
                        return maybeThumbnail(`/src/resources/cards/images/power-cards/${imagePath}`);
                    case 'location':
                        return finalPath(`/src/resources/cards/images/locations/${imagePath}`);
                    case 'mission':
                        return maybeThumbnail(`/src/resources/cards/images/missions/${imagePath}`);
                    case 'event':
                        return maybeThumbnail(`/src/resources/cards/images/events/${imagePath}`);
                    case 'aspect':
                        return maybeThumbnail(`/src/resources/cards/images/aspects/${imagePath}`);
                    case 'advanced-universe':
                    case 'advanced_universe':
                        return maybeThumbnail(`/src/resources/cards/images/advanced-universe/${imagePath}`);
                    case 'teamwork':
                        return maybeThumbnail(`/src/resources/cards/images/teamwork-universe/${imagePath}`);
                    case 'ally-universe':
                    case 'ally_universe':
                        return maybeThumbnail(`/src/resources/cards/images/ally-universe/${imagePath}`);
                    case 'training':
                        return maybeThumbnail(`/src/resources/cards/images/training-universe/${imagePath}`);
                    case 'basic-universe':
                    case 'basic_universe':
                        return maybeThumbnail(`/src/resources/cards/images/basic-universe/${imagePath}`);
                    default:
                        return '/src/resources/cards/images/placeholder.webp';
                }
            }
            
            // If it has a partial path (e.g. "alternate/draculas_armory.png"), prepend card-type folder when missing
            if (imagePath.includes('/') && !imagePath.startsWith('/')) {
                const typePrefixes = ['characters/', 'missions/', 'specials/', 'locations/', 'events/', 'aspects/', 'power-cards/', 'teamwork-universe/', 'ally-universe/', 'training-universe/', 'basic-universe/', 'advanced-universe/'];
                const hasTypePrefix = typePrefixes.some(p => imagePath.startsWith(p));
                const typeToFolder = {
                    'character': 'characters', 'special': 'specials', 'power': 'power-cards',
                    'location': 'locations', 'mission': 'missions', 'event': 'events', 'aspect': 'aspects',
                    'advanced-universe': 'advanced-universe', 'advanced_universe': 'advanced-universe',
                    'teamwork': 'teamwork-universe', 'ally-universe': 'ally-universe', 'ally_universe': 'ally-universe',
                    'training': 'training-universe', 'basic-universe': 'basic-universe', 'basic_universe': 'basic-universe'
                };
                const folder = typeToFolder[cardType];
                const pathWithType = (!hasTypePrefix && folder) ? `${folder}/${imagePath}` : imagePath;
                return finalPath(`/src/resources/cards/images/${pathWithType}`);
            }
            
            return finalPath(imagePath);
        }
        
        // Use card.image field (from database image_path column)
        if (card.image) {
            const actualImagePath = mapImagePathToActualFile(card.image);
            
            // Construct full path based on card type
            switch (cardType) {
                case 'character':
                    return maybeThumbnail(`/src/resources/cards/images/characters/${actualImagePath}`);
                case 'special':
                    return maybeThumbnail(`/src/resources/cards/images/specials/${actualImagePath}`);
                case 'power':
                    return maybeThumbnail(`/src/resources/cards/images/power-cards/${actualImagePath}`);
                case 'location':
                    return finalPath(`/src/resources/cards/images/locations/${actualImagePath}`);
                case 'mission':
                    return maybeThumbnail(`/src/resources/cards/images/missions/${actualImagePath}`);
                case 'event':
                    return maybeThumbnail(`/src/resources/cards/images/events/${actualImagePath}`);
                case 'aspect':
                    return maybeThumbnail(`/src/resources/cards/images/aspects/${actualImagePath}`);
                case 'advanced-universe':
                case 'advanced_universe':
                    return maybeThumbnail(`/src/resources/cards/images/advanced-universe/${actualImagePath}`);
                case 'teamwork':
                    return maybeThumbnail(`/src/resources/cards/images/teamwork-universe/${actualImagePath}`);
                case 'ally-universe':
                case 'ally_universe':
                    return maybeThumbnail(`/src/resources/cards/images/ally-universe/${actualImagePath}`);
                case 'training':
                    return maybeThumbnail(`/src/resources/cards/images/training-universe/${actualImagePath}`);
                case 'basic-universe':
                case 'basic_universe':
                    return maybeThumbnail(`/src/resources/cards/images/basic-universe/${actualImagePath}`);
                default:
                    return '/src/resources/cards/images/placeholder.webp';
            }
        }
        
        // Fallback: try to construct from name for characters
        if (cardType === 'character') {
            const characterName = card.name || card.card_name || '';
            if (characterName) {
                const snakeCaseName = characterName.toLowerCase().replace(/[^a-z0-9]/g, '_');
                return maybeThumbnail(`/src/resources/cards/images/characters/${snakeCaseName}.webp`);
            }
        }
        
        // If no image field found, return a placeholder
        return `/src/resources/cards/images/placeholder.webp`;
    } catch (error) {
        console.error('Error getting card image path:', error);
        return `/src/resources/cards/images/placeholder.webp`;
    }
}
// Public entry point — wraps _getCardImagePathRaw and prepends the CDN base URL.
// In local dev (CDN_BASE_URL not set) the prefix is empty and paths stay relative,
// so Express static middleware serves images from disk as before.
function getCardImagePath(card, cardType, options) {
    const path = _getCardImagePathRaw(card, cardType, options);
    if (!path || !_CARD_IMAGE_CDN_BASE || path.startsWith('http')) return path;
    return _CARD_IMAGE_CDN_BASE + path;
}

// Export all functions to window for backward compatibility
window.mapDatabaseIdToDeckCardId = mapDatabaseIdToDeckCardId;
window.mapCardIdToDatabaseId = mapCardIdToDatabaseId;
window.mapImagePathToActualFile = mapImagePathToActualFile;
window.toThumbnailPath = toThumbnailPath;
window.toThumbnailPathForType = toThumbnailPathForType;
window.thumbImageSubdirForCardType = thumbImageSubdirForCardType;
window.getCardImagePath = getCardImagePath;
