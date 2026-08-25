import type { DeckValidationRule } from '../deck-validation-rule';
import type { DeckValidationContext } from '../deck-validation-context';
import type { ValidationError } from '../validation-error';
import { deckValidationMessages } from '../deck-validation-messages';
import {
    deckCardMapKey,
    deckHasBattlegroundNamed,
    GLOBAL_DEFENSE_AGENCY_BATTLEGROUND_NAME,
    isAnyCharacterSpecial,
    isGdaAnyCharacterSpecial
} from '../deck-validation-utils';

export class GdaAnyCharacterBattlegroundRule implements DeckValidationRule {
    readonly id = 'gda_any_character_requires_battleground';

    validate(ctx: DeckValidationContext): ValidationError[] {
        const anyCharacterSpecials = ctx.cards
            .filter(card => card.type === 'special' && card.quantity > 0)
            .map(card => ctx.availableCardsMap.get(deckCardMapKey(card)))
            .filter((card): card is Record<string, unknown> => Boolean(card))
            .filter(isAnyCharacterSpecial);
        const hasGdaAnyCharacterSpecial = anyCharacterSpecials.some(isGdaAnyCharacterSpecial);

        if (!hasGdaAnyCharacterSpecial) {
            return [];
        }

        const errors: ValidationError[] = [];
        if (!deckHasBattlegroundNamed(ctx, GLOBAL_DEFENSE_AGENCY_BATTLEGROUND_NAME)) {
            errors.push({
                rule: this.id,
                message: deckValidationMessages.gdaAnyCharacterNeedsBattleground()
            });
        }

        if (anyCharacterSpecials.some(card => !isGdaAnyCharacterSpecial(card))) {
            errors.push({
                rule: 'gda_any_character_exclusive',
                message: deckValidationMessages.gdaAnyCharacterCannotMix()
            });
        }

        return errors;
    }
}
