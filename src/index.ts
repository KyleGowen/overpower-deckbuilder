import express from 'express';
import { database } from './database/inMemoryDatabase';
import { Character } from './types';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Serve card images from resources directory
app.use('/src/resources/cards/images', express.static(path.join(__dirname, 'resources/cards/images')));

// Initialize database
database.initialize().then(() => {
  console.log('🚀 Overpower Deckbuilder server running on port', PORT);
  console.log('📖 API documentation available at http://localhost:' + PORT);
  
  const stats = database.getStats();
  console.log('🔍 Database loaded:', stats.characters, 'characters,', stats.locations, 'locations');
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

app.get('/api/decks', (req, res) => {
  try {
    const decks = database.getAllDecks();
    res.json({ success: true, data: decks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch decks' });
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

