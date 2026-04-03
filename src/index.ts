import 'dotenv/config';
import express from 'express';
import { DataSourceConfig } from './config/DataSourceConfig';
import { DeckPersistenceService } from './services/deckPersistence';
import { DatabaseInitializationService } from './services/databaseInitialization';
import { DeckService } from './services/deckService';
import { AuthenticationService } from './services/AuthenticationService';
import { NewUserSampleDeckService } from './services/newUserSampleDeckService';
import { DeckValidationService } from './services/deckValidationService';
import { CollectionsRepository } from './database/collectionsRepository';
import { CollectionService } from './services/collectionService';
import { DeckBackgroundService } from './services/deckBackgroundService';
import { GuestDeckPersistenceService } from './services/guestDeckPersistence';
import { FoilCardMapRepository } from './database/foilCardMapRepository';
import { createDeckRoutes } from './routes/decks.routes';
import { registerRoutes, type RouteDependencies } from './routes';
import { transformDeckList } from './api/deckTransform';
import { CatalogService } from './api/services/catalogService';
import { registerApiV1Routes } from './api/http/registerApiV1Routes';
import { requireAdmin, blockGuestMutation, requireDeckOwner } from './middleware/authorizationHelpers';
import { setupMiddleware } from './middleware/setup';
import { execSync } from 'child_process';

export const app = express();
const PORT = process.env.PORT || 8085;

// Trust proxy for correct req.ip when behind nginx/load balancer (see src/middleware/README.md)
app.set('trust proxy', 1);

// Deck building rules constants
const DECK_RULES = {
  MIN_DECK_SIZE: 51,
  MIN_DECK_SIZE_WITH_EVENTS: 56,
  EXACT_CHARACTERS: 4,
  MAX_TOTAL_THREAT: 76,
  MAX_COPIES_ONE_PER_DECK: 1,
  EXACT_MISSION_CARDS: 7,
  MAX_LOCATIONS: 1
};

// Helper function to check if a card is cataclysm
export async function checkIfCardIsCataclysm(cardType: string, cardId: string): Promise<boolean> {
  try {
    // Only special cards can be cataclysm
    if (cardType !== 'special') {
      return false;
    }
    
    const cardData = await cardRepository.getSpecialCardById(cardId);
    return !!(cardData && cardData.is_cataclysm === true);
  } catch (error) {
    console.error('Error checking if card is cataclysm:', error);
    return false; // Default to not cataclysm if we can't determine
  }
}

// Helper function to check if a card is assist
export async function checkIfCardIsAssist(cardType: string, cardId: string): Promise<boolean> {
  try {
    // Only special cards can be assist
    if (cardType !== 'special') {
      return false;
    }
    
    const cardData = await cardRepository.getSpecialCardById(cardId);
    return !!(cardData && cardData.is_assist === true);
  } catch (error) {
    console.error('Error checking if card is assist:', error);
    return false; // Default to not assist if we can't determine
  }
}

// Helper function to check if a card is ambush
export async function checkIfCardIsAmbush(cardType: string, cardId: string): Promise<boolean> {
  try {
    // Only special cards can be ambush
    if (cardType !== 'special') {
      return false;
    }
    
    const cardData = await cardRepository.getSpecialCardById(cardId);
    return !!(cardData && cardData.is_ambush === true);
  } catch (error) {
    console.error('Error checking if card is ambush:', error);
    return false; // Default to not ambush if we can't determine
  }
}

// Helper function to check if a card is fortification
export async function checkIfCardIsFortification(cardType: string, cardId: string): Promise<boolean> {
  try {
    // Only aspect cards can be fortification
    if (cardType !== 'aspect') {
      return false;
    }
    
    const cardData = await cardRepository.getAspectById(cardId);
    return !!(cardData && cardData.is_fortification === true);
  } catch (error) {
    console.error('Error checking if card is fortification:', error);
    return false; // Default to not fortification if we can't determine
  }
}

