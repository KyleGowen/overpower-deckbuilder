// Deck API response mappers
// Extracted from src/index.ts to reduce file size while preserving behavior.

import type { Deck, DeckData } from '../types';

export function transformDeckListItem(deck: Deck) {
  return {
    metadata: {
      id: deck.id,
      name: deck.name,
      description: deck.description,
      created: deck.created_at,
      lastModified: deck.updated_at,
      cardCount: deck.card_count || 0, // Use metadata column instead of cards.length
      threat: deck.threat || 0, // Use metadata column
      is_valid: deck.is_valid || false, // Use metadata column
      userId: deck.user_id,
      uiPreferences: deck.ui_preferences,
      is_limited: deck.is_limited,
      reserve_character: deck.reserve_character ?? null,
      background_image_path: deck.background_image_path || null,
    },
    cards: deck.cards || [], // Character and location cards from metadata
  };
}

export function transformDeckList(decks: Deck[]) {
  return decks.map(transformDeckListItem);
}

/** Guest session deck → same list shape as `transformDeckListItem` for merged GUEST deck list. */
export function transformGuestDeckToListItem(deckData: DeckData) {
  return {
    metadata: {
      id: deckData.metadata.id,
      name: deckData.metadata.name,
      description: deckData.metadata.description,
      created: deckData.metadata.created,
      lastModified: deckData.metadata.lastModified,
      cardCount: deckData.metadata.cardCount ?? deckData.cards?.length ?? 0,
      threat: 0,
      is_valid: false,
      userId: deckData.metadata.userId,
      uiPreferences: deckData.metadata.uiPreferences,
      is_limited: false,
      reserve_character: deckData.metadata.reserve_character ?? null,
      background_image_path: null
    },
    cards: deckData.cards || []
  };
}

/** Single-deck GET/PUT response shape (legacy + v1 `data`). */
export function transformDeckDetail(deck: Deck, viewerUserId: string) {
  const isOwner = deck.user_id === viewerUserId;
  return {
    metadata: {
      id: deck.id,
      name: deck.name,
      description: deck.description,
      created: deck.created_at,
      lastModified: deck.updated_at,
      cardCount: deck.cards?.length || 0,
      threat: deck.threat ?? 0,
      is_valid: deck.is_valid ?? false,
      userId: deck.user_id,
      uiPreferences: deck.ui_preferences,
      isOwner,
      is_limited: deck.is_limited,
      reserve_character: deck.reserve_character,
      display_mission_card_id: deck.display_mission_card_id ?? null,
      background_image_path: deck.background_image_path
    },
    cards: deck.cards || []
  };
}

/** PUT success path returns empty cards array with updated metadata counts from DB. */
export function transformDeckAfterMetadataUpdate(deck: Deck, viewerUserId: string) {
  const isOwner = deck.user_id === viewerUserId;
  return {
    // Back-compat aliases for older clients/tests that read updated deck fields
    // directly from `data` instead of `data.metadata`.
    id: deck.id,
    name: deck.name,
    description: deck.description,
    metadata: {
      id: deck.id,
      name: deck.name,
      description: deck.description,
      created: deck.created_at,
      lastModified: deck.updated_at,
      cardCount: deck.card_count || 0,
      userId: deck.user_id,
      uiPreferences: deck.ui_preferences,
      isOwner,
      is_limited: deck.is_limited,
      reserve_character: deck.reserve_character,
      display_mission_card_id: deck.display_mission_card_id ?? null,
      background_image_path: deck.background_image_path
    },
    cards: [] as Deck['cards']
  };
}

