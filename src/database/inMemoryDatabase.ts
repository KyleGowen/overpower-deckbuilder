import { Card, Deck, SpecialCard, PowerCard, CreateDeckRequest, UpdateDeckRequest, CardType, CardRarity } from '../types';
import { deckPersistence } from '../scripts/deckPersistence';

class InMemoryDatabase {
  private cards: Map<string, Card> = new Map();
  private specialCards: Map<string, SpecialCard> = new Map();
  private powerCards: Map<string, PowerCard> = new Map();
  private decks: Map<string, Deck> = new Map();
  private nextCardId = 1;
  private nextDeckId = 1;

  async initialize(): Promise<void> {
    console.log('🗄️ Initializing in-memory database...');
    
    // Load characters
    await this.loadCharacters();
    
    // Load special cards
    await this.loadSpecialCards();
    
    // Load power cards
    await this.loadPowerCards();
    
    console.log('✅ Database initialization complete');
  }

  async loadDecksFromPersistence(): Promise<void> {
    try {
      console.log('📚 Loading decks from persistence...');
      const persistedDecks = await deckPersistence.loadAllDecks();
      
      for (const deckData of persistedDecks) {
        // Convert string dates back to Date objects
        const deck: Deck = {
          ...deckData,
          createdAt: new Date(deckData.createdAt),
          updatedAt: new Date(deckData.updatedAt)
        };
        
        this.decks.set(deck.id, deck);
        console.log(`📚 Loaded deck: ${deck.name} (${deck.cards.length} cards)`);
      }
      
      console.log(`📚 Loaded ${persistedDecks.length} decks from persistence`);
      
      // Ensure Sandbox deck exists
      await this.ensureSandboxDeck();
      
    } catch (error) {
      console.error('❌ Error loading decks from persistence:', error);
    }
  }

  private async ensureSandboxDeck(): Promise<void> {
    if (!this.decks.has('sandbox')) {
      const sandboxDeck: Deck = {
        id: 'sandbox',
        name: 'Sandbox',
        description: 'Temporary workspace for experimenting with cards',
        cards: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        userId: 'system'
      };
      
      this.decks.set('sandbox', sandboxDeck);
      console.log('🏖️ Created Sandbox deck');
    }
  }

  async getSandboxDeck(): Promise<Deck> {
    const sandbox = this.decks.get('sandbox');
    if (!sandbox) {
      throw new Error('Sandbox deck not found');
    }
    return sandbox;
  }

  async getActiveDeck(deckId?: string): Promise<Deck> {
    if (deckId && deckId !== 'sandbox') {
      const deck = this.decks.get(deckId);
      if (deck) return deck;
    }
    
    // Default to Sandbox
    return await this.getSandboxDeck();
  }

  async addCardToSandbox(card: any): Promise<Deck> {
    const sandbox = await this.getSandboxDeck();
    sandbox.cards.push({
      cardId: card.id,
      quantity: 1
    });
    sandbox.updatedAt = new Date();
    return sandbox;
  }

  async clearSandboxDeck(): Promise<Deck> {
    const sandbox = await this.getSandboxDeck();
    sandbox.cards = [];
    sandbox.updatedAt = new Date();
    return sandbox;
  }

