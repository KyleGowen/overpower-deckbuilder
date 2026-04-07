import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import { deckCardMapKey, deckCardTypeKeyPrefix, statForPowerType } from '../deck-validation-utils';
import { deckValidationMessages } from '../deck-validation-messages';

export class UnusableTeamworkRule implements DeckValidationRule {
    readonly id = 'unusable_universe_teamwork';

    validate(ctx: DeckValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const teamworkDeck = ctx.cards.filter(c => deckCardTypeKeyPrefix(c.type) === 'teamwork');
        for (const card of teamworkDeck) {
            const availableCard = ctx.availableCardsMap.get(deckCardMapKey(card));
            if (!availableCard) continue;

            const cardName = (availableCard.name as string) || 'Unknown Card';
            const toUse = (availableCard.to_use as string) || '';
            const toUseMatch = toUse.match(/(\d+)\s+(Energy|Combat|Brute Force|Intelligence|Any-Power)/);
            if (!toUseMatch) continue;

            const requiredValue = parseInt(toUseMatch[1], 10);
            const powerType = toUseMatch[2];
            const canUse = ctx.characterStats.some(char => statForPowerType(char, powerType) >= requiredValue);

            if (!canUse) {
                errors.push({
                    rule: 'unusable_universe',
                    message: deckValidationMessages.unusableUniverseGrid(cardName, requiredValue, powerType)
                });
            }
        }
        return errors;
    }
}
