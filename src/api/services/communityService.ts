import type { Deck, User } from '../../types';
import { transformDeckListItem } from '../deckTransform';
import { resolveUserDisplayName } from '../../utils/resolveUserDisplayName';

/** Deck reads/writes needed by the community + favorites + public-profile features. */
export interface CommunityDeckRepository {
  getCommunityFeedDecks(opts?: { limit?: number; excludeUserIds?: string[] }): Promise<Deck[]>;
  searchCommunityDecks(opts: {
    search: string;
    limit?: number;
    excludeUserIds?: string[];
  }): Promise<Deck[]>;
  getPublicDecksByUserId(userId: string): Promise<Deck[]>;
  getFavoriteDecksForUser(userId: string): Promise<Deck[]>;
  getDeckById(id: string): Promise<Deck | undefined>;
  addDeckFavorite(userId: string, deckId: string): Promise<boolean>;
  removeDeckFavorite(userId: string, deckId: string): Promise<boolean>;
  getFavoritedDeckIds(userId: string, deckIds: string[]): Promise<Set<string>>;
}

export interface CommunityUserLookup {
  getUsersByIds(ids: string[]): Promise<User[]>;
}

export type EnrichedDeckListItem = ReturnType<typeof transformDeckListItem> & {
  metadata: ReturnType<typeof transformDeckListItem>['metadata'] & {
    ownerDisplayName: string | null;
    isFavorited: boolean;
  };
};

type Fail = { ok: false; status: number; code: string; message: string };
type Ok<T> = { ok: true; status: number; data: T };

function fail(status: number, code: string, message: string): Fail {
  return { ok: false, status, code, message };
}
function ok<T>(status: number, data: T): Ok<T> {
  return { ok: true, status, data };
}

export type FavoriteToggleResult = Ok<{ deckId: string; isFavorited: boolean }> | Fail;

/**
 * Community decks, favorites, and read-only public profiles. Enriches deck list
 * items with the owner's resolved display name and the viewer's favorite state.
 */
export class CommunityService {
  constructor(
    private readonly deckRepository: CommunityDeckRepository,
    private readonly userLookup: CommunityUserLookup,
    /** Internal/curated accounts excluded from the community feed + search. */
    private readonly excludeUserIds: string[] = []
  ) {}

  private async enrich(
    decks: Deck[],
    viewerUserId: string | null
  ): Promise<EnrichedDeckListItem[]> {
    const ownerIds = Array.from(new Set(decks.map((d) => d.user_id)));
    const owners = await this.userLookup.getUsersByIds(ownerIds);
    const nameById = new Map(owners.map((u) => [u.id, resolveUserDisplayName(u)]));
    const favSet = viewerUserId
      ? await this.deckRepository.getFavoritedDeckIds(
          viewerUserId,
          decks.map((d) => d.id)
        )
      : new Set<string>();

    return decks.map((deck) => {
      const item = transformDeckListItem(deck, viewerUserId ?? undefined);
      return {
        ...item,
        metadata: {
          ...item.metadata,
          ownerDisplayName: nameById.get(deck.user_id) ?? null,
          isFavorited: favSet.has(deck.id),
        },
      };
    });
  }

  /** Community feed (no search → 20 most-recent; with search → name match). */
  async getCommunityDecks(
    viewerUserId: string | null,
    search?: string
  ): Promise<EnrichedDeckListItem[]> {
    const trimmed = (search ?? '').trim();
    const decks = trimmed
      ? await this.deckRepository.searchCommunityDecks({
          search: trimmed,
          excludeUserIds: this.excludeUserIds,
        })
      : await this.deckRepository.getCommunityFeedDecks({
          limit: 20,
          excludeUserIds: this.excludeUserIds,
        });
    return this.enrich(decks, viewerUserId);
  }

  /** Public decks owned by a user (read-only public profile). */
  async getPublicDecksForUser(
    targetUserId: string,
    viewerUserId: string | null
  ): Promise<EnrichedDeckListItem[]> {
    const decks = await this.deckRepository.getPublicDecksByUserId(targetUserId);
    return this.enrich(decks, viewerUserId);
  }

  /** The viewer's own favorited decks. */
  async getFavorites(viewerUserId: string): Promise<EnrichedDeckListItem[]> {
    const decks = await this.deckRepository.getFavoriteDecksForUser(viewerUserId);
    return this.enrich(decks, viewerUserId);
  }

  async addFavorite(viewerUserId: string, deckId: string): Promise<FavoriteToggleResult> {
    const deck = await this.deckRepository.getDeckById(deckId);
    if (!deck) {
      return fail(404, 'DECK_NOT_FOUND', 'Deck not found');
    }
    if (deck.user_id === viewerUserId) {
      return fail(400, 'CANNOT_FAVORITE_OWN', 'You cannot favorite your own deck');
    }
    await this.deckRepository.addDeckFavorite(viewerUserId, deckId);
    return ok(200, { deckId, isFavorited: true });
  }

  async removeFavorite(viewerUserId: string, deckId: string): Promise<FavoriteToggleResult> {
    await this.deckRepository.removeDeckFavorite(viewerUserId, deckId);
    return ok(200, { deckId, isFavorited: false });
  }
}