// Helper function to check if a card is one-per-deck
export async function checkIfCardIsOnePerDeck(cardType: string, cardId: string): Promise<boolean> {
  try {
    // Get the card data from the appropriate repository based on card type
    let cardData: unknown = null;
    
    switch (cardType) {
      case 'character':
        cardData = await cardRepository.getCharacterById(cardId);
        break;
      case 'special':
        cardData = await cardRepository.getSpecialCardById(cardId);
        break;
      case 'power':
        cardData = await cardRepository.getPowerCardById(cardId);
        break;
      case 'mission':
        cardData = await cardRepository.getMissionById(cardId);
        break;
      case 'event':
        cardData = await cardRepository.getEventById(cardId);
        break;
      case 'aspect':
        cardData = await cardRepository.getAspectById(cardId);
        break;
      case 'location':
        cardData = await cardRepository.getLocationById(cardId);
        break;
      case 'advanced-universe':
        cardData = await cardRepository.getAdvancedUniverseById(cardId);
        break;
      case 'teamwork':
        cardData = await cardRepository.getTeamworkById(cardId);
        break;
      case 'ally-universe':
        cardData = await cardRepository.getAllyUniverseById(cardId);
        break;
      case 'training':
        cardData = await cardRepository.getTrainingById(cardId);
        break;
      case 'basic-universe':
        cardData = await cardRepository.getBasicUniverseById(cardId);
        break;
      default:
        return false; // Unknown card type, not one-per-deck
    }
    
    const d = cardData as { one_per_deck?: boolean; is_one_per_deck?: boolean } | null;
    return !!(d && (d.one_per_deck === true || d.is_one_per_deck === true));
  } catch (error) {
    console.error('Error checking if card is one-per-deck:', error);
    return false; // Default to not one-per-deck if we can't determine
  }
}

// Function to validate adding a single card to a deck
type CardForValidation = { type: string; cardId: string; quantity: number };

