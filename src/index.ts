import express from 'express';
import { database } from './database/inMemoryDatabase';
import { DeckPersistenceService } from './services/deckPersistence';
import { UserPersistenceService } from './persistence/userPersistence';
import { Character } from './types';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
const deckService = new DeckPersistenceService();
const userService = new UserPersistenceService();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Cookie parser middleware
app.use((req: any, res: any, next: any) => {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    req.cookies = {};
    cookieHeader.split(';').forEach((cookie: string) => {
      const [name, value] = cookie.trim().split('=');
      req.cookies[name] = value;
    });
  }
  next();
});

// Serve card images from resources directory
app.use('/src/resources/cards/images', express.static(path.join(process.cwd(), 'src/resources/cards/images')));

// Serve general images from resources directory
app.use('/src/resources/images', express.static(path.join(process.cwd(), 'src/resources/images')));

// Initialize database
database.initialize().then(() => {
  console.log('🚀 Overpower Deckbuilder server running on port', PORT);
  console.log('📖 API documentation available at http://localhost:' + PORT);
  
  const stats = database.getStats();
  console.log('🔍 Database loaded:', stats.characters, 'characters,', stats.locations, 'locations');
});

// Authentication middleware
const authenticateUser = (req: any, res: any, next: any) => {
  const sessionId = req.cookies?.sessionId;
  
  if (!sessionId) {
    return res.status(401).json({ success: false, error: 'No session found. Please log in.' });
  }
  
  const session = userService.validateSession(sessionId);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session. Please log in again.' });
  }
  
  req.user = session;
  next();
};

// User authentication endpoints
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }
    
    const user = userService.authenticateUser(username, password);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }
    
    const sessionId = userService.createSession(user);
    
    // Set session cookie (2 hours expiration)
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      sameSite: 'lax'
    });
    
    res.json({ 
      success: true, 
      data: { 
        userId: user.id, 
        username: user.username 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    
    if (sessionId) {
      userService.logout(sessionId);
    }
    
    res.clearCookie('sessionId');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, error: 'Logout failed' });
  }
});

