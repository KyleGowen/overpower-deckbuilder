# Overpower Deckbuilder

A personal learning project for building a card game deck builder application using Node.js, TypeScript, and Express.

## Project Overview

This is a deck building application for the Overpower card game, featuring:
- Character card management
- Power card system
- Special card effects
- Deck building and management
- Sandbox mode for experimentation

## Features

- **Card Database**: 43 characters, 7 power cards, 5 special cards
- **Advanced Deckbuilder**: Interactive interface for building custom decks
- **Card Management**: Search, filter, and organize cards by type
- **Deck Statistics**: Real-time deck analysis and validation
- **Sandbox Mode**: Experiment with cards without saving
- **Deck Persistence**: Save and load custom deck configurations

## Technology Stack

- **Backend**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: In-memory database with file persistence
- **Frontend**: HTML, CSS, JavaScript
- **Build Tool**: TypeScript compiler

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
```bash
npm run dev
```
The server will start on `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## API Endpoints

- `GET /api/cards` - Get all character cards
- `GET /api/power-cards` - Get all power cards
- `GET /api/special-cards` - Get all special cards
- `GET /api/decks/sandbox` - Get current sandbox deck
- `POST /api/decks` - Create a new deck
- `PUT /api/decks/:id` - Update an existing deck

## Project Structure

```
src/
├── database/          # Database logic and data loading
├── routes/            # API route handlers
├── types/             # TypeScript type definitions
└── index.ts           # Server entry point

public/
├── index.html         # Landing page
└── deckbuilder.html   # Advanced deckbuilder interface

dist/                  # Compiled JavaScript output
```

## Data Sources

The application loads card data from markdown files:
- `overpower-erb-characters.md` - Character cards
- `overpower-erb-powercards.md` - Power cards
- `overpower-erb-aspects.md` - Special cards
- `overpower-erb-locations.md` - Location data

## Learning Goals

This project serves as a learning exercise for:
- TypeScript development
- Express.js API design
- Frontend-backend integration
- Database design patterns
- Card game mechanics implementation

## License

This is a personal learning project. All card game content belongs to their respective owners.

## Contributing

This is a personal project for learning purposes. No contributions needed.