export async function validateCardAddition(currentCards: CardForValidation[], cardType: string, cardId: string, quantity: number): Promise<string | null> {
  const normId = (id: string) => String(id).trim();

  // Characters: at most one deck row per character id (quantity must not stack)
  if (cardType === 'character') {
    const incoming = normId(cardId);
    const already = currentCards.some(
      c => c.type === 'character' && normId(c.cardId) === incoming && (c.quantity ?? 0) > 0
    );
    if (already) {
      return 'This character is already in the deck';
    }
  }

  // Locations: at most one location total (matches client addCardToEditor)
  if (cardType === 'location') {
    const hasLocation = currentCards.some(c => c.type === 'location' && (c.quantity ?? 0) > 0);
    if (hasLocation) {
      return 'Cannot add more than 1 location to a deck';
    }
  }

  // Create a copy of current cards and add the new card
  const testCards = [...currentCards];
  
  // Add the new card to test deck
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
  
  // Count card types
  const cardCounts: { [key: string]: number } = {};
  const characterCards: CardForValidation[] = [];
  const missionCards: CardForValidation[] = [];
  const locationCards: CardForValidation[] = [];
  
  testCards.forEach(card => {
    const type = card.type;
    cardCounts[type] = (cardCounts[type] || 0) + card.quantity;
    
    if (type === 'character') {
      characterCards.push(card);
    } else if (type === 'mission') {
      missionCards.push(card);
    } else if (type === 'location') {
      locationCards.push(card);
    }
  });
  
  // Rule 1: Exactly 4 characters
  if (characterCards.length > DECK_RULES.EXACT_CHARACTERS) {
    return `Deck cannot have more than ${DECK_RULES.EXACT_CHARACTERS} characters (would have ${characterCards.length})`;
  }
  
  // Rule 2: Exactly 7 mission cards
  if (missionCards.length > DECK_RULES.EXACT_MISSION_CARDS) {
    return `Deck cannot have more than ${DECK_RULES.EXACT_MISSION_CARDS} mission cards (would have ${missionCards.length})`;
  }
  
  // Rule 3: Maximum 1 location
  if (locationCards.length > DECK_RULES.MAX_LOCATIONS) {
    return `Deck cannot have more than ${DECK_RULES.MAX_LOCATIONS} location (would have ${locationCards.length})`;
  }
  
  // Rule 4: Check for "One Per Deck" cards
  // Check if the card being added is one-per-deck
  const isOnePerDeck = await checkIfCardIsOnePerDeck(cardType, cardId);
  if (isOnePerDeck) {
    // Check if this card already exists in the current deck (before adding)
    const existingCard = currentCards.find(card => card.type === cardType && card.cardId === cardId);
    if (existingCard && existingCard.quantity > 0) {
      return `Cannot add more copies of "${cardId}" - this card is limited to one per deck`;
    }
  }
  
  // Check all cards in the test deck for one-per-deck violations
  const onePerDeckCards: { [key: string]: number } = {};
  for (const card of testCards) {
    const isOnePerDeck = await checkIfCardIsOnePerDeck(card.type, card.cardId);
    if (isOnePerDeck) {
      const cardKey = `${card.type}_${card.cardId}`;
      onePerDeckCards[cardKey] = (onePerDeckCards[cardKey] || 0) + card.quantity;
    }
  }
  
  for (const [cardKey, count] of Object.entries(onePerDeckCards)) {
    if (count > DECK_RULES.MAX_COPIES_ONE_PER_DECK) {
      const [type, cardId] = cardKey.split('_', 2);
      return `Cannot add more copies of "${cardId}" - this ${type} card is limited to one per deck`;
    }
  }
  
  // Rule 5: Check for Cataclysm cards (only one cataclysm per deck)
  const cataclysmCards: CardForValidation[] = [];
  for (const card of testCards) {
    const isCataclysm = await checkIfCardIsCataclysm(card.type, card.cardId);
    if (isCataclysm) {
      cataclysmCards.push(card);
    }
  }
  
  if (cataclysmCards.length > 1) {
    return `Cannot add more than 1 Cataclysm to a deck (would have ${cataclysmCards.length})`;
  }
  
  // Rule 6: Check for Assist cards (only one assist per deck)
  const assistCards: CardForValidation[] = [];
  for (const card of testCards) {
    const isAssist = await checkIfCardIsAssist(card.type, card.cardId);
    if (isAssist) {
      assistCards.push(card);
    }
  }
  
  if (assistCards.length > 1) {
    return `Cannot add more than 1 Assist to a deck (would have ${assistCards.length})`;
  }
  
  // Rule 7: Check for Ambush cards (only one ambush per deck)
  const ambushCards: CardForValidation[] = [];
  for (const card of testCards) {
    const isAmbush = await checkIfCardIsAmbush(card.type, card.cardId);
    if (isAmbush) {
      ambushCards.push(card);
    }
  }
  
  if (ambushCards.length > 1) {
    return `Cannot add more than 1 Ambush to a deck (would have ${ambushCards.length})`;
  }
  
  // Rule 8: Check for Fortification cards (only one fortification per deck)
  const fortificationCards: CardForValidation[] = [];
  for (const card of testCards) {
    const isFortification = await checkIfCardIsFortification(card.type, card.cardId);
    if (isFortification) {
      fortificationCards.push(card);
    }
  }
  
  if (fortificationCards.length > 1) {
    return `Cannot add more than 1 Fortification to a deck (would have ${fortificationCards.length})`;
  }
  
  return null; // No validation errors
}

// Initialize services
new DeckPersistenceService();
const databaseInit = new DatabaseInitializationService();
const dataSource = DataSourceConfig.getInstance();
const userRepository = dataSource.getUserRepository();
const deckRepository = dataSource.getDeckRepository();
const cardRepository = dataSource.getCardRepository();
const deckValidationService = new DeckValidationService(cardRepository);

// Initialize business logic service
const deckBusinessService = new DeckService(deckRepository);

// Initialize authentication service
const newUserSampleDeckService = new NewUserSampleDeckService(userRepository, deckRepository);
const authService = new AuthenticationService(userRepository, newUserSampleDeckService);

// Initialize collection repository and service
const collectionsRepository = new CollectionsRepository(dataSource.getPool());
const collectionService = new CollectionService(collectionsRepository);

// Initialize deck background service
const deckBackgroundService = new DeckBackgroundService();

// Initialize guest deck persistence (session-scoped, in-memory; not persisted to DB)
const guestDeckPersistence = new GuestDeckPersistenceService();

// Exported for test server bootstrap (M2) so test app can reuse same DB init and guest deck cleanup
export { databaseInit, guestDeckPersistence };

// Initialize foil card map repository
const foilCardMapRepository = new FoilCardMapRepository(dataSource.getPool());

const catalogService = new CatalogService(cardRepository, foilCardMapRepository);

