import * as fs from 'fs';
import * as path from 'path';
import { DeckData, DeckMetadata, DeckCard, CardTypeOrAll } from '../types';

export class DeckPersistenceService {
  private readonly decksFilePath: string;
  private decks: Map<string, DeckData> = new Map();

  constructor() {
    this.decksFilePath = path.join(process.cwd(), 'data', 'decks.json');
    this.ensureDataDirectory();
    this.loadDecks();
  }

  private ensureDataDirectory(): void {
    const dataDir = path.dirname(this.decksFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private loadDecks(): void {
    try {
      if (fs.existsSync(this.decksFilePath)) {
        const data = fs.readFileSync(this.decksFilePath, 'utf-8');
        const decksArray = JSON.parse(data);
        this.decks.clear();
        decksArray.forEach((deck: DeckData) => {
          this.decks.set(deck.metadata.id, deck);
        });
        console.log(`✅ Loaded ${this.decks.size} decks from storage`);
      } else {
        console.log('📁 No existing decks file found, starting with empty deck collection');
      }
    } catch (error) {
      console.error('❌ Error loading decks:', error);
      this.decks.clear();
    }
  }

  private saveDecks(): void {
    try {
      const decksArray = Array.from(this.decks.values());
      fs.writeFileSync(this.decksFilePath, JSON.stringify(decksArray, null, 2));
      console.log(`💾 Saved ${this.decks.size} decks to storage`);
    } catch (error) {
      console.error('❌ Error saving decks:', error);
    }
  }

  // Create a new deck
  createDeck(name: string, description?: string): DeckData {
    const id = `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const deck: DeckData = {
      metadata: {
        id,
        name,
        description: description || '',
        created: now,
        lastModified: now,
        cardCount: 0
      },
      cards: []
    };

    this.decks.set(id, deck);
    this.saveDecks();
    console.log(`✅ Created new deck: ${name} (${id})`);
    return deck;
  }

  // Get all decks (just metadata for listing)
  getAllDecks(): DeckMetadata[] {
    return Array.from(this.decks.values()).map(deck => deck.metadata);
  }

  // Get a specific deck by ID
  getDeck(id: string): DeckData | null {
    return this.decks.get(id) || null;
  }

  // Update deck metadata
  updateDeckMetadata(id: string, updates: Partial<Pick<DeckMetadata, 'name' | 'description'>>): DeckData | null {
    const deck = this.decks.get(id);
    if (!deck) return null;

    deck.metadata = {
      ...deck.metadata,
      ...updates,
      lastModified: new Date().toISOString()
    };

    this.saveDecks();
    console.log(`✅ Updated deck metadata: ${deck.metadata.name}`);
    return deck;
  }

  // Add a card to a deck
  addCardToDeck(deckId: string, cardType: DeckCard['type'], cardId: string, quantity: number = 1): DeckData | null {
    const deck = this.decks.get(deckId);
    if (!deck) return null;

    // Check if card already exists in deck
    const existingCardIndex = deck.cards.findIndex(card => 
      card.type === cardType && card.cardId === cardId
    );

    if (existingCardIndex >= 0) {
      // Update existing card quantity
      deck.cards[existingCardIndex].quantity += quantity;
    } else {
      // Add new card
      const newCard: DeckCard = {
        id: `deckcard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: cardType,
        cardId,
        quantity
      };
      deck.cards.push(newCard);
    }

    // Update metadata
    deck.metadata.cardCount = deck.cards.reduce((total, card) => total + card.quantity, 0);
    deck.metadata.lastModified = new Date().toISOString();

    this.saveDecks();
    console.log(`✅ Added ${quantity}x ${cardType} card to deck: ${deck.metadata.name}`);
    return deck;
  }

  // Remove a card from a deck
  removeCardFromDeck(deckId: string, cardType: CardTypeOrAll, cardId: string, quantity: number = 1): DeckData | null {
    const deck = this.decks.get(deckId);
    if (!deck) return null;

    // Special case: remove all cards
    if (cardType === 'all' && cardId === 'all') {
      deck.cards = [];
      deck.metadata.cardCount = 0;
      deck.metadata.lastModified = new Date().toISOString();
      this.saveDecks();
      console.log(`✅ Removed all cards from deck: ${deck.metadata.name}`);
      return deck;
    }

    const existingCardIndex = deck.cards.findIndex(card => 
      card.type === cardType && card.cardId === cardId
    );

    if (existingCardIndex >= 0) {
      const existingCard = deck.cards[existingCardIndex];
      if (existingCard.quantity <= quantity) {
        // Remove the entire card entry
        deck.cards.splice(existingCardIndex, 1);
      } else {
        // Reduce quantity
        existingCard.quantity -= quantity;
      }

      // Update metadata
      deck.metadata.cardCount = deck.cards.reduce((total, card) => total + card.quantity, 0);
      deck.metadata.lastModified = new Date().toISOString();

      this.saveDecks();
      console.log(`✅ Removed ${quantity}x ${cardType} card from deck: ${deck.metadata.name}`);
      return deck;
    }

    return deck;
  }

  // Delete an entire deck
  deleteDeck(id: string): boolean {
    const deck = this.decks.get(id);
    if (!deck) return false;

    this.decks.delete(id);
    this.saveDecks();
    console.log(`✅ Deleted deck: ${deck.metadata.name}`);
    return true;
  }

  // Get deck statistics
  getDeckStats(): { totalDecks: number; totalCards: number } {
    const totalDecks = this.decks.size;
    const totalCards = Array.from(this.decks.values())
      .reduce((total, deck) => total + deck.metadata.cardCount, 0);
    
    return { totalDecks, totalCards };
  }
}
