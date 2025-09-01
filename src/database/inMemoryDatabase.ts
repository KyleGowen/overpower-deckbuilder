import { User, Deck, Character, Location, ApiResponse } from '../types';
import * as fs from 'fs';
import * as path from 'path';

class InMemoryDatabase {
  private users: Map<string, User> = new Map();
  private decks: Map<string, Deck> = new Map();
  private characters: Map<string, Character> = new Map();
  private locations: Map<string, Location> = new Map();
  
  private nextUserId = 1;
  private nextDeckId = 1;
  private nextCharacterId = 1;
  private nextLocationId = 1;

  async initialize(): Promise<void> {
    console.log('🗄️ Initializing clean database schema...');
    
    // Load characters from the markdown file
    await this.loadCharacters();
    
    // Load locations from the markdown file
    await this.loadLocations();
    
    console.log('✅ Database initialization complete');
    console.log(`📊 Database loaded: ${this.characters.size} characters, ${this.locations.size} locations`);
  }

  private async loadCharacters(): Promise<void> {
    try {
      console.log('📖 Loading characters from file...');
      const filePath = path.join(process.cwd(), 'src/resources/cards/descriptions/overpower-erb-characters.md');
      
      if (!fs.existsSync(filePath)) {
        console.log('❌ Character file not found, skipping character loading');
        return;
      }

      console.log('📖 Reading character data from file...');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim().length > 0);

      let loadedCount = 0;
      const totalLines = lines.length;

      for (const line of lines) {
        // Skip header and separator lines
        if (line.startsWith('|') && !line.includes('----') && !line.includes('Name')) {
          const columns = line.split('|').map(col => col.trim());
          
          if (columns.length >= 9) { // Split by | creates 9 elements for 8 columns
                             const character: Character = {
                   id: `char_${this.nextCharacterId++}`,
                   name: columns[1],
                   energy: parseInt(columns[2]) || 0,
                   combat: parseInt(columns[3]) || 0,
                   brute_force: parseInt(columns[4]) || 0,
                   intelligence: parseInt(columns[5]) || 0,
                   threat_level: parseInt(columns[6]) || 0,
                   special_abilities: columns[7] || '',
                   image: columns[8]
                 };

            this.characters.set(character.id, character);
            loadedCount++;

            if (loadedCount % 10 === 0) {
              console.log(`   Loaded ${loadedCount}/${totalLines} characters...`);
            }
          }
        }
      }

      console.log(`🎉 Successfully loaded ${loadedCount} characters into database!`);
      console.log('✅ Characters loaded successfully');
    } catch (error) {
      console.error('❌ Error loading characters:', error);
    }
  }

  private async loadLocations(): Promise<void> {
    try {
      console.log('📖 Loading locations from file...');
      const filePath = path.join(process.cwd(), 'src/resources/cards/descriptions/overpower-erb-locations.md');
      
      if (!fs.existsSync(filePath)) {
        console.log('❌ Locations file not found, skipping location loading');
        return;
      }

      console.log('📖 Reading location data from file...');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim().length > 0);

      let loadedCount = 0;
      const totalLines = lines.length;

      for (const line of lines) {
        // Skip header and separator lines
        if (line.startsWith('|') && !line.includes('----') && !line.includes('Name')) {
          const columns = line.split('|').map(col => col.trim());
          
          if (columns.length >= 4) { // Split by | creates 4+ elements for 3 columns
            const location: Location = {
              id: `loc_${this.nextLocationId++}`,
              name: columns[1],
              threat_level: parseInt(columns[2]) || 0,
              special_ability: columns[3] || '',
              image: this.getLocationImage(columns[1])
            };

            this.locations.set(location.id, location);
            loadedCount++;
          }
        }
      }

      console.log(`🎉 Successfully loaded ${loadedCount} locations into database!`);
      console.log('✅ Locations loaded successfully');
    } catch (error) {
      console.error('❌ Error loading locations:', error);
    }
  }

  private getLocationImage(locationName: string): string {
    // Map location names to their image files
    const locationImageMap: { [key: string]: string } = {
      "Dracula's Armory": '465_draculas_armory.webp',
      "Spartan Training Ground": '466_spartan_training_ground.webp',
      "The Round Table": '467_the_round_table.webp',
      "Barsoom": '468_barsoom.webp',
      "Asclepieion": '469_ascleipeion.webp',
      "221-B Baker St.": '470_221b_baker_st.webp',
      "Event Horizon: The Future": '471_horizon.webp',
      "The Land That Time Forgot": '472_the_land_that_time_forgot.webp'
    };
    
    return locationImageMap[locationName] || 'unknown_location.webp';
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

  // Location management
  getLocationById(id: string): Location | undefined {
    return this.locations.get(id);
  }

  getAllLocations(): Location[] {
    return Array.from(this.locations.values());
  }

  // Statistics
  getStats() {
    return {
      users: this.users.size,
      decks: this.decks.size,
      characters: this.characters.size,
      locations: this.locations.size
    };
  }
}

export const database = new InMemoryDatabase();

