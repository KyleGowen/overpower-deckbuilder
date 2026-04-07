/* ========================================
 * PHASE 10B: VALIDATION AND CALCULATION FUNCTIONS
 * ========================================
 *
 * Client deck legality mirrors server DeckValidationService unusable rules
 * (specials, events, powers, teamwork/basic/training/ally/advanced universe, aspects)
 * so the Legal / Not Legal badge aligns with API persistence (is_valid).
 * ========================================
 * 
 * This file contains deck validation and calculation functions extracted from
 * index.html during Phase 10B of the refactoring project.
 * 
 * Purpose: Deck validation and calculation functions
 * Created: Phase 10B of 12-phase refactoring project
 * Contains:
 *   - validateDeck() - Deck validation logic
 *   - calculateTotalCardCount() - Card count calculations
 *   - calculateTotalThreat() - Threat level calculations
 *   - updateDeckTitleValidation() - Title validation updates
 *   - toggleLimitedState() - Limited deck state management
 *   - isDeckLegalityEvaluationSkipped() - true when Limited (skip tournament validity / DB writes)
 *   - computeDeckIsValidForPersistence() - boolean for decks.is_valid (errors only)
 * 
 * ======================================== */

// Global variable to track limited state
let isDeckLimited = false;

/** When true, skip recomputing tournament legality and omit persisting is_valid. */
function isDeckLegalityEvaluationSkipped() {
    return isDeckLimited;
}

/** Align hyphenated editor types with server map prefixes (basic-universe → basic_universe). */
function deckTypeCanonClient(type) {
    return String(type || '').replace(/-/g, '_');
}

function statForPowerGridClient(char, powerType) {
    switch (powerType) {
        case 'Energy':
            return char.energy;
        case 'Combat':
            return char.combat;
        case 'Brute Force':
            return char.brute_force;
        case 'Intelligence':
            return char.intelligence;
        case 'Any-Power':
            return Math.max(char.energy, char.combat, char.brute_force, char.intelligence);
        default:
            return 0;
    }
}

function specialLinkedCharacterNameClient(ac) {
    const primary = (ac.character || ac.character_name || '').trim();
    if (primary) return primary;
    if (Array.isArray(ac.characters) && ac.characters.length > 0) {
        return String(ac.characters[0]).trim();
    }
    return '';
}

function teamHasSpecialCharacterClient(characterNames, linkedName, extras) {
    if (characterNames.includes(linkedName)) return true;
    return extras.some((e) => characterNames.includes(e));
}

