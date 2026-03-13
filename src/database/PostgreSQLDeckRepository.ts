import { Pool } from 'pg';
import { Deck, UIPreferences, DeckCard } from '../types';
import { DeckRepository } from '../repository/DeckRepository';
import {
  createDeckRepositoryContext,
  type DeckCache,
} from './deck/context';
import * as deckCrud from './deck/deck-crud';
import * as deckCards from './deck/deck-cards';
import * as deckMetadata from './deck/deck-metadata';

export class PostgreSQLDeckRepository implements DeckRepository {
  private pool: Pool;
  private deckCache: DeckCache = new Map();
  private readonly DECK_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private getContext() {
    return createDeckRepositoryContext(
      this.pool,
      this.deckCache,
      this.DECK_CACHE_TTL
    );
  }

  public clearCache(): void {
    this.deckCache.clear();
    console.log('🧹 Deck cache cleared');
  }

  async initialize(): Promise<void> {
    console.log('✅ PostgreSQL DeckRepository initialized');
  }

  async createDeck(
    userId: string,
    name: string,
    description?: string,
    characterIds?: string[]
  ): Promise<Deck> {
    return deckCrud.createDeck(
      this.getContext(),
      userId,
      name,
      description,
      characterIds
    );
  }

  async getDeckById(id: string): Promise<Deck | undefined> {
    return deckCrud.getDeckById(this.getContext(), id);
  }

  async getDecksByUserId(userId: string): Promise<Deck[]> {
    return deckCrud.getDecksByUserId(this.getContext(), userId);
  }

  async getDeckSummaryWithAllCards(deckId: string): Promise<Deck | undefined> {
    return deckCrud.getDeckSummaryWithAllCards(this.getContext(), deckId);
  }

  async getAllDecks(): Promise<Deck[]> {
    return deckCrud.getAllDecks(this.getContext());
  }

  async updateDeck(
    id: string,
    updates: Partial<Deck>
  ): Promise<Deck | undefined> {
    return deckCrud.updateDeck(this.getContext(), id, updates);
  }

  async deleteDeck(id: string): Promise<boolean> {
    return deckCrud.deleteDeck(this.getContext(), id);
  }

  async updateUIPreferences(
    deckId: string,
    preferences: UIPreferences
  ): Promise<boolean> {
    return deckMetadata.updateUIPreferences(
      this.getContext(),
      deckId,
      preferences
    );
  }

  async getUIPreferences(
    deckId: string
  ): Promise<UIPreferences | undefined> {
    return deckMetadata.getUIPreferences(this.getContext(), deckId);
  }

  async getDeckStats(): Promise<{ decks: number }> {
    return deckMetadata.getDeckStats(this.getContext());
  }

  async addCardToDeck(
    deckId: string,
    cardType: string,
    cardId: string,
    quantity = 1,
    selectedAlternateImage?: string
  ): Promise<boolean> {
    return deckCards.addCardToDeck(
      this.getContext(),
      deckId,
      cardType,
      cardId,
      quantity,
      selectedAlternateImage
    );
  }

  async removeCardFromDeck(
    deckId: string,
    cardType: string,
    cardId: string,
    quantity = 1
  ): Promise<boolean> {
    return deckCards.removeCardFromDeck(
      this.getContext(),
      deckId,
      cardType,
      cardId,
      quantity
    );
  }

  async updateCardInDeck(
    deckId: string,
    cardType: string,
    cardId: string,
    updates: { quantity?: number; selectedAlternateImage?: string }
  ): Promise<boolean> {
    return deckCards.updateCardInDeck(
      this.getContext(),
      deckId,
      cardType,
      cardId,
      { quantity: updates.quantity }
    );
  }

  async removeAllCardsFromDeck(deckId: string): Promise<boolean> {
    return deckCards.removeAllCardsFromDeck(this.getContext(), deckId);
  }

  async replaceAllCardsInDeck(
    deckId: string,
    cards: Array<{
      cardType: string;
      cardId: string;
      quantity: number;
      selectedAlternateImage?: string;
      exclude_from_draw?: boolean;
    }>
  ): Promise<void> {
    return deckCards.replaceAllCardsInDeck(
      this.getContext(),
      deckId,
      cards.map((c) => ({
        cardType: c.cardType,
        cardId: c.cardId,
        quantity: c.quantity,
        exclude_from_draw: c.exclude_from_draw,
      }))
    );
  }

  async getDeckCards(deckId: string): Promise<DeckCard[]> {
    return deckCards.getDeckCards(this.getContext(), deckId);
  }

  async doesCardExistInDeck(
    deckId: string,
    cardType: string,
    cardId: string
  ): Promise<boolean> {
    return deckCards.doesCardExistInDeck(
      this.getContext(),
      deckId,
      cardType,
      cardId
    );
  }

  async userOwnsDeck(deckId: string, userId: string): Promise<boolean> {
    return deckMetadata.userOwnsDeck(
      this.getContext(),
      deckId,
      userId
    );
  }
}
