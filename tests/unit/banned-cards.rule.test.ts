import { BannedCardsRule } from '../../src/services/deck-validation/rules/banned-cards.rule';
import type { DeckValidationContext } from '../../src/services/deck-validation/deck-validation-context';
import type { DeckCard } from '../../src/types';
import { deckCardMapKey } from '../../src/services/deck-validation/deck-validation-utils';

function ctxWithSpecial(deckCard: DeckCard, available: Record<string, unknown>): DeckValidationContext {
    const availableCardsMap = new Map<string, Record<string, unknown>>();
    availableCardsMap.set(deckCardMapKey(deckCard), available);
    return {
        cards: [deckCard],
        availableCardsMap,
        characterCards: [],
        missionCards: [],
        eventCards: [],
        locationCards: [],
        characterNames: [],
        characterStats: [],
        angryMobCharacterNames: []
    };
}

describe('BannedCardsRule', () => {
    const rule = new BannedCardsRule();

    it('emits banned_card when catalog row has banned true', () => {
        const deckCard: DeckCard = { id: 'deck-sp-1', type: 'special', cardId: 'sp-1', quantity: 1 };
        const c = ctxWithSpecial(deckCard, { name: 'Kali: Goddess of War', banned: true });
        const errors = rule.validate(c);
        expect(errors).toHaveLength(1);
        expect(errors[0].rule).toBe('banned_card');
        expect(errors[0].message).toContain('Kali');
    });

    it('passes when banned is false', () => {
        const deckCard: DeckCard = { id: 'deck-sp-2', type: 'special', cardId: 'sp-2', quantity: 1 };
        const c = ctxWithSpecial(deckCard, { name: 'Safe Special', banned: false });
        expect(rule.validate(c)).toEqual([]);
    });

    it('passes when catalog entry missing', () => {
        const deckCard: DeckCard = { id: 'deck-missing', type: 'special', cardId: 'missing', quantity: 1 };
        const availableCardsMap = new Map<string, Record<string, unknown>>();
        const c: DeckValidationContext = {
            cards: [deckCard],
            availableCardsMap,
            characterCards: [],
            missionCards: [],
            eventCards: [],
            locationCards: [],
            characterNames: [],
            characterStats: [],
            angryMobCharacterNames: []
        };
        expect(rule.validate(c)).toEqual([]);
    });

    it('uses deckCardMapKey shape (hyphen type in deck row)', () => {
        const deckCard: DeckCard = { id: 'deck-au-1', type: 'advanced-universe', cardId: 'au-1', quantity: 1 };
        const key = deckCardMapKey(deckCard);
        const availableCardsMap = new Map<string, Record<string, unknown>>();
        availableCardsMap.set(key, { name: 'Bad AU', banned: true });
        const c: DeckValidationContext = {
            cards: [deckCard],
            availableCardsMap,
            characterCards: [],
            missionCards: [],
            eventCards: [],
            locationCards: [],
            characterNames: [],
            characterStats: [],
            angryMobCharacterNames: []
        };
        const errors = rule.validate(c);
        expect(errors).toHaveLength(1);
        expect(errors[0].rule).toBe('banned_card');
    });
});
