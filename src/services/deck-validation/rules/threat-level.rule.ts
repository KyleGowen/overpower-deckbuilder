import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import { characterThreatValue, deckCardMapKey } from '../deck-validation-utils';
import { deckValidationMessages } from '../deck-validation-messages';

export class ThreatLevelRule implements DeckValidationRule {
    readonly id = 'threat_level';

    validate(ctx: DeckValidationContext): ValidationError[] {
        let totalThreat = 0;
        ctx.characterCards.forEach(card => {
            const availableCard = ctx.availableCardsMap.get(deckCardMapKey(card));
            if (availableCard) {
                const th = characterThreatValue(availableCard as { threat?: number; threat_level?: number });
                if (th) {
                    totalThreat += th * (card.quantity || 1);
                }
            }
        });
        if (totalThreat > 76) {
            return [
                {
                    rule: 'threat_level',
                    message: deckValidationMessages.threatLevel(totalThreat)
                }
            ];
        }
        return [];
    }
}
