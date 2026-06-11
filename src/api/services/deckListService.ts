import type { Deck } from '../../types';
import { transformDeckList } from '../deckTransform';

export type DeckListOrderBy = 'created_at' | 'updated_at';

export interface DeckListRepository {
  getDecksByUserId: (userId: string, orderBy?: DeckListOrderBy) => Promise<Deck[]>;
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

  async getTransformedCommunityListForUser(
    userId: string
  ): Promise<ReturnType<typeof transformDeckList>> {
    const decks = await this.deckRepository.getDecksByUserId(userId, 'updated_at');
    return transformDeckList(decks);
  }

  async getTransformedTournamentListForUser(
    userId: string
  ): Promise<ReturnType<typeof transformDeckList>> {
    const decks = await this.deckRepository.getDecksByUserId(userId, 'updated_at');
    return transformDeckList(decks);
  }
}
