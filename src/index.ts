import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { cardRoutes } from './routes/cardRoutes';
import { deckRoutes } from './routes/deckRoutes';
import { databaseRoutes } from './routes/databaseRoutes';
import { specialCardRoutes } from './routes/specialCardRoutes';
import powerCardRoutes from './routes/powerCardRoutes';
import { database } from './database/inMemoryDatabase';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/cards', cardRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/special-cards', specialCardRoutes);
app.use('/api/power-cards', powerCardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Overpower Deckbuilder API is running' });
});

// Root endpoint - serve the database viewer
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Overpower Deckbuilder API',
    version: '1.0.0',
    endpoints: {
      cards: '/api/cards',
      decks: '/api/decks',
      specialCards: '/api/special-cards',
      powerCards: '/api/power-cards',
      health: '/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

async function startServer() {
  try {
    // Initialize database
    await database.initialize();
    
    // Load decks from persistence
    await database.loadDecksFromPersistence();
    
    app.listen(PORT, () => {
      console.log(`🚀 Overpower Deckbuilder server running on port ${PORT}`);
      console.log(`📖 API documentation available at http://localhost:${PORT}`);
      console.log(`🔍 Database loaded: ${database.getStats().cards} cards, ${database.getStats().decks} decks, ${database.getStats().specialCards} special cards, ${database.getStats().powerCards} power cards`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

