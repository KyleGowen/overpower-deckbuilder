import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import { deckCardTypeKeyPrefix, deckHasLocationNamed } from '../deck-validation-utils';
import { deckValidationMessages } from '../deck-validation-messages';

const DRACULAS_ARMORY = "Dracula's Armory";
const MAX_PRE_PLACED = 3;

/**
 * When the deck contains the "Dracula's Armory" location, pre-placed Basic
 * Universe cards (`exclude_from_draw === true`) are capped at 3 total and must
 * be unique by cardId. Only enforced while the location is present.
 */
export class PrePlacedBasicUniverseRule implements DeckValidationRule {
    readonly id = 'pre_placed_basic_universe';

    validate(ctx: DeckValidationContext): ValidationError[] {
        if (!deckHasLocationNamed(ctx, DRACULAS_ARMORY)) return [];

        const prePlaced = ctx.cards.filter(
            (c) => deckCardTypeKeyPrefix(c.type) === 'basic_universe' && c.exclude_from_draw === true
        );

        const errors: ValidationError[] = [];

        const total = prePlaced.reduce((sum, c) => sum + (c.quantity || 1), 0);
        if (total > MAX_PRE_PLACED) {
            errors.push({
                rule: 'pre_placed_basic_universe_limit',
                message: deckValidationMessages.prePlacedBasicUniverseLimit(total)
            });
        }

        const countById = new Map<string, number>();
        for (const c of prePlaced) {
            countById.set(c.cardId, (countById.get(c.cardId) || 0) + (c.quantity || 1));
        }
        const hasDuplicate = Array.from(countById.values()).some((n) => n > 1);
        if (hasDuplicate) {
            errors.push({
                rule: 'pre_placed_basic_universe_unique',
                message: deckValidationMessages.prePlacedBasicUniverseUnique()
            });
        }

        return errors;
    }
}
