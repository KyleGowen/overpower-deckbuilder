import type { ValidationError } from './validation-error';
import type { DeckValidationContext } from './deck-validation-context';

export interface DeckValidationRule {
    readonly id: string;
    validate(ctx: DeckValidationContext): ValidationError[];
}
