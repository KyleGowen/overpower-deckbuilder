import crypto from 'crypto';
import type { Request, RequestHandler, Response, Router } from 'express';
import { checkRateLimit, blockInReadOnlyMode } from '../../routes/helpers';
import type { DeckWriteService } from '../services/deckWriteService';
import type { DeckListService } from '../services/deckListService';
import type { DeckCreateV1DataDto } from '../dto/v1/DeckCreateV1DataDto';
import type { DeckValidateV1SuccessDto } from '../dto/v1/DeckValidateV1SuccessDto';
import type { V1Envelope } from './v1Envelope';
import { sendV1Json, sendV1Success } from './v1Envelope';
import { CreateDeckRequestBody } from './models/decks/CreateDeckRequestBody';
import { ValidateDeckRequestBody } from './models/decks/ValidateDeckRequestBody';

export interface DecksV1HttpDeps {
  deckListService: DeckListService;
  deckWriteService: DeckWriteService;
  authenticateUser: RequestHandler;
}

function stableV1DeckListBody<T>(data: T): string {
  const envelope: V1Envelope<T> = { data, meta: {}, errors: [] };
  return JSON.stringify(envelope);
}

function sendGuestForbiddenV1(res: Response, operation: string): void {
  sendV1Json(res, 403, null, [
    { code: 'GUEST_FORBIDDEN', message: `Guests may not ${operation}` }
  ]);
}

export function registerDecksV1HttpRoutes(router: Router, deps: DecksV1HttpDeps): void {
  router.get('/decks', deps.authenticateUser, async (req, res) => {
    try {
      const userId = req.user!.id;
      const list = await deps.deckListService.getTransformedListForUser(userId);
      const body = stableV1DeckListBody(list);
      const etag = `"${crypto.createHash('sha1').update(body).digest('hex')}"`;

      res.set('Cache-Control', 'private, max-age=30');
      res.set('Vary', 'Cookie');
      res.set('ETag', etag);

      if (req.headers['if-none-match'] === etag) {
        res.status(304).end();
        return;
      }

      res.status(200).type('application/json').send(body);
    } catch (error) {
      console.error('v1 GET /decks error:', error);
      sendV1Json(res, 500, null, [{ code: 'DECK_LIST_ERROR', message: 'Failed to fetch decks' }]);
    }
  });

  router.post(
    '/decks/validate',
    deps.authenticateUser,
    async (req: Request, res: Response) => {
      try {
        const parsed = ValidateDeckRequestBody.parse(req.body);
        if (!parsed.ok) {
          sendV1Json(res, 400, null, parsed.errors);
          return;
        }

        const validationErrors = await deps.deckWriteService.validateDeckCards(parsed.value.cards);

        if (validationErrors.length > 0) {
          const joined = validationErrors.map((e) => e.message).join('; ');
          sendV1Json(
            res,
            400,
            { validationErrors },
            [{ code: 'DECK_VALIDATION_FAILED', message: joined }]
          );
          return;
        }

        const data: DeckValidateV1SuccessDto = { valid: true, message: 'Deck is valid' };
        sendV1Success(res, data);
      } catch (error) {
        console.error('v1 POST /decks/validate error:', error);
        sendV1Json(res, 500, null, [{ code: 'DECK_VALIDATE_ERROR', message: 'Failed to validate deck' }]);
      }
    }
  );

  router.post('/decks', deps.authenticateUser, async (req: Request, res: Response) => {
    try {
      if (checkRateLimit(req, res, 'deck creation', { v1: true })) {
        return;
      }
      if (blockInReadOnlyMode(req, res, 'deck creation', { v1: true })) {
        return;
      }
      if (req.user?.role === 'GUEST') {
        sendGuestForbiddenV1(res, 'create decks');
        return;
      }

      const parsed = CreateDeckRequestBody.parse(req.body);
      if (!parsed.ok) {
        sendV1Json(res, 400, null, parsed.errors);
        return;
      }

      const { name, description, characters } = parsed.value;

      try {
        const deck = await deps.deckWriteService.createDeck(req.user!.id, name, description, characters);
        const data = deck as DeckCreateV1DataDto;
        sendV1Success(res, data, 201);
      } catch (error) {
        if (error instanceof Error && error.message.includes('Maximum 4 characters allowed')) {
          sendV1Json(res, 400, null, [{ code: 'VALIDATION_ERROR', message: error.message }]);
          return;
        }
        console.error('v1 POST /decks error:', error);
        sendV1Json(res, 500, null, [{ code: 'DECK_CREATE_ERROR', message: 'Failed to create deck' }]);
      }
    } catch (error) {
      console.error('v1 POST /decks error:', error);
      sendV1Json(res, 500, null, [{ code: 'DECK_CREATE_ERROR', message: 'Failed to create deck' }]);
    }
  });
}
