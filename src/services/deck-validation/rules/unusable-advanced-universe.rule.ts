import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import { deckCardMapKey, deckCardTypeKeyPrefix } from '../deck-validation-utils';
import { deckValidationMessages } from '../deck-validation-messages';

export class UnusableAdvancedUniverseRule implements DeckValidationRule {
    readonly id = 'unusable_universe_advanced';

    validate(ctx: DeckValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const advancedDeck = ctx.cards.filter(c => deckCardTypeKeyPrefix(c.type) === 'advanced_universe');
        for (const card of advancedDeck) {
            const availableCard = ctx.availableCardsMap.get(deckCardMapKey(card));
            if (!availableCard) continue;

            const cardName = (availableCard.name as string) || 'Unknown Card';
            const auChar = String(availableCard.character || '').trim();

            if (auChar && auChar !== 'Any Character' && !ctx.characterNames.includes(auChar)) {
                errors.push({
                    rule: 'unusable_universe',
                    message: deckValidationMessages.unusableAdvancedNeedsCharacter(cardName, auChar)
                });
            }
        }
        return errors;
    }
}
