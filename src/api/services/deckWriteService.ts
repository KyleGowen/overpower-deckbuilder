import type { Deck, DeckCard } from '../../types';
import type { ValidationError } from '../../services/deckValidationService';

export interface DeckBusinessCreatePort {
  createDeck: (
    userId: string,
    name: string,
    description?: string,
    characterIds?: string[],
    isPrivate?: boolean
  ) => Promise<Deck>;
  updateDeck: (deckId: string, updates: Partial<Deck>) => Promise<Deck | undefined>;
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

  async createDeck(
    userId: string,
    name: string,
    description: string | undefined,
    characters: string[] | undefined,
    isPrivate?: boolean
  ): Promise<Deck> {
    const deck = isPrivate === undefined
      ? await this.deckBusiness.createDeck(userId, name, description, characters)
      : await this.deckBusiness.createDeck(userId, name, description, characters, isPrivate);
    await this.syncCreatedDeckValidity(deck, characters);
    return deck;
  }

  /**
   * Recompute and persist `decks.is_valid` for a freshly created deck so legality
   * is server-owned from the moment a deck exists (a new deck with only characters
   * is never legal, but this keeps the column authoritative regardless of inputs).
   */
  private async syncCreatedDeckValidity(deck: Deck, characters: string[] | undefined): Promise<void> {
    try {
      const cards: DeckCard[] = (deck.cards
        ?? (characters ?? []).map((cardId) => ({ id: '', type: 'character', cardId, quantity: 1 }))) as DeckCard[];
      const errors = await this.deckValidation.validateDeck(cards);
      const isValid = errors.length === 0;
      if ((deck.is_valid ?? false) !== isValid) {
        await this.deckBusiness.updateDeck(deck.id, { is_valid: isValid });
      }
      deck.is_valid = isValid;
    } catch (error) {
      console.error('Failed to recompute created deck validity:', error);
    }
  }

  validateDeckCards(cards: unknown[]): Promise<ValidationError[]> {
    return this.deckValidation.validateDeck(cards as DeckCard[]);
  }
}
