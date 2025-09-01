import express from 'express';
import { database } from './database/inMemoryDatabase';
import { Character } from './types';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize database
database.initialize().then(() => {
  console.log('🚀 Overpower Deckbuilder server running on port', PORT);
  console.log('📖 API documentation available at http://localhost:' + PORT);
  
  const stats = database.getStats();
  console.log('🔍 Database loaded:', stats.characters, 'characters');
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
  const stats = database.getStats();
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Overpower Deckbuilder - Database View</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5rem;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 1.1rem;
            opacity: 0.9;
        }
        .stats {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid #e2e8f0;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            max-width: 600px;
            margin: 0 auto;
        }
        .stat-item {
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #1e3a8a;
        }
        .stat-label {
            color: #64748b;
            font-size: 0.9rem;
            margin-top: 5px;
        }
        .table-container {
            padding: 30px;
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        th {
            background: #1e3a8a;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        td {
            padding: 12px 15px;
            border-bottom: 1px solid #e2e8f0;
        }
        tr:hover {
            background: #f8fafc;
        }
        .threat-high { color: #dc2626; font-weight: bold; }
        .threat-medium { color: #ea580c; font-weight: bold; }
        .threat-low { color: #059669; font-weight: bold; }
        .special-abilities {
            max-width: 300px;
            font-size: 0.9rem;
            line-height: 1.4;
        }
        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗄️ Overpower Database</h1>
            <p>Clean, organized card database with ${stats.characters} characters</p>
        </div>
        
        <div class="stats">
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${stats.characters}</div>
                    <div class="stat-label">Characters</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${stats.users}</div>
                    <div class="stat-label">Users</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${stats.decks}</div>
                    <div class="stat-label">Decks</div>
                </div>
            </div>
        </div>
        
        <div class="table-container">
            <h2>📊 Characters Table</h2>
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
                            <td class="special-abilities">${char.special_abilities}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>Database Schema: Users | Decks | Characters</p>
            <p>Built with Node.js, Express, and TypeScript</p>
        </div>
    </div>
</body>
</html>`;
  
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`🚀 Server starting on port ${PORT}...`);
});

