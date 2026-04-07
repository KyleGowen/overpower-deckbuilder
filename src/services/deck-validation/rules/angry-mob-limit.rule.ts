import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import { deckValidationMessages } from '../deck-validation-messages';

export class AngryMobLimitRule implements DeckValidationRule {
    readonly id = 'angry_mob_limit';

    validate(ctx: DeckValidationContext): ValidationError[] {
        if (ctx.angryMobCharacterNames.length > 1) {
            return [
                {
                    rule: 'angry_mob_limit',
                    message: deckValidationMessages.angryMobLimit()
                }
            ];
        }
        return [];
    }
}
