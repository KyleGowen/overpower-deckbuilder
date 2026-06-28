import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import { deckCardTypeKeyPrefix, deckHasLocationNamed } from '../deck-validation-utils';
import { deckValidationMessages } from '../deck-validation-messages';

const SPARTAN_TRAINING_GROUND = 'Spartan Training Ground';
const MAX_PRE_PLACED = 3;

/**
 * When the deck contains the "Spartan Training Ground" location, pre-placed
 * Training cards (`exclude_from_draw === true`) are capped at 3 total and must
 * be unique by cardId. Only enforced while the location is present.
 */
export class PrePlacedTrainingRule implements DeckValidationRule {
    readonly id = 'pre_placed_training';

    validate(ctx: DeckValidationContext): ValidationError[] {
        if (!deckHasLocationNamed(ctx, SPARTAN_TRAINING_GROUND)) return [];

        const prePlaced = ctx.cards.filter(
            (c) => deckCardTypeKeyPrefix(c.type) === 'training' && c.exclude_from_draw === true
        );

        const errors: ValidationError[] = [];

        const total = prePlaced.reduce((sum, c) => sum + (c.quantity || 1), 0);
        if (total > MAX_PRE_PLACED) {
            errors.push({
                rule: 'pre_placed_training_limit',
                message: deckValidationMessages.prePlacedTrainingLimit(total)
            });
        }

        const countById = new Map<string, number>();
        for (const c of prePlaced) {
            countById.set(c.cardId, (countById.get(c.cardId) || 0) + (c.quantity || 1));
        }
        const hasDuplicate = Array.from(countById.values()).some((n) => n > 1);
        if (hasDuplicate) {
            errors.push({
                rule: 'pre_placed_training_unique',
                message: deckValidationMessages.prePlacedTrainingUnique()
            });
        }

        return errors;
    }
}
