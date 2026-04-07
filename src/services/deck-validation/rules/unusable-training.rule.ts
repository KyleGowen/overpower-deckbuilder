import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import { deckCardMapKey, deckCardTypeKeyPrefix, trainingTypeAtOrBelowCap } from '../deck-validation-utils';
import { deckValidationMessages } from '../deck-validation-messages';

export class UnusableTrainingRule implements DeckValidationRule {
    readonly id = 'unusable_universe_training';

    validate(ctx: DeckValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const trainingDeck = ctx.cards.filter(c => deckCardTypeKeyPrefix(c.type) === 'training');
        for (const card of trainingDeck) {
            const availableCard = ctx.availableCardsMap.get(deckCardMapKey(card));
            if (!availableCard) continue;

            const cardName =
                (availableCard.card_name as string) || (availableCard.name as string) || 'Unknown Card';
            const type1 = (availableCard.type_1 as string) || '';
            const type2 = (availableCard.type_2 as string) || '';
            const valueMatch = String(availableCard.value_to_use || '').match(/(\d+)/);
            const cap = valueMatch ? parseInt(valueMatch[1], 10) : 0;

            if (!type1 || !type2 || cap <= 0) continue;

            const canUse = ctx.characterStats.some(char => {
                return trainingTypeAtOrBelowCap(char, type1, cap) || trainingTypeAtOrBelowCap(char, type2, cap);
            });

            if (!canUse) {
                errors.push({
                    rule: 'unusable_universe',
                    message: deckValidationMessages.unusableTraining(cardName, type1, type2, cap)
                });
            }
        }
        return errors;
    }
}