  // Card management
  addCard(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Card {
    const id = `card_${this.nextCardId++}`;
    const newCard: Card = {
      ...card,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.cards.set(id, newCard);
    return newCard;
  }

  getCardById(id: string): Card | undefined {
    return this.cards.get(id);
  }

  getAllCards(): Card[] {
    return Array.from(this.cards.values());
  }

  // Special card management
  addSpecialCard(card: Omit<SpecialCard, 'id' | 'createdAt' | 'updatedAt'>): SpecialCard {
    const id = `special_${this.nextCardId++}`;
    const newCard: SpecialCard = {
      ...card,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.specialCards.set(id, newCard);
    return newCard;
  }

  getAllSpecialCards(): SpecialCard[] {
    return Array.from(this.specialCards.values());
  }

  // Power card management
  addPowerCard(card: Omit<PowerCard, 'id' | 'createdAt' | 'updatedAt'>): PowerCard {
    const id = `power_${this.nextCardId++}`;
    const newCard: PowerCard = {
      ...card,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.powerCards.set(id, newCard);
    return newCard;
  }

  getAllPowerCards(): PowerCard[] {
    return Array.from(this.powerCards.values());
  }

  // Deck management
  async createDeck(deckData: CreateDeckRequest): Promise<Deck> {
    // Prevent creating decks with "Sandbox" name
    if (deckData.name.toLowerCase() === 'sandbox') {
      throw new Error('Cannot use "Sandbox" as a deck name - this name is reserved');
    }

    const id = `deck_${this.nextDeckId++}`;
    const newDeck: Deck = {
      ...deckData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: deckData.isPublic || false,
      userId: deckData.userId || 'system'
    };

    this.decks.set(id, newDeck);
    
    // Save to persistence
    await deckPersistence.saveDeck(newDeck);
    
    return newDeck;
  }

  async updateDeck(id: string, updates: UpdateDeckRequest): Promise<Deck | null> {
    const deck = this.decks.get(id);
    if (!deck) return null;

    // Prevent updating Sandbox deck
    if (id === 'sandbox') {
      throw new Error('Cannot modify Sandbox deck directly');
    }

    const updatedDeck: Deck = {
      ...deck,
      ...updates,
      updatedAt: new Date()
    };

    this.decks.set(id, updatedDeck);
    
    // Update in persistence
    await deckPersistence.updateDeck(id, updatedDeck);
    
    return updatedDeck;
  }

  async deleteDeck(id: string): Promise<boolean> {
    // Prevent deleting Sandbox deck
    if (id === 'sandbox') {
      throw new Error('Cannot delete Sandbox deck');
    }

    const deck = this.decks.get(id);
    if (!deck) return false;

    this.decks.delete(id);
    
    // Delete from persistence
    await deckPersistence.deleteDeck(id);
    
    return true;
  }

  getDeckById(id: string): Deck | undefined {
    return this.decks.get(id);
  }

  getAllDecks(): Deck[] {
    return Array.from(this.decks.values());
  }

  getPublicDecks(): Deck[] {
    return Array.from(this.decks.values()).filter(deck => deck.isPublic);
  }

  // Statistics
  getStats() {
    return {
      cards: this.cards.size,
      decks: this.decks.size,
      specialCards: this.specialCards.size,
      powerCards: this.powerCards.size
    };
  }

  // Data loading methods
  private async loadCharacters(): Promise<void> {
    try {
      console.log('📖 Loading characters from file...');
      const fs = require('fs');
      const path = require('path');
      
      const filePath = path.join(process.cwd(), 'overpower-erb-characters.md');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      console.log('📖 Reading character data from file...');
      const lines = fileContent.split('\n').filter((line: string) => line.trim());
      
      let characterCount = 0;
      for (const line of lines) {
        if (line.startsWith('|') && !line.startsWith('|---')) {
          const columns = line.split('|').map((col: string) => col.trim()).filter((col: string) => col);
          
          if (columns.length >= 7) {
            const [name, energy, combat, bruteForce, intelligence, threatLevel, specialAbilities] = columns;
            
            if (name && name !== 'Name' && !isNaN(parseInt(energy))) {
              const card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'> = {
                name,
                type: CardType.CHARACTER,
                rarity: this.determineRarity(parseInt(threatLevel)),
                cost: 0,
                power: 0,
                defense: 0,
                description: `Threat Level: ${threatLevel}`,
                imageUrl: this.getCharacterImageUrl(name),
                set: 'Edgar Rice Burroughs / World Legends',
                cardNumber: `CHAR_${characterCount + 1}`,
                energy: parseInt(energy),
                combat: parseInt(combat),
                bruteForce: parseInt(bruteForce),
                intelligence: parseInt(intelligence),
                threatLevel: parseInt(threatLevel),
                specialAbilities: specialAbilities || ''
              };
              
              this.addCard(card);
              characterCount++;
              
              if (characterCount % 10 === 0) {
                console.log(`   Loaded ${characterCount}/${lines.length - 1} characters...`);
              }
            }
          }
        }
      }
      
      console.log(`🎉 Successfully loaded ${characterCount} characters into database!`);
      console.log(`📊 Total cards in database: ${this.cards.size}`);
      console.log('✅ Characters loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading characters:', error);
    }
  }

  private async loadSpecialCards(): Promise<void> {
    try {
      console.log('📖 Loading special cards from file...');
      const fs = require('fs');
      const path = require('path');
      
      const filePath = path.join(process.cwd(), 'overpower-erb-aspects.md');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      console.log('📖 Reading special card data from file...');
      const lines = fileContent.split('\n').filter((line: string) => line.trim());
      
      let specialCount = 0;
      for (const line of lines) {
        if (line.startsWith('|') && !line.startsWith('|---')) {
          const columns = line.split('|').map((col: string) => col.trim()).filter((col: string) => col);
          
          if (columns.length >= 4) {
            const [cardName, cardType, character, cardEffect] = columns;
            
            if (cardName && cardName !== 'Card Name' && cardType && character && cardEffect) {
              const specialCard: Omit<SpecialCard, 'id' | 'createdAt' | 'updatedAt'> = {
                cardName,
                cardType,
                character,
                cardEffect,
                imageUrl: this.getSpecialCardImageUrl(cardName, character)
              };
              
              this.addSpecialCard(specialCard);
              specialCount++;
              
              if (specialCount % 10 === 0) {
                console.log(`   Loaded ${specialCount}/${lines.length - 1} special cards...`);
              }
            }
          }
        }
      }
      
      console.log(`🎉 Successfully loaded ${specialCount} special cards into database!`);
      console.log(`📊 Total special cards in database: ${this.specialCards.size}`);
      console.log('✅ Special cards loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading special cards:', error);
    }
  }

  private async loadPowerCards(): Promise<void> {
    try {
      console.log('📖 Loading power cards from file...');
      const fs = require('fs');
      const path = require('path');
      
      const filePath = path.join(process.cwd(), 'overpower-erb-powercards.md');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      console.log('📖 Reading power card data from file...');
      const lines = fileContent.split('\n').filter((line: string) => line.trim());
      
      let powerCount = 0;
      let skippedCount = 0;
      
      for (const line of lines) {
        if (line.startsWith('|') && !line.startsWith('|---')) {
          const columns = line.split('|').map((col: string) => col.trim()).filter((col: string) => col);
          
          if (columns.length >= 3) {
            const [powerType, valueStr, notes] = columns;
            
            if (powerType && powerType !== 'Power Type' && valueStr && !isNaN(parseInt(valueStr))) {
              const value = parseInt(valueStr);
              
              const powerCard: Omit<PowerCard, 'id' | 'createdAt' | 'updatedAt'> = {
                powerType,
                value,
                notes: notes || undefined,
                imageUrl: this.getPowerCardImageUrl(powerType, value)
              };
              
              this.addPowerCard(powerCard);
              powerCount++;
              console.log(`✅ Loaded: ${powerType} ${value}`);
            } else {
              skippedCount++;
            }
          }
        }
      }
      
      console.log(`🎯 Power Cards Loading Complete!`);
      console.log(`✅ Successfully loaded: ${powerCount} power cards`);
      if (skippedCount > 0) {
        console.log(`⏭️  Skipped: ${skippedCount} lines`);
      }
      
      console.log('✅ Power cards loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading power cards:', error);
    }
  }

  private determineRarity(threatLevel: number): CardRarity {
    if (threatLevel >= 25) return CardRarity.LEGENDARY;
    if (threatLevel >= 20) return CardRarity.EPIC;
    if (threatLevel >= 15) return CardRarity.RARE;
    if (threatLevel >= 10) return CardRarity.UNCOMMON;
    return CardRarity.COMMON;
  }

  private getCharacterImageUrl(characterName: string): string {
    // Map for downloaded WebP images
    const characterImageMap: { [key: string]: string } = {
      'Hercules': '/images/hercules.webp',
      'Angry Mob (Middle Ages)': '/images/angry-mob--middle-ages.webp',
      'Dracula': '/images/dracula.webp',
      'Anubis': '/images/014_anubis.webp',
      'Billy the Kid': '/images/021_billy_the_kid.webp',
      'Captain Nemo': '/images/028_captain_nemo.webp',
      'Carson of Venus': '/images/035_carson_of_venus.webp',
      'Count of Monte Cristo': '/images/042_count_of_monte_cristo.webp',
      'Angry Mob (Industrial Age)': '/images/008_angry_mob_industrial_age.webp',
      'Angry Mob (Modern Age)': '/images/011_angry_mob_modern_age.webp'
    };

    if (characterImageMap[characterName]) {
      return characterImageMap[characterName];
    }

    // Generate SVG placeholder for other characters
    return `data:image/svg+xml;base64,${Buffer.from(this.generateCharacterSVG(characterName)).toString('base64')}`;
  }

  private getSpecialCardImageUrl(cardName: string, character: string): string {
    if (character === 'Any Character') {
      return ''; // No image for "Any Character" cards
    }
    
    // Generate SVG placeholder for character-specific special cards
    return `data:image/svg+xml;base64,${Buffer.from(this.generateSpecialCardSVG(cardName, character)).toString('base64')}`;
  }

  private getPowerCardImageUrl(powerType: string, value: number): string {
    // Map specific power type/value combinations to provided WebP images
    const powerCardImages: { [key: string]: string } = {
      'Energy 1': '/images/energy_1.webp',
      'Energy 2': '/images/energy_2.webp',
      'Energy 3': '/images/energy_3.webp',
      'Energy 4': '/images/energy_4.webp',
      'Energy 5': '/images/energy_5.webp',
      'Energy 6': '/images/energy_6.webp',
      'Energy 7': '/images/energy_7.webp',
      'Energy 8': '/images/energy_8.webp',
      'Combat 1': '/images/combat_1.webp',
      'Combat 2': '/images/combat_2.webp',
      'Combat 3': '/images/combat_3.webp',
      'Combat 4': '/images/combat_4.webp',
      'Combat 5': '/images/combat_5.webp',
      'Combat 6': '/images/combat_6.webp',
      'Combat 7': '/images/combat_7.webp',
      'Combat 8': '/images/combat_8.webp',
      'Brute Force 1': '/images/brute_force_1.webp',
      'Brute Force 2': '/images/brute_force_2.webp',
      'Brute Force 3': '/images/brute_force_3.webp',
      'Brute Force 4': '/images/brute_force_4.webp',
      'Brute Force 5': '/images/brute_force_5.webp',
      'Intelligence 1': '/images/intelligence_1.webp',
      'Intelligence 2': '/images/intelligence_2.webp',
      'Any-Power 5': '/images/any_power_5.webp',
      'Any-Power 6': '/images/any_power_6.webp',
      'Any-Power 7': '/images/any_power_7.webp',
      'Any-Power 8': '/images/any_power_8.webp',
      'Multi-Power 3': '/images/multi_power_3.webp',
      'Multi-Power 4': '/images/multi_power_4.webp',
      'Multi-Power 5': '/images/multi_power_5.webp'
    };

    const key = `${powerType} ${value}`;
    if (powerCardImages[key]) {
      return powerCardImages[key];
    }

    // Generate SVG placeholder for other power cards
    return `data:image/svg+xml;base64,${Buffer.from(this.generatePowerCardSVG(powerType, value)).toString('base64')}`;
  }

  private generateCharacterSVG(characterName: string): string {
    return `
      <svg width="200" height="280" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="280" fill="#1e3a8a" stroke="#fbbf24" stroke-width="3"/>
        <rect x="10" y="10" width="180" height="40" fill="#fbbf24" rx="5"/>
        <text x="100" y="35" text-anchor="middle" fill="#1e3a8a" font-family="Arial" font-size="12" font-weight="bold">CHARACTER</text>
        <text x="100" y="60" text-anchor="middle" fill="#fbbf24" font-family="Arial" font-size="14" font-weight="bold">${characterName}</text>
        <rect x="20" y="80" width="160" height="120" fill="#374151" rx="5"/>
        <text x="100" y="100" text-anchor="middle" fill="#fbbf24" font-family="Arial" font-size="10">[Character Image]</text>
        <text x="100" y="220" text-anchor="middle" fill="#fbbf24" font-family="Arial" font-size="10">Drag to add stats</text>
      </svg>
    `;
  }

  private generateSpecialCardSVG(cardName: string, character: string): string {
    return `
      <svg width="200" height="280" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="280" fill="#1e3a8a" stroke="#fbbf24" stroke-width="3"/>
        <rect x="10" y="10" width="180" height="40" fill="#fbbf24" rx="5"/>
        <text x="100" y="35" text-anchor="middle" fill="#1e3a8a" font-family="Arial" font-size="12" font-weight="bold">SPECIAL</text>
        <text x="100" y="60" text-anchor="middle" fill="#fbbf24" font-family="Arial" font-size="12" font-weight="bold">${cardName}</text>
        <text x="100" y="80" text-anchor="middle" fill="#fbbf24" font-family="Arial" font-size="10">Character: ${character}</text>
        <rect x="20" y="100" width="160" height="120" fill="#374151" rx="5"/>
        <text x="100" y="120" text-anchor="middle" fill="#fbbf24" font-family="Arial" font-size="8">[Card Effect]</text>
        <text x="100" y="140" text-anchor="middle" fill="#fbbf24" font-family="Arial" font-size="8">${cardName}</text>
      </svg>
    `;
  }

  private generatePowerCardSVG(powerType: string, value: number): string {
    const colors: { [key: string]: string } = {
      'Energy': '#fbbf24',
      'Combat': '#ef4444',
      'Brute Force': '#8b5cf6',
      'Intelligence': '#06b6d4',
      'Any-Power': '#10b981',
      'Multi-Power': '#f59e0b'
    };

    const color = colors[powerType] || '#6b7280';
    
    return `
      <svg width="200" height="280" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="280" fill="#1e3a8a" stroke="${color}" stroke-width="3"/>
        <circle cx="100" cy="80" r="40" fill="${color}"/>
        <text x="100" y="90" text-anchor="middle" fill="#1e3a8a" font-family="Arial" font-size="24" font-weight="bold">${value}</text>
        <text x="100" y="140" text-anchor="middle" fill="#fbbf24" font-family="Arial" font-size="14" font-weight="bold">${powerType}</text>
        <rect x="20" y="160" width="160" height="80" fill="#374151" rx="5"/>
        <text x="100" y="180" text-anchor="middle" fill="#fbbf24" font-family="Arial" font-size="10">Power Card</text>
      </svg>
    `;
  }
}

export const database = new InMemoryDatabase();

