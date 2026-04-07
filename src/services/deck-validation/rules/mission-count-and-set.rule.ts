import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import { deckCardMapKey } from '../deck-validation-utils';
import { deckValidationMessages } from '../deck-validation-messages';

/** Emits `mission_count` and/or `mission_set`; class id is `mission_deck` per plan. */
export class MissionCountAndSetRule implements DeckValidationRule {
    readonly id = 'mission_deck';

    validate(ctx: DeckValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const missionCount = ctx.missionCards.reduce((sum, card) => sum + (card.quantity || 1), 0);
        if (missionCount !== 7) {
            errors.push({
                rule: 'mission_count',
                message: deckValidationMessages.missionCount(missionCount)
            });
            return errors;
        }

        const missionSets = new Set<string>();
        ctx.missionCards.forEach(card => {
            const availableCard = ctx.availableCardsMap.get(deckCardMapKey(card));
            if (availableCard && availableCard.mission_set) {
                missionSets.add(availableCard.mission_set as string);
            }
        });
        if (missionSets.size > 1) {
            errors.push({
                rule: 'mission_set',
                message: deckValidationMessages.missionSetMixed(Array.from(missionSets))
            });
        }
        return errors;
    }
}
