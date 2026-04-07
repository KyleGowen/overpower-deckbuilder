import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import { deckValidationMessages } from '../deck-validation-messages';

export class DeckSizeRule implements DeckValidationRule {
    readonly id = 'deck_size';

    validate(ctx: DeckValidationContext): ValidationError[] {
        const requiredSize = ctx.eventCards.length > 0 ? 56 : 51;
        const totalCards = ctx.cards.reduce((sum, card) => sum + card.quantity, 0);
        if (totalCards < requiredSize) {
            return [
                {
                    rule: 'deck_size',
                    message: deckValidationMessages.deckSize(requiredSize, totalCards)
                }
            ];
        }
        return [];
    }
}
