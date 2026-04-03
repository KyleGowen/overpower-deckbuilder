import type { Deck, DeckCard } from '../../types';
import type { ValidationError } from '../../services/deckValidationService';

export interface DeckBusinessCreatePort {
  createDeck: (
    userId: string,
    name: string,
    description?: string,
    characterIds?: string[]
  ) => Promise<Deck>;
}

export interface DeckValidationPort {
  validateDeck: (cards: DeckCard[]) => Promise<ValidationError[]>;
}

/**
 * Orchestrates deck creation and server-side deck validation for v1 (and shared use).
 */
export class DeckWriteService {
  constructor(
    private readonly deckBusiness: DeckBusinessCreatePort,
    private readonly deckValidation: DeckValidationPort
  ) {}

  createDeck(
    userId: string,
    name: string,
    description: string | undefined,
    characters: string[] | undefined
  ): Promise<Deck> {
    return this.deckBusiness.createDeck(userId, name, description, characters);
  }

  validateDeckCards(cards: unknown[]): Promise<ValidationError[]> {
    return this.deckValidation.validateDeck(cards as DeckCard[]);
  }
}
