import type { DeckValidationRule } from '../deck-validation-rule';
import type { DeckValidationContext } from '../deck-validation-context';
import type { ValidationError } from '../validation-error';
import { deckValidationMessages } from '../deck-validation-messages';
import {
    deckCardMapKey,
    deckHasLocationNamed,
    GLOBAL_DEFENSE_AGENCY_BATTLEGROUND_NAME,
    isGdaAnyCharacterSpecial
} from '../deck-validation-utils';

export class GdaAnyCharacterBattlegroundRule implements DeckValidationRule {
    readonly id = 'gda_any_character_requires_battleground';

    validate(ctx: DeckValidationContext): ValidationError[] {
        const hasGdaAnyCharacterSpecial = ctx.cards
            .filter(card => card.type === 'special' && card.quantity > 0)
            .some(card => {
                const availableCard = ctx.availableCardsMap.get(deckCardMapKey(card));
                return Boolean(availableCard && isGdaAnyCharacterSpecial(availableCard));
            });

        if (
            !hasGdaAnyCharacterSpecial
            || deckHasLocationNamed(ctx, GLOBAL_DEFENSE_AGENCY_BATTLEGROUND_NAME)
        ) {
            return [];
        }

        return [{
            rule: this.id,
            message: deckValidationMessages.gdaAnyCharacterNeedsBattleground()
        }];
    }
}
