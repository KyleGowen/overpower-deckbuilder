import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import { deckCardMapKey } from '../deck-validation-utils';
import { deckValidationMessages } from '../deck-validation-messages';

export class OnePerDeckRule implements DeckValidationRule {
    readonly id = 'one_per_deck_violation';

    validate(ctx: DeckValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const onePerDeckCards: { [key: string]: number } = {};
        for (const card of ctx.cards) {
            const availableCard = ctx.availableCardsMap.get(deckCardMapKey(card));
            const isOnePerDeck =
                availableCard &&
                (availableCard.one_per_deck === true || availableCard.is_one_per_deck === true);
            if (isOnePerDeck) {
                const cardKey = deckCardMapKey(card);
                onePerDeckCards[cardKey] = (onePerDeckCards[cardKey] || 0) + (card.quantity || 1);
            }
        }

        for (const [cardKey, count] of Object.entries(onePerDeckCards)) {
            if (count > 1) {
                const availableCard = ctx.availableCardsMap.get(cardKey);
                const cardName = availableCard
                    ? ((availableCard.name || availableCard.card_name) as string)
                    : cardKey;
                errors.push({
                    rule: 'one_per_deck_violation',
                    message: deckValidationMessages.onePerDeckViolation(cardName, count)
                });
            }
        }
        return errors;
    }
}
