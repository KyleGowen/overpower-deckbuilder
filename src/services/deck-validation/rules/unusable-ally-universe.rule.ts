import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import { deckCardMapKey, deckCardTypeKeyPrefix, statForPowerType } from '../deck-validation-utils';
import { deckValidationMessages } from '../deck-validation-messages';

export class UnusableAllyUniverseRule implements DeckValidationRule {
    readonly id = 'unusable_universe_ally';

    validate(ctx: DeckValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const allyDeck = ctx.cards.filter(c => deckCardTypeKeyPrefix(c.type) === 'ally_universe');
        const singleCharacterRowTeam = ctx.characterCards.length === 1;

        for (const card of allyDeck) {
            const availableCard = ctx.availableCardsMap.get(deckCardMapKey(card));
            if (!availableCard) continue;

            const cardName =
                (availableCard.card_name as string) || (availableCard.name as string) || 'Unknown Card';

            if (singleCharacterRowTeam) {
                errors.push({
                    rule: 'unusable_universe',
                    message: deckValidationMessages.unusableAllyNeedsTwoCharacters(cardName)
                });
                continue;
            }

            const statToUse = String(availableCard.stat_to_use || '');
            const statTypeToUse = String(availableCard.stat_type_to_use || '');
            const valueMatch = statToUse.match(/(\d+)\s+or\s+(less|higher)/i);
            if (!valueMatch || !statTypeToUse) continue;

            const requiredValue = parseInt(valueMatch[1], 10);
            const isLessThan = valueMatch[2].toLowerCase() === 'less';

            const canUse = ctx.characterStats.some(char => {
                const characterStat = statForPowerType(char, statTypeToUse);
                return isLessThan ? characterStat <= requiredValue : characterStat >= requiredValue;
            });

            if (!canUse) {
                const message = isLessThan
                    ? deckValidationMessages.unusableAllyStatLess(cardName, statTypeToUse, requiredValue)
                    : deckValidationMessages.unusableAllyStatHigher(cardName, requiredValue, statTypeToUse);
                errors.push({
                    rule: 'unusable_universe',
                    message
                });
            }
        }
        return errors;
    }
}
