import type { CardRepository } from '../../repository/CardRepository';

/** Row shape used when validating an add against the current deck contents. */
export type CardForDeckAddValidation = { type: string; cardId: string; quantity: number };

const DECK_ADD_RULES = {
  EXACT_CHARACTERS: 4,
  EXACT_MISSION_CARDS: 7,
  MAX_LOCATIONS: 1,
  MAX_COPIES_ONE_PER_DECK: 1
} as const;

type OnePerDeckRow = { one_per_deck?: boolean; is_one_per_deck?: boolean } | null | undefined;

function isOnePerDeckRow(d: OnePerDeckRow): boolean {
  return !!(d && (d.one_per_deck === true || d.is_one_per_deck === true));
}

export function createDeckAddValidation(cardRepository: CardRepository) {
  async function checkIfCardIsCataclysm(cardType: string, cardId: string): Promise<boolean> {
    try {
      if (cardType !== 'special') {
        return false;
      }
      const cardData = await cardRepository.getSpecialCardById(cardId);
      return !!(cardData && cardData.is_cataclysm === true);
    } catch (error) {
      console.error('Error checking if card is cataclysm:', error);
      return false;
    }
  }

  async function checkIfCardIsAssist(cardType: string, cardId: string): Promise<boolean> {
    try {
      if (cardType !== 'special') {
        return false;
      }
      const cardData = await cardRepository.getSpecialCardById(cardId);
      return !!(cardData && cardData.is_assist === true);
    } catch (error) {
      console.error('Error checking if card is assist:', error);
      return false;
    }
  }

  async function checkIfCardIsAmbush(cardType: string, cardId: string): Promise<boolean> {
    try {
      if (cardType !== 'special') {
        return false;
      }
      const cardData = await cardRepository.getSpecialCardById(cardId);
      return !!(cardData && cardData.is_ambush === true);
    } catch (error) {
      console.error('Error checking if card is ambush:', error);
      return false;
    }
  }

  async function checkIfCardIsFortification(cardType: string, cardId: string): Promise<boolean> {
    try {
      if (cardType !== 'aspect') {
        return false;
      }
      const cardData = await cardRepository.getAspectById(cardId);
      return !!(cardData && cardData.is_fortification === true);
    } catch (error) {
      console.error('Error checking if card is fortification:', error);
      return false;
    }
  }

  const fetchRowForOnePerDeck: Record<string, (id: string) => Promise<unknown>> = {
    character: (id) => cardRepository.getCharacterById(id),
    special: (id) => cardRepository.getSpecialCardById(id),
    power: (id) => cardRepository.getPowerCardById(id),
    mission: (id) => cardRepository.getMissionById(id),
    event: (id) => cardRepository.getEventById(id),
    aspect: (id) => cardRepository.getAspectById(id),
    location: (id) => cardRepository.getLocationById(id),
    'advanced-universe': (id) => cardRepository.getAdvancedUniverseById(id),
    teamwork: (id) => cardRepository.getTeamworkById(id),
    'ally-universe': (id) => cardRepository.getAllyUniverseById(id),
    training: (id) => cardRepository.getTrainingById(id),
    'basic-universe': (id) => cardRepository.getBasicUniverseById(id)
  };

  async function checkIfCardIsOnePerDeck(cardType: string, cardId: string): Promise<boolean> {
    try {
      const fetcher = fetchRowForOnePerDeck[cardType];
      if (!fetcher) {
        return false;
      }
      const cardData = await fetcher(cardId);
      return isOnePerDeckRow(cardData as OnePerDeckRow);
    } catch (error) {
      console.error('Error checking if card is one-per-deck:', error);
      return false;
    }
  }

  /** At most one deck row per character id (quantity must not stack). */
  const maxOneCategoryRules: Array<{
    id: string;
    label: string;
    isMember: (type: string, id: string) => Promise<boolean>;
  }> = [
    { id: 'cataclysm', label: 'Cataclysm', isMember: checkIfCardIsCataclysm },
    { id: 'assist', label: 'Assist', isMember: checkIfCardIsAssist },
    { id: 'ambush', label: 'Ambush', isMember: checkIfCardIsAmbush },
    { id: 'fortification', label: 'Fortification', isMember: checkIfCardIsFortification }
  ];

  async function validateCardAddition(
    currentCards: CardForDeckAddValidation[],
    cardType: string,
    cardId: string,
    quantity: number
  ): Promise<string | null> {
    const normId = (id: string) => String(id).trim();

    if (cardType === 'character') {
      const incoming = normId(cardId);
      const already = currentCards.some(
        c => c.type === 'character' && normId(c.cardId) === incoming && (c.quantity ?? 0) > 0
      );
      if (already) {
        return 'This character is already in the deck';
      }
    }

    if (cardType === 'location') {
      const hasLocation = currentCards.some(c => c.type === 'location' && (c.quantity ?? 0) > 0);
      if (hasLocation) {
        return 'Cannot add more than 1 location to a deck';
      }
    }

    const testCards = [...currentCards];

    const existingCardIndex = testCards.findIndex(card => card.type === cardType && card.cardId === cardId);
    if (existingCardIndex >= 0) {
      testCards[existingCardIndex] = {
        ...testCards[existingCardIndex],
        quantity: testCards[existingCardIndex].quantity + quantity
      };
    } else {
      testCards.push({
        type: cardType,
        cardId: cardId,
        quantity: quantity
      });
    }

    const characterCards: CardForDeckAddValidation[] = [];
    const missionCards: CardForDeckAddValidation[] = [];
    const locationCards: CardForDeckAddValidation[] = [];

    for (const card of testCards) {
      const type = card.type;
      if (type === 'character') {
        characterCards.push(card);
      } else if (type === 'mission') {
        missionCards.push(card);
      } else if (type === 'location') {
        locationCards.push(card);
      }
    }

    if (cardType === 'character' && characterCards.length > DECK_ADD_RULES.EXACT_CHARACTERS) {
      return `Deck cannot have more than ${DECK_ADD_RULES.EXACT_CHARACTERS} characters (would have ${characterCards.length})`;
    }

    if (cardType === 'mission' && missionCards.length > DECK_ADD_RULES.EXACT_MISSION_CARDS) {
      return `Deck cannot have more than ${DECK_ADD_RULES.EXACT_MISSION_CARDS} mission cards (would have ${missionCards.length})`;
    }

    if (cardType === 'location' && locationCards.length > DECK_ADD_RULES.MAX_LOCATIONS) {
      return `Deck cannot have more than ${DECK_ADD_RULES.MAX_LOCATIONS} location (would have ${locationCards.length})`;
    }

    const isIncomingOnePerDeck = await checkIfCardIsOnePerDeck(cardType, cardId);
    if (isIncomingOnePerDeck) {
      const existingCard = currentCards.find(card => card.type === cardType && card.cardId === cardId);
      if (existingCard && existingCard.quantity > 0) {
        return `Cannot add more copies of "${cardId}" - this card is limited to one per deck`;
      }
    }

    const onePerDeckCards: { [key: string]: number } = {};
    for (const card of testCards) {
      const isOpd = await checkIfCardIsOnePerDeck(card.type, card.cardId);
      if (isOpd) {
        const cardKey = `${card.type}_${card.cardId}`;
        onePerDeckCards[cardKey] = (onePerDeckCards[cardKey] || 0) + card.quantity;
      }
    }

    for (const [cardKey, count] of Object.entries(onePerDeckCards)) {
      if (count > DECK_ADD_RULES.MAX_COPIES_ONE_PER_DECK) {
        const [type, opdCardId] = cardKey.split('_', 2);
        return `Cannot add more copies of "${opdCardId}" - this ${type} card is limited to one per deck`;
      }
    }

    for (const rule of maxOneCategoryRules) {
      const matches: CardForDeckAddValidation[] = [];
      for (const card of testCards) {
        if (await rule.isMember(card.type, card.cardId)) {
          matches.push(card);
        }
      }
      if (matches.length > 1) {
        return `Cannot add more than 1 ${rule.label} to a deck (would have ${matches.length})`;
      }
    }

    return null;
  }

  return {
    checkIfCardIsCataclysm,
    checkIfCardIsAssist,
    checkIfCardIsAmbush,
    checkIfCardIsFortification,
    checkIfCardIsOnePerDeck,
    validateCardAddition
  };
}

export type DeckAddValidation = ReturnType<typeof createDeckAddValidation>;
