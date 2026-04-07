import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import { deckValidationMessages } from '../deck-validation-messages';

export class CharacterCountRule implements DeckValidationRule {
    readonly id = 'character_count';

    validate(ctx: DeckValidationContext): ValidationError[] {
        const characterCount = ctx.characterCards.reduce((sum, card) => sum + (card.quantity || 1), 0);
        if (characterCount !== 4) {
            return [{ rule: 'character_count', message: deckValidationMessages.characterCount(characterCount) }];
        }
        return [];
    }
}
