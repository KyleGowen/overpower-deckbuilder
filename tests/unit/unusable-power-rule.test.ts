import { UnusablePowerRule } from '../../src/services/deck-validation/rules/unusable-power.rule';
import type { DeckValidationContext } from '../../src/services/deck-validation/deck-validation-context';
import { deckCardMapKey } from '../../src/services/deck-validation/deck-validation-utils';
import type { DeckCard } from '../../src/types';

function makeCtx(powerRows: DeckCard[], map: Map<string, Record<string, unknown>>): DeckValidationContext {
    return {
        cards: powerRows,
        availableCardsMap: map,
        characterCards: [],
        missionCards: [],
        eventCards: [],
        locationCards: [],
        battlegroundCards: [],
        characterNames: [],
        characterStats: [
            { name: 'Weak', energy: 2, combat: 2, brute_force: 2, intelligence: 2 }
        ],
        angryMobCharacterNames: []
    };
}

describe('UnusablePowerRule', () => {
    const rule = new UnusablePowerRule();

    it('does not flag Multi Power or Multi-Power when no character meets the printed value', () => {
        const deckCard: DeckCard = { id: 'p1', type: 'power', cardId: 'mp5', quantity: 1 };
        const map = new Map<string, Record<string, unknown>>();
        map.set(deckCardMapKey(deckCard), {
            name: '5 - Multi Power',
            power_type: 'Multi Power',
            value: 5
        });
        const ctx = makeCtx([deckCard], map);
        expect(rule.validate(ctx)).toEqual([]);
    });

    it('does not flag legacy Multi-Power string', () => {
        const deckCard: DeckCard = { id: 'p1', type: 'power', cardId: 'mp3', quantity: 1 };
        const map = new Map<string, Record<string, unknown>>();
        map.set(deckCardMapKey(deckCard), {
            name: '3 - Multi-Power',
            power_type: 'Multi-Power',
            value: 3
        });
        const ctx = makeCtx([deckCard], map);
        expect(rule.validate(ctx)).toEqual([]);
    });

    it('still flags typed power when grid is too low', () => {
        const deckCard: DeckCard = { id: 'p1', type: 'power', cardId: 'e5', quantity: 1 };
        const map = new Map<string, Record<string, unknown>>();
        map.set(deckCardMapKey(deckCard), {
            name: '5 - Energy',
            power_type: 'Energy',
            value: 5
        });
        const ctx = makeCtx([deckCard], map);
        const errors = rule.validate(ctx);
        expect(errors).toHaveLength(1);
        expect(errors[0].rule).toBe('unusable_power');
        expect(errors[0].message).toContain('5+ Energy');
    });
});
