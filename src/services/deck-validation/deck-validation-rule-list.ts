import type { DeckValidationRule } from './deck-validation-rule';

/**
 * Immutable ordered list of validation rules. Iteration order is validation order.
 * No mutation APIs — construct once via {@link DeckValidationRuleList.of}.
 */
export class DeckValidationRuleList implements Iterable<DeckValidationRule> {
    private readonly rules: readonly DeckValidationRule[];

    private constructor(rules: readonly DeckValidationRule[]) {
        this.rules = Object.freeze([...rules]);
    }

    /**
     * Preserves argument order. Each rule should be a distinct instance.
     */
    static of(...rules: DeckValidationRule[]): DeckValidationRuleList {
        return new DeckValidationRuleList(rules);
    }

    [Symbol.iterator](): Iterator<DeckValidationRule> {
        return this.rules[Symbol.iterator]();
    }

    forEach(fn: (rule: DeckValidationRule, index: number) => void): void {
        this.rules.forEach(fn);
    }

    get length(): number {
        return this.rules.length;
    }
}
