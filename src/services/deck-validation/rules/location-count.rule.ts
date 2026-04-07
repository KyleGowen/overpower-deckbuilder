import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import { deckValidationMessages } from '../deck-validation-messages';

export class LocationCountRule implements DeckValidationRule {
    readonly id = 'location_count';

    validate(ctx: DeckValidationContext): ValidationError[] {
        const locationCount = ctx.locationCards.reduce((sum, card) => sum + (card.quantity || 1), 0);
        if (locationCount > 1) {
            return [
                {
                    rule: 'location_count',
                    message: deckValidationMessages.locationCount(locationCount)
                }
            ];
        }
        return [];
    }
}
