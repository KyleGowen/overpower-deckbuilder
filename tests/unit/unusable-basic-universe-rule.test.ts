import { UnusableBasicUniverseRule } from '../../src/services/deck-validation/rules/unusable-basic-universe.rule';
import type { DeckValidationContext } from '../../src/services/deck-validation/deck-validation-context';
import { deckCardMapKey } from '../../src/services/deck-validation/deck-validation-utils';
import type { DeckCard } from '../../src/types';

function makeCtx(characterName: string): DeckValidationContext {
    const basicCard: DeckCard = {
        id: 'deck-basic-1',
        type: 'basic-universe',
        cardId: 'basic-1',
        quantity: 1
    };
    const availableCardsMap = new Map<string, Record<string, unknown>>();
    availableCardsMap.set(deckCardMapKey(basicCard), {
        card_name: 'Energy 8 or greater',
        basic_skill_type: 'Energy',
        value_to_use: '8 or greater'
    });

    return {
        cards: [basicCard],
        availableCardsMap,
        characterCards: [],
        missionCards: [],
        eventCards: [],
        locationCards: [],
        characterNames: [characterName],
        characterStats: [
            { name: characterName, energy: 2, combat: 3, brute_force: 3, intelligence: 5 }
        ],
        angryMobCharacterNames: []
    };
}

describe('UnusableBasicUniverseRule', () => {
    const rule = new UnusableBasicUniverseRule();

    it('flags a Basic Universe card when the team does not meet its grid', () => {
        const errors = rule.validate(makeCtx('Generic Hero'));
        expect(errors).toHaveLength(1);
        expect(errors[0].rule).toBe('unusable_universe');
    });

    it('allows Glenn to ignore all Basic Universe grid requirements', () => {
        expect(rule.validate(makeCtx('Glenn'))).toEqual([]);
    });
});