// Function to validate deck according to Overpower rules
function validateDeck(deckCards) {
    const errors = [];
    const warnings = [];
    const getCardDisplayName = (availableCard) => (availableCard?.name || availableCard?.card_name || '').trim();
    const isAngryMobCharacter = (availableCard) => getCardDisplayName(availableCard).startsWith('Angry Mob');
    
    // Count card types
    const cardCounts = {};
    const characterCards = [];
    const eventCards = [];
    const missionCards = [];
    const locationCards = [];
    const onePerDeckCards = {};
    
    deckCards.forEach(card => {
        const type = card.type;
        cardCounts[type] = (cardCounts[type] || 0) + 1;
        
        if (type === 'character') {
            characterCards.push(card);
        } else if (type === 'event') {
            eventCards.push(card);
        } else if (type === 'mission') {
            missionCards.push(card);
        } else if (type === 'location') {
            locationCards.push(card);
        }
        
        // Track "One Per Deck" cards
        // Direct lookup using UUID
        const availableCard = availableCardsMap.get(card.cardId);
        if (availableCard && (availableCard.one_per_deck || availableCard.is_one_per_deck)) {
            const cardKey = `${card.type}_${card.cardId}`;
            onePerDeckCards[cardKey] = (onePerDeckCards[cardKey] || 0) + 1;
        }
    });
    
    // Rule 1: Exactly 4 characters
    if (characterCards.length !== DECK_RULES.EXACT_CHARACTERS) {
        errors.push(`Deck must have exactly ${DECK_RULES.EXACT_CHARACTERS} characters (${characterCards.length}/${DECK_RULES.EXACT_CHARACTERS})`);
    }
    
    // Rule 1.5: Check for banned cards
    deckCards.forEach(card => {
        const availableCard = availableCardsMap.get(card.cardId);
        if (availableCard && availableCard.banned === true) {
            const cardName = availableCard.name || availableCard.card_name || 'Unknown Card';
            errors.push(`Contains Banned Card: ${cardName}`);
        }
    });
    
    // Rule 1.6: at most one character whose display name starts with "Angry Mob"
    const angryMobCharacters = characterCards.filter(card => {
        const availableCard = availableCardsMap.get(card.cardId);
        return availableCard && isAngryMobCharacter(availableCard);
    });

    if (angryMobCharacters.length > 1) {
        errors.push('Only one Angry Mob character variant is allowed');
    }
    
    // Rule 2: Exactly 0 or 1 mission may be selected
    if (missionCards.length > DECK_RULES.MAX_MISSIONS) {
        errors.push(`Deck can have at most ${DECK_RULES.MAX_MISSIONS} mission (${missionCards.length} missions)`);
    }
    
    // Rule 3: Exactly 0 or 1 event may be selected
    if (eventCards.length > DECK_RULES.MAX_EVENTS) {
        errors.push(`Deck can have at most ${DECK_RULES.MAX_EVENTS} event (${eventCards.length} events)`);
    }
    
    // Rule 4: Only 0 or 1 location may be selected
    if (locationCards.length > DECK_RULES.MAX_LOCATIONS) {
        errors.push(`Deck can have at most ${DECK_RULES.MAX_LOCATIONS} location (${locationCards.length} locations)`);
    }
    
    // Rule 5: Threat value must be less than or equal to 76
    let totalThreat = 0;
    characterCards.forEach(card => {
        // Direct lookup using UUID
        const availableCard = availableCardsMap.get(card.cardId);
        if (availableCard && availableCard.threat_level) {
            totalThreat += availableCard.threat_level;
        }
    });
    
    locationCards.forEach(card => {
        // Direct lookup using UUID
        const availableCard = availableCardsMap.get(card.cardId);
        if (availableCard && availableCard.threat_level) {
            totalThreat += availableCard.threat_level;
        }
    });
    
    if (totalThreat > DECK_RULES.MAX_TOTAL_THREAT) {
        errors.push(`Total threat level must be ≤ ${DECK_RULES.MAX_TOTAL_THREAT} (current: ${totalThreat})`);
    }
    
    // Rule 6: Deck's draw pile must have 51 cards unless there are events, then it must be 56
    const totalCards = deckCards
        .filter(card => !['mission', 'character', 'location'].includes(card.type))
        .reduce((sum, card) => sum + card.quantity, 0);
    const hasEvents = eventCards.length > 0;
    const requiredSize = hasEvents ? DECK_RULES.MIN_DECK_SIZE_WITH_EVENTS : DECK_RULES.MIN_DECK_SIZE;
    
    if (totalCards < requiredSize) {
        errors.push(`Deck must have at least ${requiredSize} cards in draw pile (${totalCards}/${requiredSize})`);
    }
    
    // Check "One Per Deck" violations
    Object.entries(onePerDeckCards).forEach(([cardKey, count]) => {
        if (count > DECK_RULES.MAX_COPIES_ONE_PER_DECK) {
            const [cardType, cardId] = cardKey.split('_');
            const availableCard = availableCardsMap.get(cardKey);
            const cardName = availableCard ? availableCard.name || availableCard.card_name : cardId;
            errors.push(`"${cardName}" can only have ${DECK_RULES.MAX_COPIES_ONE_PER_DECK} copy in deck (${count} copies)`);
        }
    });
    
    // Rule 7: Deck cannot contain unusable cards
    const characterNamesForUnusable = characterCards.map(card => {
        const availableCard = availableCardsMap.get(card.cardId);
        return availableCard ? availableCard.name || availableCard.card_name : 'Unknown';
    });
    
    // Get character stats for power/universe card validation
    const characterStats = characterCards.map(card => {
        const availableCard = availableCardsMap.get(card.cardId);
        return availableCard ? {
            name: availableCard.name || availableCard.card_name,
            energy: availableCard.energy || 0,
            combat: availableCard.combat || 0,
            brute_force: availableCard.brute_force || 0,
            intelligence: availableCard.intelligence || 0
        } : null;
    }).filter(char => char);
    
    // Get mission sets for event validation
    const missionSets = new Set();
    missionCards.forEach(card => {
        const availableCard = availableCardsMap.get(card.cardId);
        if (availableCard && availableCard.mission_set) {
            missionSets.add(availableCard.mission_set);
        }
    });
    
    deckCards.forEach(card => {
        const availableCard = availableCardsMap.get(card.cardId);
        if (!availableCard) return;

        const cardName = availableCard.name || availableCard.card_name || 'Unknown';

        if (availableCard.unusable_with) {
            const unusableWith = availableCard.unusable_with.split(',').map(name => name.trim());
            const hasUnusableCharacter = unusableWith.some(unusableName =>
                characterNamesForUnusable.some(charName =>
                    charName.toLowerCase().includes(unusableName.toLowerCase())
                )
            );

            if (hasUnusableCharacter) {
                errors.push(`"${cardName}" cannot be used with ${unusableWith.join(', ')}`);
            }
        }
    });

    const angryMobCharacterNames = characterNamesForUnusable.filter(n => n.startsWith('Angry Mob'));

    deckCards.filter(c => c.type === 'special').forEach(card => {
        const ac = availableCardsMap.get(card.cardId);
        if (!ac) return;
        const displayName = ac.name || ac.card_name || 'Unknown';
        const linked = specialLinkedCharacterNameClient(ac);
        const extras = Array.isArray(ac.characters) ? ac.characters : [];
        if (!linked || linked === 'Any Character') return;

        if (linked.startsWith('Angry Mob')) {
            if (angryMobCharacterNames.length === 0) {
                errors.push(`"${displayName}" requires an "Angry Mob" character in your team`);
                return;
            }
            const hasVariantQualifier = linked.includes(':') || linked.includes(' - ');
            if (hasVariantQualifier) {
                const separator = linked.includes(':') ? ':' : ' - ';
                const specialVariant = linked.split(separator)[1].trim();
                const normalizeVariant = (v) =>
                    v.toLowerCase().replace(/\s+/g, ' ').trim().replace(/s$/, '');
                const normalizedSpecialVariant = normalizeVariant(specialVariant);
                const hasMatchingVariant = angryMobCharacterNames.some(charName => {
                    const variantMatch = charName.match(/\(([^)]+)\)/);
                    if (!variantMatch) return false;
                    return normalizeVariant(variantMatch[1]) === normalizedSpecialVariant;
                });
                if (!hasMatchingVariant) {
                    errors.push(
                        `"${displayName}" requires an "Angry Mob (${specialVariant})" character in your team`
                    );
                }
            }
            return;
        }

        if (!teamHasSpecialCharacterClient(characterNamesForUnusable, linked, extras)) {
            errors.push(`"${displayName}" requires character "${linked}" in your team`);
        }
    });

    deckCards.filter(c => c.type === 'event').forEach(card => {
        const ac = availableCardsMap.get(card.cardId);
        if (!ac) return;
        const displayName = ac.name || ac.card_name || 'Unknown';
        const ms = ac.mission_set;
        if (ms && ms !== 'Any-Mission' && missionSets.size > 0 && !missionSets.has(ms)) {
            errors.push(`"${displayName}" requires mission set "${ms}" in your deck`);
        }
    });

    deckCards.filter(c => c.type === 'power').forEach(card => {
        const ac = availableCardsMap.get(card.cardId);
        if (!ac) return;
        const displayName = ac.name || ac.card_name || 'Unknown';
        const powerType = ac.power_type;
        const value = parseInt(ac.value, 10);
        if (!powerType || Number.isNaN(value)) return;
        const canUse = characterStats.some(char => statForPowerGridClient(char, powerType) >= value);
        if (!canUse) {
            errors.push(`"${displayName}" (Power Card) requires a character with ${value}+ ${powerType}`);
        }
    });

    deckCards.filter(c => deckTypeCanonClient(c.type) === 'teamwork').forEach(card => {
        const ac = availableCardsMap.get(card.cardId);
        if (!ac) return;
        const displayName = ac.name || ac.card_name || 'Unknown';
        const toUse = ac.to_use || '';
        const toUseMatch = toUse.match(/(\d+)\s+(Energy|Combat|Brute Force|Intelligence|Any-Power)/);
        if (!toUseMatch) return;
        const requiredValue = parseInt(toUseMatch[1], 10);
        const pType = toUseMatch[2];
        const canUse = characterStats.some(char => statForPowerGridClient(char, pType) >= requiredValue);
        if (!canUse) {
            errors.push(
                `"${displayName}" (Universe Card) requires a character with ${requiredValue}+ ${pType}`
            );
        }
    });

    deckCards.filter(c => deckTypeCanonClient(c.type) === 'basic_universe').forEach(card => {
        const ac = availableCardsMap.get(card.cardId);
        if (!ac) return;
        const displayName = ac.card_name || ac.name || 'Unknown';
        const buType = ac.type || '';
        const buMatch = String(ac.value_to_use || '').match(/(\d+)\s*or\s*greater/i);
        const requiredValue = buMatch ? parseInt(buMatch[1], 10) : 0;
        if (!buType || requiredValue <= 0) return;
        const canUse = characterStats.some(char => statForPowerGridClient(char, buType) >= requiredValue);
        if (!canUse) {
            errors.push(
                `"${displayName}" (Universe Card) requires a character with ${requiredValue}+ ${buType}`
            );
        }
    });

    deckCards.filter(c => deckTypeCanonClient(c.type) === 'training').forEach(card => {
        const ac = availableCardsMap.get(card.cardId);
        if (!ac) return;
        const displayName = ac.card_name || ac.name || 'Unknown';
        const type1 = ac.type_1 || '';
        const type2 = ac.type_2 || '';
        const valueMatch = String(ac.value_to_use || '').match(/(\d+)/);
        const cap = valueMatch ? parseInt(valueMatch[1], 10) : 0;
        if (!type1 || !type2 || cap <= 0) return;
        const canUse = characterStats.some(char => {
            const s1 = statForPowerGridClient(char, type1);
            const s2 = statForPowerGridClient(char, type2);
            return s1 <= cap || s2 <= cap;
        });
        if (!canUse) {
            errors.push(
                `"${displayName}" (Training) requires a character with ${type1} or ${type2} at ${cap} or less`
            );
        }
    });

    const singleCharacterRowTeam = characterCards.length === 1;
    deckCards.filter(c => deckTypeCanonClient(c.type) === 'ally_universe').forEach(card => {
        const ac = availableCardsMap.get(card.cardId);
        if (!ac) return;
        const displayName = ac.card_name || ac.name || 'Unknown';
        if (singleCharacterRowTeam) {
            errors.push(
                `"${displayName}" (Ally Universe) requires at least two characters on your team`
            );
            return;
        }
        const statToUse = String(ac.stat_to_use || '');
        const statTypeToUse = String(ac.stat_type_to_use || '');
        const valueMatch = statToUse.match(/(\d+)\s+or\s+(less|higher)/i);
        if (!valueMatch || !statTypeToUse) return;
        const requiredValue = parseInt(valueMatch[1], 10);
        const isLessThan = valueMatch[2].toLowerCase() === 'less';
        const canUse = characterStats.some(char => {
            const characterStat = statForPowerGridClient(char, statTypeToUse);
            return isLessThan ? characterStat <= requiredValue : characterStat >= requiredValue;
        });
        if (!canUse) {
            const detail = isLessThan
                ? `${statTypeToUse} at ${requiredValue} or less`
                : `${requiredValue}+ ${statTypeToUse}`;
            errors.push(`"${displayName}" (Ally Universe) requires a character with ${detail}`);
        }
    });

    deckCards.filter(c => deckTypeCanonClient(c.type) === 'advanced_universe').forEach(card => {
        const ac = availableCardsMap.get(card.cardId);
        if (!ac) return;
        const displayName = ac.name || ac.card_name || 'Unknown';
        const auChar = String(ac.character || '').trim();
        if (auChar && auChar !== 'Any Character' && !characterNamesForUnusable.includes(auChar)) {
            errors.push(
                `"${displayName}" (Advanced Universe) requires character "${auChar}" in your team`
            );
        }
    });

    const firstLocationCard = deckCards.find(c => c.type === 'location');
    const locationAvailable = firstLocationCard ? availableCardsMap.get(firstLocationCard.cardId) : null;
    const homebaseName = String(
        (locationAvailable && (locationAvailable.name || locationAvailable.card_name)) || ''
    ).trim();

    deckCards.filter(c => deckTypeCanonClient(c.type) === 'aspect').forEach(card => {
        const ac = availableCardsMap.get(card.cardId);
        if (!ac) return;
        const displayName = ac.card_name || ac.name || 'Unknown';
        const locField = String(ac.location || '').trim();

        if (!firstLocationCard) {
            errors.push(`"${displayName}" (Aspect) requires a Homebase in your deck`);
            return;
        }
        if (!locField) return;
        const anyHomebase =
            /^any\s*homebase$/i.test(locField) || locField.toLowerCase().includes('any homebase');
        if (anyHomebase) return;
        if (!homebaseName || locField.toLowerCase() !== homebaseName.toLowerCase()) {
            errors.push(`"${displayName}" (Aspect) requires Homebase "${locField}"`);
        }
    });

    return { errors, warnings, isValid: errors.length === 0 };
}

