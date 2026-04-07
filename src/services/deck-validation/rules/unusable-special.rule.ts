import type { DeckValidationRule } from '../deck-validation-rule';
import type { ValidationError } from '../validation-error';
import type { DeckValidationContext } from '../deck-validation-context';
import {
    deckCardMapKey,
    normalizeAngryMobVariant,
    specialLinkedCharacterName,
    teamHasSpecialCharacter
} from '../deck-validation-utils';
import { deckValidationMessages } from '../deck-validation-messages';

export class UnusableSpecialRule implements DeckValidationRule {
    readonly id = 'unusable_special';

    validate(ctx: DeckValidationContext): ValidationError[] {
        const errors: ValidationError[] = [];
        const deckSpecialCards = ctx.cards.filter(card => card.type === 'special');
        const angryMobCharacters = ctx.angryMobCharacterNames;

        for (const card of deckSpecialCards) {
            const availableCard = ctx.availableCardsMap.get(deckCardMapKey(card));
            if (!availableCard) continue;

            const cardName = (availableCard.name as string) || 'Unknown Card';
            const characterName = specialLinkedCharacterName(
                availableCard as { character?: string; character_name?: string; characters?: string[] }
            );
            const extraChars = Array.isArray((availableCard as { characters?: string[] }).characters)
                ? ((availableCard as { characters?: string[] }).characters as string[])
                : [];

            if (characterName && characterName !== 'Any Character') {
                if (characterName.startsWith('Angry Mob')) {
                    if (angryMobCharacters.length === 0) {
                        errors.push({
                            rule: 'unusable_special',
                            message: deckValidationMessages.unusableSpecialNeedsAngryMob(cardName)
                        });
                    } else {
                        const hasVariantQualifier =
                            characterName.includes(':') || characterName.includes(' - ');
                        if (hasVariantQualifier) {
                            const separator = characterName.includes(':') ? ':' : ' - ';
                            const specialVariant = characterName.split(separator)[1].trim();
                            const normalizedSpecialVariant = normalizeAngryMobVariant(specialVariant);

                            const hasMatchingVariant = angryMobCharacters.some(charName => {
                                const variantMatch = charName.match(/\(([^)]+)\)/);
                                if (!variantMatch) return false;
                                const charVariant = normalizeAngryMobVariant(variantMatch[1]);
                                return charVariant === normalizedSpecialVariant;
                            });

                            if (!hasMatchingVariant) {
                                errors.push({
                                    rule: 'unusable_special',
                                    message: deckValidationMessages.unusableSpecialAngryMobVariant(
                                        cardName,
                                        specialVariant
                                    )
                                });
                            }
                        }
                    }
                } else {
                    if (!teamHasSpecialCharacter(ctx.characterNames, characterName, extraChars)) {
                        errors.push({
                            rule: 'unusable_special',
                            message: deckValidationMessages.unusableSpecialNeedsCharacter(cardName, characterName)
                        });
                    }
                }
            }
        }
        return errors;
    }
}