app.get('/api/auth/me', authenticateUser, (req: any, res) => {
  try {
    res.json({ 
      success: true, 
      data: { 
        userId: req.user.userId, 
        username: req.user.username 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get user info' });
  }
});

// API Routes
app.get('/api/characters', (req, res) => {
  try {
    const characters = database.getAllCharacters();
    res.json({ success: true, data: characters });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch characters' });
  }
});

app.get('/api/locations', (req, res) => {
  try {
    const locations = database.getAllLocations();
    res.json({ success: true, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch locations' });
  }
});

app.get('/api/special-cards', (req, res) => {
  try {
    const specialCards = database.getAllSpecialCards();
    res.json({ success: true, data: specialCards });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch special cards' });
  }
});

app.get('/api/missions', (req, res) => {
  try {
    const missions = database.getAllMissions();
    res.json({ success: true, data: missions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch missions' });
  }
});

app.get('/api/events', (req, res) => {
  try {
    const events = database.getAllEvents();
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
});

app.get('/api/aspects', (req, res) => {
  try {
    const aspects = database.getAllAspects();
    res.json({ success: true, data: aspects });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch aspects' });
  }
});

app.get('/api/advanced-universe', (req, res) => {
  try {
    const advancedUniverse = database.getAllAdvancedUniverse();
    res.json({ success: true, data: advancedUniverse });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch advanced universe' });
  }
});

app.get('/api/teamwork', (req, res) => {
  try {
    const teamwork = database.getAllTeamwork();
    res.json({ success: true, data: teamwork });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch teamwork' });
  }
});

app.get('/api/ally-universe', (req, res) => {
  try {
    const ally = database.getAllAllyUniverse();
    res.json({ success: true, data: ally });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch ally universe' });
  }
});

app.get('/api/training', (req, res) => {
  try {
    const training = database.getAllTraining();
    res.json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch training cards' });
  }
});

app.get('/api/basic-universe', (req, res) => {
  try {
    const basicUniverse = database.getAllBasicUniverse();
    res.json({ success: true, data: basicUniverse });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch basic universe cards' });
  }
});

app.get('/api/power-cards', (req, res) => {
  try {
    const powerCards = database.getAllPowerCards();
    res.json({ success: true, data: powerCards });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch power cards' });
  }
});

app.get('/test', (req, res) => {
  const characters = database.getAllCharacters();
  const locations = database.getAllLocations();
  const stats = database.getStats();
  
  res.json({
    characters: characters.length,
    locations: locations.length,
    stats: stats,
    sampleLocation: locations[0]
  });
});

app.get('/api/users', (req, res) => {
  try {
    const users = database.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

app.get('/api/decks', authenticateUser, (req: any, res) => {
  try {
    const decks = deckService.getDecksByUser(req.user.userId);
    res.json({ success: true, data: decks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch decks' });
  }
});

// Deck management API routes
app.post('/api/decks', authenticateUser, (req: any, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Deck name is required' });
    }
    
    const deck = deckService.createDeck(name, req.user.userId, description);
    res.json({ success: true, data: deck });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create deck' });
  }
});

app.get('/api/decks/:id', authenticateUser, (req: any, res) => {
  try {
    const deck = deckService.getDeck(req.params.id);
    if (!deck) {
      return res.status(404).json({ success: false, error: 'Deck not found' });
    }
    
    // Check if user owns this deck
    if (!deckService.userOwnsDeck(req.params.id, req.user.userId)) {
      return res.status(403).json({ success: false, error: 'Access denied. You do not own this deck.' });
    }
    
    res.json({ success: true, data: deck });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch deck' });
  }
});

app.put('/api/decks/:id', authenticateUser, (req: any, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if user owns this deck
    if (!deckService.userOwnsDeck(req.params.id, req.user.userId)) {
      return res.status(403).json({ success: false, error: 'Access denied. You do not own this deck.' });
    }
    
    const deck = deckService.updateDeckMetadata(req.params.id, { name, description });
    if (!deck) {
      return res.status(404).json({ success: false, error: 'Deck not found' });
    }
    res.json({ success: true, data: deck });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update deck' });
  }
});

app.delete('/api/decks/:id', authenticateUser, (req: any, res) => {
  try {
    // Check if user owns this deck
    if (!deckService.userOwnsDeck(req.params.id, req.user.userId)) {
      return res.status(403).json({ success: false, error: 'Access denied. You do not own this deck.' });
    }
    
    const success = deckService.deleteDeck(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Deck not found' });
    }
    res.json({ success: true, message: 'Deck deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete deck' });
  }
});

app.post('/api/decks/:id/cards', authenticateUser, (req: any, res) => {
  try {
    const { cardType, cardId, quantity } = req.body;
    if (!cardType || !cardId) {
      return res.status(400).json({ success: false, error: 'Card type and card ID are required' });
    }
    
    // Check if user owns this deck
    if (!deckService.userOwnsDeck(req.params.id, req.user.userId)) {
      return res.status(403).json({ success: false, error: 'Access denied. You do not own this deck.' });
    }
    
    const deck = deckService.addCardToDeck(req.params.id, cardType, cardId, quantity || 1);
    if (!deck) {
      return res.status(404).json({ success: false, error: 'Deck not found' });
    }
    res.json({ success: true, data: deck });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add card to deck' });
  }
});

app.delete('/api/decks/:id/cards', authenticateUser, (req: any, res) => {
  try {
    const { cardType, cardId, quantity } = req.body;
    if (!cardType || !cardId) {
      return res.status(400).json({ success: false, error: 'Card type and card ID are required' });
    }
    
    // Check if user owns this deck
    if (!deckService.userOwnsDeck(req.params.id, req.user.userId)) {
      return res.status(403).json({ success: false, error: 'Access denied. You do not own this deck.' });
    }
    
    const deck = deckService.removeCardFromDeck(req.params.id, cardType, cardId, quantity || 1);
    if (!deck) {
      return res.status(404).json({ success: false, error: 'Deck not found' });
    }
    res.json({ success: true, data: deck });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to remove card from deck' });
  }
});

app.get('/api/deck-stats', authenticateUser, (req: any, res) => {
  try {
    const userDecks = deckService.getDecksByUser(req.user.userId);
    const totalCards = userDecks.reduce((total, deck) => total + deck.cardCount, 0);
    const stats = { totalDecks: userDecks.length, totalCards };
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch deck stats' });
  }
});

// Main page route - displays characters table
app.get('/', (req, res) => {
  const characters = database.getAllCharacters();
  const locations = database.getAllLocations();
  const stats = database.getStats();
  
  console.log('📊 Rendering page with:', characters.length, 'characters and', locations.length, 'locations');
  
  const html = `<!DOCTYPE html>
<html>
<head>
    <title>Overpower Database</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-item { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .stat-number { font-size: 2rem; font-weight: bold; color: #007bff; }
        .table-container { margin-bottom: 40px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #007bff; color: white; }
        .threat-high { color: #dc3545; font-weight: bold; }
        .threat-medium { color: #fd7e14; font-weight: bold; }
        .threat-low { color: #28a745; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗄️ Overpower Database</h1>
            <p>Database with ${stats.characters} characters and ${stats.locations} locations</p>
        </div>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number">${stats.characters}</div>
                <div>Characters</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.locations}</div>
                <div>Locations</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.users}</div>
                <div>Users</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.decks}</div>
                <div>Decks</div>
            </div>
        </div>
        
        <div class="table-container">
            <h2>📊 Characters (${characters.length})</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Energy</th>
                        <th>Combat</th>
                        <th>Brute Force</th>
                        <th>Intelligence</th>
                        <th>Threat Level</th>
                        <th>Special Abilities</th>
                    </tr>
                </thead>
                <tbody>
                    ${characters.map(char => `
                        <tr>
                            <td><strong>${char.name}</strong></td>
                            <td>${char.energy}</td>
                            <td>${char.combat}</td>
                            <td>${char.brute_force}</td>
                            <td>${char.intelligence}</td>
                            <td class="${char.threat_level >= 20 ? 'threat-high' : char.threat_level >= 15 ? 'threat-medium' : 'threat-low'}">
                                ${char.threat_level}
                            </td>
                            <td>${char.special_abilities}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="table-container">
            <h2>🗺️ Locations (${locations.length})</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Threat Level</th>
                        <th>Special Ability</th>
                    </tr>
                </thead>
                <tbody>
                    ${locations.map(loc => `
                        <tr>
                            <td><strong>${loc.name}</strong></td>
                            <td class="${loc.threat_level >= 3 ? 'threat-high' : loc.threat_level >= 1 ? 'threat-medium' : 'threat-low'}">
                                ${loc.threat_level}
                            </td>
                            <td>${loc.special_ability}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`;
  
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`🚀 Server starting on port ${PORT}...`);
});

