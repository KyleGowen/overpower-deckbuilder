import type { DeckCard } from '../../types';
import { deckCardMapKey } from './deck-validation-utils';

export interface CharacterStatRow {
    name: string;
    energy: number;
    combat: number;
    brute_force: number;
    intelligence: number;
}

export interface DeckValidationContext {
    cards: DeckCard[];
    availableCardsMap: Map<string, Record<string, unknown>>;
    characterCards: DeckCard[];
    missionCards: DeckCard[];
    eventCards: DeckCard[];
    locationCards: DeckCard[];
    characterNames: string[];
    characterStats: CharacterStatRow[];
    angryMobCharacterNames: string[];
}

export function buildDeckValidationContext(
    cards: DeckCard[],
    availableCardsMap: Map<string, Record<string, unknown>>
): DeckValidationContext {
    const characterCards = cards.filter(card => card.type === 'character');
    const missionCards = cards.filter(card => card.type === 'mission');
    const eventCards = cards.filter(card => card.type === 'event');
    const locationCards = cards.filter(card => card.type === 'location');

    const characterNames = characterCards.map(card => {
        const availableCard = availableCardsMap.get(deckCardMapKey(card));
        return availableCard ? (availableCard.name as string) : 'Unknown';
    });

    const characterStats = characterCards
        .map(card => {
            const availableCard = availableCardsMap.get(deckCardMapKey(card));
            return availableCard
                ? {
                      name: availableCard.name as string,
                      energy: (availableCard.energy as number) || 0,
                      combat: (availableCard.combat as number) || 0,
                      brute_force: (availableCard.brute_force as number) || 0,
                      intelligence: (availableCard.intelligence as number) || 0
                  }
                : null;
        })
        .filter((char): char is NonNullable<typeof char> => char !== null);

    const angryMobCharacterNames = characterNames.filter(name => name.startsWith('Angry Mob'));

    return {
        cards,
        availableCardsMap,
        characterCards,
        missionCards,
        eventCards,
        locationCards,
        characterNames,
        characterStats,
        angryMobCharacterNames
    };
}
