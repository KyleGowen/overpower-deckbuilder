import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import { deckValidationMessages } from '../deck-validation-messages';

export class BattlegroundCountRule implements DeckValidationRule {
    readonly id = 'battleground_count';

    validate(ctx: DeckValidationContext): ValidationError[] {
        const count = ctx.battlegroundCards.reduce((sum, card) => sum + (card.quantity || 1), 0);
        return count > 1
            ? [{ rule: this.id, message: deckValidationMessages.battlegroundCount(count) }]
            : [];
    }
}
