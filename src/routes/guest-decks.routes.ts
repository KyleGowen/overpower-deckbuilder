import express, { Request } from 'express';
import { DeckData, DeckCard } from '../types';
import { requireGuestSession, transformGuestDeckToListItem } from './helpers';
import type { GuestDeckRoutesDeps } from './types';

export function registerGuestDeckRoutes(app: express.Application, deps: GuestDeckRoutesDeps): void {
  app.post('/api/guest/decks', deps.authenticateUser, async (req: Request, res) => {
    try {
      const sessionId = requireGuestSession(req, res);
      if (!sessionId) return;

      const name = (req.body.name && typeof req.body.name === 'string') ? req.body.name.trim() : 'New Deck';
      const description = (req.body.description && typeof req.body.description === 'string') ? req.body.description : '';
      if (name.length > 100) {
        return res.status(400).json({ success: false, error: 'Deck name must be 100 characters or less' });
      }
      if (description.length > 500) {
        return res.status(400).json({ success: false, error: 'Description must be 500 characters or less' });
      }

      const now = new Date().toISOString();
      const deckData: DeckData = {
        metadata: {
          id: '',
          name,
          description,
          created: now,
          lastModified: now,
          cardCount: 0,
          userId: sessionId
        },
        cards: []
      };
      const deckId = deps.guestDeckPersistence.createDeck(sessionId, deckData);
      const created = deps.guestDeckPersistence.getDeck(sessionId, deckId)!;
      res.status(201).json({
        success: true,
        data: {
          id: deckId,
          name: created.metadata.name,
          description: created.metadata.description ?? '',
          created_at: created.metadata.created,
          updated_at: created.metadata.lastModified
        }
      });
    } catch (error) {
      console.error('Error creating guest deck:', error);
      res.status(500).json({ success: false, error: 'Failed to create guest deck' });
    }
  });

  app.get('/api/guest/decks', deps.authenticateUser, async (req: Request, res) => {
    try {
      const sessionId = requireGuestSession(req, res);
      if (!sessionId) return;

      const dbDecks = await deps.deckRepository.getDecksByUserId(req.user!.id);
      const dbTransformed = deps.transformDeckList(dbDecks);

      const sessionDecks = deps.guestDeckPersistence.getAllDecksForSession(sessionId);
      const sessionTransformed = sessionDecks.map(transformGuestDeckToListItem);

      res.json({ success: true, data: [...dbTransformed, ...sessionTransformed] });
    } catch (error) {
      console.error('Error fetching guest decks:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch guest decks' });
    }
  });

  app.get('/api/guest/decks/:id', deps.authenticateUser, async (req: Request, res) => {
    try {
      const sessionId = requireGuestSession(req, res);
      if (!sessionId) return;

      const deckData = deps.guestDeckPersistence.getDeck(sessionId, req.params.id);
      if (!deckData) {
        return res.status(404).json({ success: false, error: 'Deck not found' });
      }
      const transformed = {
        metadata: {
          ...deckData.metadata,
          isOwner: true
        },
        cards: deckData.cards || []
      };
      res.json({ success: true, data: transformed });
    } catch (error) {
      console.error('Error fetching guest deck:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch guest deck' });
    }
  });

  app.put('/api/guest/decks/:id', deps.authenticateUser, async (req: Request, res) => {
    try {
      const sessionId = requireGuestSession(req, res);
      if (!sessionId) return;

      const existing = deps.guestDeckPersistence.getDeck(sessionId, req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Deck not found' });
      }

      const name = req.body.name !== undefined ? (typeof req.body.name === 'string' ? req.body.name.trim() : existing.metadata.name) : existing.metadata.name;
      const description = req.body.description !== undefined ? (typeof req.body.description === 'string' ? req.body.description : existing.metadata.description) : existing.metadata.description;
      if (name.length > 100) {
        return res.status(400).json({ success: false, error: 'Deck name must be 100 characters or less' });
      }
      if (description && description.length > 500) {
        return res.status(400).json({ success: false, error: 'Description must be 500 characters or less' });
      }

      const updated: DeckData = {
        metadata: {
          ...existing.metadata,
          name,
          description: description ?? '',
          lastModified: new Date().toISOString()
        },
        cards: existing.cards
      };
      const ok = deps.guestDeckPersistence.updateDeck(sessionId, req.params.id, updated);
      if (!ok) {
        return res.status(404).json({ success: false, error: 'Deck not found' });
      }
      const result = deps.guestDeckPersistence.getDeck(sessionId, req.params.id)!;
      res.json({ success: true, data: transformGuestDeckToListItem(result) });
    } catch (error) {
      console.error('Error updating guest deck:', error);
      res.status(500).json({ success: false, error: 'Failed to update guest deck' });
    }
  });

  app.put('/api/guest/decks/:id/cards', deps.authenticateUser, async (req: Request, res) => {
    try {
      const sessionId = requireGuestSession(req, res);
      if (!sessionId) return;

      const existing = deps.guestDeckPersistence.getDeck(sessionId, req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Deck not found' });
      }

      const { cards } = req.body;
      if (!Array.isArray(cards)) {
        return res.status(400).json({ success: false, error: 'Cards must be an array' });
      }
      if (cards.length > 100) {
        return res.status(400).json({ success: false, error: 'Cannot replace more than 100 cards at once' });
      }
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (!card || typeof card !== 'object') {
          return res.status(400).json({ success: false, error: `Card at index ${i} must be an object` });
        }
        if (!card.cardType || typeof card.cardType !== 'string' || card.cardType.trim().length === 0) {
          return res.status(400).json({ success: false, error: `Card at index ${i}: cardType is required` });
        }
        if (!card.cardId || typeof card.cardId !== 'string' || card.cardId.trim().length === 0) {
          return res.status(400).json({ success: false, error: `Card at index ${i}: cardId is required` });
        }
        if (card.quantity !== undefined && (typeof card.quantity !== 'number' || card.quantity < 1 || card.quantity > 10)) {
          return res.status(400).json({ success: false, error: `Card at index ${i}: quantity must be 1-10` });
        }
      }

      const cardCount = cards.reduce((sum: number, c: { quantity?: number }) => sum + (c.quantity ?? 1), 0);
      const mappedCards: DeckCard[] = cards.map((c: { cardType: string; cardId: string; quantity?: number; exclude_from_draw?: boolean }, i: number) => ({
        id: `guest-${req.params.id}-${i}`,
        type: c.cardType as DeckCard['type'],
        cardId: c.cardId,
        quantity: c.quantity ?? 1,
        ...(c.exclude_from_draw !== undefined && { exclude_from_draw: c.exclude_from_draw })
      }));
      const updated: DeckData = {
        metadata: {
          ...existing.metadata,
          lastModified: new Date().toISOString(),
          cardCount
        },
        cards: mappedCards
      };
      const ok = deps.guestDeckPersistence.updateDeck(sessionId, req.params.id, updated);
      if (!ok) {
        return res.status(404).json({ success: false, error: 'Deck not found' });
      }
      const result = deps.guestDeckPersistence.getDeck(sessionId, req.params.id)!;
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error replacing guest deck cards:', error);
      res.status(500).json({ success: false, error: 'Failed to replace guest deck cards' });
    }
  });

  app.post('/api/guest/decks/:id/cards', deps.authenticateUser, async (req: Request, res) => {
    try {
      const sessionId = requireGuestSession(req, res);
      if (!sessionId) return;

      const existing = deps.guestDeckPersistence.getDeck(sessionId, req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Deck not found' });
      }

      const { cardType, cardId, quantity } = req.body;
      if (!cardType || typeof cardType !== 'string' || cardType.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Card type is required and must be a non-empty string' });
      }
      if (!cardId || typeof cardId !== 'string' || cardId.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Card ID is required and must be a non-empty string' });
      }
      const qty = quantity === undefined ? 1 : (typeof quantity === 'number' && quantity >= 1 && quantity <= 10 ? quantity : 1);

      const currentCards = existing.cards || [];
      const validationError = await deps.validateCardAddition(currentCards, cardType, cardId, qty);
      if (validationError) {
        return res.status(400).json({ success: false, error: validationError });
      }
      const isOnePerDeck = await deps.checkIfCardIsOnePerDeck(cardType, cardId);
      if (isOnePerDeck && currentCards.some((c: DeckCard) => c.type === cardType && c.cardId === cardId)) {
        return res.status(400).json({ success: false, error: 'Cannot add more copies of this card - it is limited to one per deck' });
      }
      const isCataclysm = await deps.checkIfCardIsCataclysm(cardType, cardId);
      if (isCataclysm) {
        let hasExisting = false;
        for (const c of currentCards) {
          if (await deps.checkIfCardIsCataclysm(c.type, c.cardId)) {
            hasExisting = true;
            break;
          }
        }
        if (hasExisting) {
          return res.status(400).json({ success: false, error: 'Cannot add more than 1 Cataclysm to a deck' });
        }
      }

      const newCard: DeckCard = {
        id: `guest-${req.params.id}-${currentCards.length}`,
        type: cardType as DeckCard['type'],
        cardId,
        quantity: qty
      };
      const updatedCards = [...currentCards, newCard];
      const cardCount = updatedCards.reduce((sum: number, c: DeckCard) => sum + (c.quantity ?? 1), 0);
      const updated: DeckData = {
        metadata: {
          ...existing.metadata,
          lastModified: new Date().toISOString(),
          cardCount
        },
        cards: updatedCards
      };
      const ok = deps.guestDeckPersistence.updateDeck(sessionId, req.params.id, updated);
      if (!ok) {
        return res.status(404).json({ success: false, error: 'Deck not found' });
      }
      const result = deps.guestDeckPersistence.getDeck(sessionId, req.params.id)!;
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error adding card to guest deck:', error);
      res.status(500).json({ success: false, error: 'Failed to add card to guest deck' });
    }
  });

  app.delete('/api/guest/decks/:id', deps.authenticateUser, async (req: Request, res) => {
    try {
      const sessionId = requireGuestSession(req, res);
      if (!sessionId) return;

      const ok = deps.guestDeckPersistence.deleteDeck(sessionId, req.params.id);
      if (!ok) {
        return res.status(404).json({ success: false, error: 'Deck not found' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting guest deck:', error);
      res.status(500).json({ success: false, error: 'Failed to delete guest deck' });
    }
  });
}
