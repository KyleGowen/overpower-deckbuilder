import type { ValidationError } from '../../../services/deckValidationService';

/** `POST /api/v1/decks/validate` 400 `data` (alongside `errors`). */
export interface DeckValidateV1ErrorDataDto {
  validationErrors: ValidationError[];
}
