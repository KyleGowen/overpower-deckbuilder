import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import { deckCardMapKey, deckCardTypeKeyPrefix } from '../deck-validation-utils';
import { deckValidationMessages } from '../deck-validation-messages';

export class UnusableAspectRule implements DeckValidationRule {
    readonly id = 'unusable_aspect';

    validate(ctx: DeckValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const aspectDeck = ctx.cards.filter(c => deckCardTypeKeyPrefix(c.type) === 'aspect');
        const firstLocationCard = ctx.locationCards[0];
        const locationAvailable = firstLocationCard
            ? ctx.availableCardsMap.get(deckCardMapKey(firstLocationCard))
            : undefined;
        const homebaseName = String(
            (locationAvailable?.name as string) || (locationAvailable?.card_name as string) || ''
        ).trim();

        for (const card of aspectDeck) {
            const availableCard = ctx.availableCardsMap.get(deckCardMapKey(card));
            if (!availableCard) continue;

            const cardName =
                (availableCard.card_name as string) || (availableCard.name as string) || 'Unknown Card';
            const locField = String(availableCard.location || '').trim();

            if (!firstLocationCard) {
                errors.push({
                    rule: 'unusable_aspect',
                    message: deckValidationMessages.unusableAspectNeedsHomebase(cardName)
                });
                continue;
            }

            if (!locField) continue;

            const anyHomebase =
                /^any\s*homebase$/i.test(locField) || locField.toLowerCase().includes('any homebase');
            if (anyHomebase) continue;

            if (!homebaseName || locField.toLowerCase() !== homebaseName.toLowerCase()) {
                errors.push({
                    rule: 'unusable_aspect',
                    message: deckValidationMessages.unusableAspectNeedsHomebaseNamed(cardName, locField)
                });
            }
        }
        return errors;
    }
}
