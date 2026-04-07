import { DeckValidationRuleList } from '../../src/services/deck-validation/deck-validation-rule-list';
import type { DeckValidationRule } from '../../src/services/deck-validation/deck-validation-rule';
import type { DeckValidationContext } from '../../src/services/deck-validation/deck-validation-context';
import type { ValidationError } from '../../src/services/deck-validation/validation-error';

describe('DeckValidationRuleList', () => {
    const makeRule = (id: string, tag: string): DeckValidationRule => ({
        id,
        validate(_ctx: DeckValidationContext): ValidationError[] {
            return [{ rule: id, message: tag }];
        }
    });

    it('iterates rules in construction order', () => {
        const list = DeckValidationRuleList.of(
            makeRule('a', '1'),
            makeRule('b', '2'),
            makeRule('c', '3')
        );
        const seen: string[] = [];
        for (const r of list) {
            seen.push(r.id);
        }
        expect(seen).toEqual(['a', 'b', 'c']);
    });

    it('forEach runs in order', () => {
        const list = DeckValidationRuleList.of(makeRule('x', ''), makeRule('y', ''));
        const ids: string[] = [];
        list.forEach((r) => ids.push(r.id));
        expect(ids).toEqual(['x', 'y']);
    });

    it('exposes length', () => {
        expect(DeckValidationRuleList.of(makeRule('1', ''), makeRule('2', '')).length).toBe(2);
    });
});
