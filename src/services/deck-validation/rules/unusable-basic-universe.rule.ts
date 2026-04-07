import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import { deckCardMapKey, deckCardTypeKeyPrefix, statForPowerType } from '../deck-validation-utils';
import { deckValidationMessages } from '../deck-validation-messages';

export class UnusableBasicUniverseRule implements DeckValidationRule {
    readonly id = 'unusable_universe_basic';

    validate(ctx: DeckValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const basicDeck = ctx.cards.filter(c => deckCardTypeKeyPrefix(c.type) === 'basic_universe');
        for (const card of basicDeck) {
            const availableCard = ctx.availableCardsMap.get(deckCardMapKey(card));
            if (!availableCard) continue;

            const cardName =
                (availableCard.card_name as string) || (availableCard.name as string) || 'Unknown Card';
            const buType = (availableCard.basic_skill_type as string) || '';
            const buMatch = String(availableCard.value_to_use || '').match(/(\d+)\s*or\s*greater/i);
            const requiredValue = buMatch ? parseInt(buMatch[1], 10) : 0;

            if (!buType || requiredValue <= 0) continue;

            const canUse = ctx.characterStats.some(char => statForPowerType(char, buType) >= requiredValue);
            if (!canUse) {
                errors.push({
                    rule: 'unusable_universe',
                    message: deckValidationMessages.unusableUniverseGrid(cardName, requiredValue, buType)
                });
            }
        }
        return errors;
    }
}
