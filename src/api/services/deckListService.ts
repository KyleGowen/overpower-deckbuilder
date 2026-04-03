import type { Deck } from '../../types';
import { transformDeckList } from '../deckTransform';

export interface DeckListRepository {
  getDecksByUserId: (userId: string) => Promise<Deck[]>;
}

/**
 * User-scoped deck list reads for v1 (and shared with legacy until fully migrated).
 */
export class DeckListService {
  constructor(private readonly deckRepository: DeckListRepository) {}

  async getTransformedListForUser(userId: string): Promise<ReturnType<typeof transformDeckList>> {
    const decks = await this.deckRepository.getDecksByUserId(userId);
    return transformDeckList(decks);
  }
}
