import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import { deckCardMapKey } from '../deck-validation-utils';
import { deckValidationMessages } from '../deck-validation-messages';

export class BannedCardsRule implements DeckValidationRule {
    readonly id = 'banned_card';

    validate(ctx: DeckValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        for (const card of ctx.cards) {
            const availableCard = ctx.availableCardsMap.get(deckCardMapKey(card));
            if (availableCard && availableCard.banned === true) {
                const cardName = (availableCard.name as string) || 'Unknown Card';
                errors.push({ rule: 'banned_card', message: deckValidationMessages.bannedCard(cardName) });
            }
        }
        return errors;
    }
}
