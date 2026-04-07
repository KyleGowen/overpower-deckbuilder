import { UnusableTrainingRule } from '../../src/services/deck-validation/rules/unusable-training.rule';
import type { CharacterStatRow, DeckValidationContext } from '../../src/services/deck-validation/deck-validation-context';
import { deckCardMapKey, statForPowerType, trainingTypeAtOrBelowCap } from '../../src/services/deck-validation/deck-validation-utils';
import type { DeckCard } from '../../src/types';

const zeusLike = { name: 'Zeus', energy: 8, combat: 6, brute_force: 8, intelligence: 5 };

function makeCtx(
    trainingRows: DeckCard[],
    map: Map<string, Record<string, unknown>>,
    characterStats: CharacterStatRow[]
): DeckValidationContext {
    return {
        cards: trainingRows,
        availableCardsMap: map,
        characterCards: [],
        missionCards: [],
        eventCards: [],
        locationCards: [],
        characterNames: [],
        characterStats,
        angryMobCharacterNames: []
    };
}

describe('trainingTypeAtOrBelowCap', () => {
    it('treats Any-Power as any primary stat at or below the cap (Sekhmet-style)', () => {
        expect(trainingTypeAtOrBelowCap(zeusLike, 'Any-Power', 5)).toBe(true);
    });

    it('rejects Any-Power when every primary stat is above the cap', () => {
        const allSix = { name: 'X', energy: 6, combat: 6, brute_force: 6, intelligence: 6 };
        expect(trainingTypeAtOrBelowCap(allSix, 'Any-Power', 5)).toBe(false);
    });

    it('still applies named types with a single grid value', () => {
        expect(trainingTypeAtOrBelowCap(zeusLike, 'Intelligence', 5)).toBe(true);
        expect(trainingTypeAtOrBelowCap(zeusLike, 'Energy', 5)).toBe(false);
    });
});

describe('statForPowerType Any-Power (power/teamwork)', () => {
    it('remains max of four stats for at-least gates', () => {
        expect(statForPowerType(zeusLike, 'Any-Power')).toBe(8);
    });
});

describe('UnusableTrainingRule', () => {
    const rule = new UnusableTrainingRule();

    it('allows Training (Any-Power) when one stat meets the cap even if max stat does not', () => {
        const deckCard: DeckCard = { id: 't1', type: 'training', cardId: 'training_sekhmet', quantity: 1 };
        const map = new Map<string, Record<string, unknown>>();
        map.set(deckCardMapKey(deckCard), {
            card_name: 'Training (Sekhmet)',
            type_1: 'Any-Power',
            type_2: 'Any-Power',
            value_to_use: '5 or less +5'
        });
        const ctx = makeCtx([deckCard], map, [zeusLike]);
        expect(rule.validate(ctx)).toEqual([]);
    });

    it('flags Training (Any-Power) when no character has any stat at or below the cap', () => {
        const deckCard: DeckCard = { id: 't1', type: 'training', cardId: 'training_sekhmet', quantity: 1 };
        const map = new Map<string, Record<string, unknown>>();
        map.set(deckCardMapKey(deckCard), {
            card_name: 'Training (Sekhmet)',
            type_1: 'Any-Power',
            type_2: 'Any-Power',
            value_to_use: '5 or less +5'
        });
        const allSix = { name: 'Brick', energy: 6, combat: 6, brute_force: 6, intelligence: 6 };
        const ctx = makeCtx([deckCard], map, [allSix]);
        const errors = rule.validate(ctx);
        expect(errors).toHaveLength(1);
        expect(errors[0].rule).toBe('unusable_universe');
        expect(errors[0].message).toContain('Training (Sekhmet)');
    });
});