/** Snapshot for decks.is_valid: legal iff validateDeck reports zero errors (warnings allowed). */
function computeDeckIsValidForPersistence(deckCards) {
    return validateDeck(deckCards).errors.length === 0;
}

// Shared function to calculate total card count (excluding mission, character, and location cards)
function calculateTotalCardCount(deckCards) {
    return deckCards
        .filter(card => !['mission', 'character', 'location'].includes(card.type))
        .reduce((sum, card) => sum + card.quantity, 0);
}

// Function to calculate total threat level for a deck
function calculateTotalThreat(deckCards) {
    
    let totalThreat = 0;
    
    // Get the current reserve character ID
    const reserveCharacterId = currentDeckData && currentDeckData.metadata && currentDeckData.metadata.reserve_character;
    
    // Get character cards
    const characterCards = deckCards.filter(card => card.type === 'character');
    
    // Get location cards
    const locationCards = deckCards.filter(card => card.type === 'location');
    
    // Calculate threat from characters
    characterCards.forEach(card => {
        const character = availableCardsMap.get(card.cardId);
        if (character && character.threat_level) {
            let threatLevel = character.threat_level;
            
            // Apply reserve character adjustments
            if (card.cardId === reserveCharacterId) {
                // Victory Harben: 18 -> 20 when reserve (+2)
                if (character.name === 'Victory Harben') {
                    threatLevel = 20;
                }
                // Carson of Venus: 18 -> 19 when reserve (+1)
                else if (character.name === 'Carson of Venus') {
                    threatLevel = 19;
                }
                // Morgan le Fay: 19 -> 20 when reserve (+1)
                else if (character.name === 'Morgan le Fay') {
                    threatLevel = 20;
                }
            }
            
            totalThreat += threatLevel * card.quantity;
        }
    });
    
    // Calculate threat from locations
    locationCards.forEach(card => {
        const location = availableCardsMap.get(card.cardId);
        if (location && location.threat_level) {
            totalThreat += location.threat_level * card.quantity;
        }
    });
    
    return totalThreat;
}

