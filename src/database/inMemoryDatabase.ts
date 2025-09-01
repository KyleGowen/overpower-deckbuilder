import { User, Deck, Character, ApiResponse } from '../types';
import * as fs from 'fs';
import * as path from 'path';

class InMemoryDatabase {
  private users: Map<string, User> = new Map();
  private decks: Map<string, Deck> = new Map();
  private characters: Map<string, Character> = new Map();
  
  private nextUserId = 1;
  private nextDeckId = 1;
  private nextCharacterId = 1;

  async initialize(): Promise<void> {
    console.log('🗄️ Initializing clean database schema...');
    
    // Load characters from the markdown file
    await this.loadCharacters();
    
    console.log('✅ Database initialization complete');
    console.log(`📊 Database loaded: ${this.characters.size} characters`);
  }

  private async loadCharacters(): Promise<void> {
    try {
      console.log('📖 Loading characters from file...');
      
      const filePath = path.join(process.cwd(), 'src/resources/cards/descriptions/overpower-erb-characters.md');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      console.log('📖 Reading character data from file...');
      const lines = fileContent.split('\n').filter(line => line.trim());
      
      let characterCount = 0;
      for (const line of lines) {
        if (line.startsWith('|') && !line.startsWith('|---')) {
          const columns = line.split('|').map(col => col.trim()).filter(col => col);
          
          if (columns.length >= 7) {
            const [name, energy, combat, bruteForce, intelligence, threatLevel, specialAbilities] = columns;
            
            if (name && name !== 'Name' && !isNaN(parseInt(energy))) {
              const character: Character = {
                id: `char_${this.nextCharacterId++}`,
                name,
                energy: parseInt(energy),
                combat: parseInt(combat),
                brute_force: parseInt(bruteForce),
                intelligence: parseInt(intelligence),
                threat_level: parseInt(threatLevel),
                special_abilities: specialAbilities || ''
              };
              
              this.characters.set(character.id, character);
              characterCount++;
              
              if (characterCount % 10 === 0) {
                console.log(`   Loaded ${characterCount}/${lines.length - 1} characters...`);
              }
            }
          }
        }
      }
      
      console.log(`🎉 Successfully loaded ${characterCount} characters into database!`);
      console.log('✅ Characters loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading characters:', error);
    }
  }

  // User management
  createUser(name: string, email: string): User {
    const id = `user_${this.nextUserId++}`;
    const user: User = { id, name, email };
    this.users.set(id, user);
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Deck management
  createDeck(userId: string, name: string): Deck {
    const id = `deck_${this.nextDeckId++}`;
    const deck: Deck = { id, user_id: userId, name };
    this.decks.set(id, deck);
    return deck;
  }

  getDeckById(id: string): Deck | undefined {
    return this.decks.get(id);
  }

  getDecksByUserId(userId: string): Deck[] {
    return Array.from(this.decks.values()).filter(deck => deck.user_id === userId);
  }

  getAllDecks(): Deck[] {
    return Array.from(this.decks.values());
  }

  // Character management
  getCharacterById(id: string): Character | undefined {
    return this.characters.get(id);
  }

  getAllCharacters(): Character[] {
    return Array.from(this.characters.values());
  }

  // Statistics
  getStats() {
    return {
      users: this.users.size,
      decks: this.decks.size,
      characters: this.characters.size
    };
  }
}

export const database = new InMemoryDatabase();

