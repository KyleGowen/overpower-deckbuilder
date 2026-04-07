import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import { deckCardMapKey } from '../deck-validation-utils';
import { deckValidationMessages } from '../deck-validation-messages';

export class UnusableEventRule implements DeckValidationRule {
    readonly id = 'unusable_event';

    validate(ctx: DeckValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        for (const card of ctx.eventCards) {
            const availableCard = ctx.availableCardsMap.get(deckCardMapKey(card));
            if (!availableCard) continue;

            const cardName = (availableCard.name as string) || 'Unknown Card';
            const missionSet = availableCard.mission_set as string | undefined;

            if (missionSet && missionSet !== 'Any-Mission') {
                const missionSets = new Set<string>();
                ctx.missionCards.forEach(missionCard => {
                    const missionAvailableCard = ctx.availableCardsMap.get(deckCardMapKey(missionCard));
                    if (missionAvailableCard && missionAvailableCard.mission_set) {
                        missionSets.add(missionAvailableCard.mission_set as string);
                    }
                });

                if (missionSets.size > 0 && !missionSets.has(missionSet)) {
                    errors.push({
                        rule: 'unusable_event',
                        message: deckValidationMessages.unusableEventMissionSet(cardName, missionSet)
                    });
                }
            }
        }
        return errors;
    }
}