/** DEV MV: visible bullet list under legality badge (desktop keeps native title tooltip). */
function setDeckTitleValidationReasonsMv(messages, variant) {
    const ul = document.getElementById('deckTitleValidationReasonsMv');
    if (!ul) return;
    ul.textContent = '';
    ul.removeAttribute('data-variant');
    if (!messages || messages.length === 0) {
        ul.setAttribute('hidden', '');
        return;
    }
    ul.removeAttribute('hidden');
    if (variant) {
        ul.setAttribute('data-variant', variant);
    }
    messages.forEach((msg) => {
        const li = document.createElement('li');
        li.textContent = msg;
        ul.appendChild(li);
    });
}

// Function to update deck title validation badge
function updateDeckTitleValidation(deckCards) {
    const validationBadge = document.getElementById('deckTitleValidationBadge');
    if (!validationBadge) return;

    if (!deckCards || deckCards.length === 0) {
        validationBadge.textContent = '';
        validationBadge.className = 'deck-validation-badge';
        validationBadge.removeAttribute('title');
        validationBadge.onclick = null;
        setDeckTitleValidationReasonsMv(null, null);
        return;
    }

    // If deck is marked as limited, show Limited state
    if (isDeckLimited) {
        validationBadge.textContent = 'Limited';
        validationBadge.className = 'deck-validation-badge limited';
        validationBadge.removeAttribute('title');
        validationBadge.onclick = toggleLimitedState;
        setDeckTitleValidationReasonsMv(null, null);
        return;
    }

    const validation = validateDeck(deckCards);
    
    if (validation.errors.length > 0) {
        validationBadge.textContent = 'Not Legal';
        validationBadge.className = 'deck-validation-badge error';
        // Add tooltip with all validation errors
        const tooltipText = validation.errors.join('\n');
        validationBadge.setAttribute('title', tooltipText);
        validationBadge.onclick = toggleLimitedState;
        setDeckTitleValidationReasonsMv(validation.errors, 'error');
    } else if (validation.warnings.length > 0) {
        validationBadge.textContent = 'Has Warnings';
        validationBadge.className = 'deck-validation-badge warning';
        // Add tooltip with all warnings
        const tooltipText = validation.warnings.join('\n');
        validationBadge.setAttribute('title', tooltipText);
        validationBadge.onclick = toggleLimitedState;
        setDeckTitleValidationReasonsMv(validation.warnings, 'warning');
    } else {
        validationBadge.textContent = 'Legal';
        validationBadge.className = 'deck-validation-badge success';
        validationBadge.removeAttribute('title');
        validationBadge.onclick = toggleLimitedState;
        setDeckTitleValidationReasonsMv(null, null);
    }
}

// Function to toggle limited state
function toggleLimitedState() {
    isDeckLimited = !isDeckLimited;
    updateDeckTitleValidation(deckEditorCards);
}

if (typeof window !== 'undefined') {
    window.isDeckLegalityEvaluationSkipped = isDeckLegalityEvaluationSkipped;
    window.computeDeckIsValidForPersistence = computeDeckIsValidForPersistence;
}
