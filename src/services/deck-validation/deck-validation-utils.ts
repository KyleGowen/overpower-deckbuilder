import type { DeckCard } from '../../types';

/** API / editor deck rows use hyphenated types; map keys use underscores. */
export function deckCardTypeKeyPrefix(type: string): string {
    return type.replace(/-/g, '_');
}

export function deckCardMapKey(card: Pick<DeckCard, 'type' | 'cardId'>): string {
    return `${deckCardTypeKeyPrefix(card.type)}_${card.cardId}`;
}

export function characterThreatValue(availableCard: { threat?: number; threat_level?: number }): number {
    const t = availableCard.threat ?? availableCard.threat_level;
    return typeof t === 'number' ? t : 0;
}

export function statForPowerType(
    char: { energy: number; combat: number; brute_force: number; intelligence: number },
    powerType: string
): number {
    switch (powerType) {
        case 'Energy':
            return char.energy;
        case 'Combat':
            return char.combat;
        case 'Brute Force':
            return char.brute_force;
        case 'Intelligence':
            return char.intelligence;
        case 'Any-Power':
            return Math.max(char.energy, char.combat, char.brute_force, char.intelligence);
        default:
            return 0;
    }
}

export function specialLinkedCharacterName(special: {
    character?: string;
    character_name?: string;
    characters?: string[];
}): string {
    const primary = (special.character || special.character_name || '').trim();
    if (primary) return primary;
    if (Array.isArray(special.characters) && special.characters.length > 0) {
        return special.characters[0].trim();
    }
    return '';
}

export function teamHasSpecialCharacter(characterNames: string[], linkedName: string, extras: string[]): boolean {
    if (characterNames.includes(linkedName)) return true;
    return extras.some((e) => characterNames.includes(e));
}

export function normalizeAngryMobVariant(v: string): string {
    return v.toLowerCase().replace(/\s+/g, ' ').trim().replace(/s$/, '');
}