// Function to get git information
function getGitInfo() {
  // In production (Docker), use environment variables set during build
  if (process.env.NODE_ENV === 'production') {
    return {
      commit: process.env.GIT_COMMIT || 'unknown',
      shortCommit: process.env.GIT_SHORT_COMMIT || 'unknown',
      branch: process.env.GIT_BRANCH || 'unknown',
      commitDate: process.env.GIT_COMMIT_DATE || 'unknown',
      commitMessage: process.env.GIT_COMMIT_MESSAGE || 'unknown',
      commitAuthor: process.env.GIT_COMMIT_AUTHOR || 'unknown',
      commitEmail: process.env.GIT_COMMIT_EMAIL || 'unknown'
    };
  }
  
  // In development, try to run git commands
  try {
    const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    const shortCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const commitDate = execSync('git log -1 --format=%ci', { encoding: 'utf8' }).trim();
    const commitMessage = execSync('git log -1 --format=%s', { encoding: 'utf8' }).trim();
    const commitAuthor = execSync('git log -1 --format=%an', { encoding: 'utf8' }).trim();
    const commitEmail = execSync('git log -1 --format=%ae', { encoding: 'utf8' }).trim();
    return { 
      commit, 
      shortCommit,
      branch, 
      commitDate,
      commitMessage,
      commitAuthor,
      commitEmail
    };
  } catch {
    return { 
      commit: 'unknown', 
      shortCommit: 'unknown',
      branch: 'unknown',
      commitDate: 'unknown',
      commitMessage: 'unknown',
      commitAuthor: 'unknown',
      commitEmail: 'unknown'
    };
  }
}

// Middleware (first block: body, cookie, static image mounts)
setupMiddleware(app);

// Initialize database
async function initializeServer() {
  try {
    console.log('🔄 Starting server initialization...');
    
    // First, initialize database with Flyway migrations and data
    await databaseInit.initializeDatabase();

    // Migrations may have changed card rows; drop cached /api/characters (etc.) from any prior in-process state
    (cardRepository as { clearCaches?: () => void }).clearCaches?.();
    
    // Then initialize the in-memory repositories
    await Promise.all([
      userRepository.initialize(),
      deckRepository.initialize(),
      cardRepository.initialize()
    ]);
    
    console.log('🚀 Excelsior Deckbuilder server running on port', PORT);
    console.log('📖 API documentation available at http://localhost:' + PORT);
    
    // Start the server
    // In production/Docker, bind to 0.0.0.0 to accept connections from nginx
    // In development, bind to 127.0.0.1 to avoid macOS firewall restrictions
    const port = typeof PORT === 'string' ? parseInt(PORT) : PORT;
    const bindAddress = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
    app.listen(port, bindAddress, () => {
      console.log('🌐 Server is listening on port', port, 'on', bindAddress);
    });
    
    // Try to get card stats in the background (non-blocking)
    cardRepository.getCardStats()
      .then(cardStats => {
        console.log('🔍 Database loaded:', cardStats.characters, 'characters,', cardStats.locations, 'locations');
      })
      .catch(err => {
        console.warn('⚠️ Could not load card stats (server still running):', err.message);
      });
    
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    } else {
      // In tests, rethrow to allow the test runner to handle the failure without exiting
      throw error;
    }
  }
}

// Start the server (skip during unit tests)
if (process.env.NODE_ENV !== 'test') {
  initializeServer();
}

// Authentication middleware
const authenticateUser = authService.createAuthMiddleware();

registerRoutes(app, {
  authService,
  authenticateUser,
  deckRepository,
  cardRepository,
  catalogService,
  userRepository,
  deckValidationService,
  deckBusinessService,
  collectionService,
  deckBackgroundService,
  guestDeckPersistence,
  foilCardMapRepository,
  databaseInit,
  dataSource,
  validateCardAddition,
  checkIfCardIsCataclysm,
  checkIfCardIsAssist,
  checkIfCardIsAmbush,
  checkIfCardIsFortification,
  checkIfCardIsOnePerDeck,
  getGitInfo,
  requireAdmin,
  blockGuestMutation,
  requireDeckOwner,
  createDeckRoutes,
  transformDeckList
} as unknown as RouteDependencies);

registerApiV1Routes(app, {
  authenticationService: authService,
  userRepository,
  catalogService
});

// Export app for testing
export default app;
