import { Deck } from '../types';
import * as fs from 'fs';
import * as path from 'path';

interface DeckData {
  id: string;
  name: string;
  description?: string;
  cards: Array<{ cardId: string; quantity: number }>;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  userId: string;
}

class DeckPersistence {
  private decksDir: string;

  constructor() {
    this.decksDir = path.join(process.cwd(), 'decks');
    this.ensureDecksDirectory();
  }

  private ensureDecksDirectory(): void {
    if (!fs.existsSync(this.decksDir)) {
      fs.mkdirSync(this.decksDir, { recursive: true });
    }
  }

  async saveDeck(deck: Deck): Promise<void> {
    const deckData: DeckData = {
      ...deck,
      createdAt: deck.createdAt instanceof Date ? deck.createdAt.toISOString() : deck.createdAt,
      updatedAt: deck.updatedAt instanceof Date ? deck.updatedAt.toISOString() : deck.updatedAt
    };

    const filePath = path.join(this.decksDir, `${deck.id}.json`);
    const content = JSON.stringify(deckData, null, 2);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`💾 Saved deck "${deck.name}" to ${path.basename(filePath)}`);
  }

  async loadDeck(deckId: string): Promise<DeckData | null> {
    try {
      const filePath = path.join(this.decksDir, `${deckId}.json`);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`❌ Error loading deck ${deckId}:`, error);
      return null;
    }
  }

  async loadAllDecks(): Promise<DeckData[]> {
    try {
      const files = fs.readdirSync(this.decksDir);
      const decks: DeckData[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const deckId = file.replace('.json', '');
          const deck = await this.loadDeck(deckId);
          if (deck) {
            decks.push(deck);
          }
        }
      }

      return decks;
    } catch (error) {
      console.error('❌ Error loading all decks:', error);
      return [];
    }
  }

  async deleteDeck(deckId: string): Promise<boolean> {
    try {
      const filePath = path.join(this.decksDir, `${deckId}.json`);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted deck file: ${path.basename(filePath)}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`❌ Error deleting deck ${deckId}:`, error);
      return false;
    }
  }

  async updateDeck(deckId: string, deck: Deck): Promise<void> {
    await this.saveDeck(deck);
  }
}

export const deckPersistence = new DeckPersistence();

