import type { DeckRepository } from '../../repository/DeckRepository';
import type { CardRepository } from '../../repository/CardRepository';
import type { Deck, DeckCard } from '../../types';
import { COMMUNITY_DECKS_USER_ID } from '../../constants/communityDecksUser';
import { extractCardsFromExportJson } from './extractCardsFromExportJson';
import { loadDeckCatalogBundle } from './loadDeckCatalogBundle';
import { resolveExportCardIds } from './resolveExportCardIds';
import type { ExportDeckJson } from './types';
import { buildAvailableCardsMap } from '../deck-validation/build-available-cards-map';
import { DeckValidationService } from '../deckValidationService';

export interface ImportDeckResult {
  deckId: string;
  deckName: string;
  cardsAdded: number;
  unresolved: Array<{ name: string; type: string }>;
}

export async function importDeckFromExport(
  deckRepository: DeckRepository,
  cardRepository: CardRepository,
  exportData: ExportDeckJson,
  userId: string = COMMUNITY_DECKS_USER_ID
): Promise<ImportDeckResult> {
  if (!exportData.name || typeof exportData.name !== 'string') {
    throw new Error('Export JSON must include a deck name');
  }
  if (!exportData.cards || typeof exportData.cards !== 'object') {
    throw new Error('Export JSON must include a cards object');
  }

  const entries = extractCardsFromExportJson(exportData.cards);
  if (entries.length === 0) {
    throw new Error('No cards found in export JSON');
  }

  const bundle = await loadDeckCatalogBundle(cardRepository);
  const { resolved, unresolved } = resolveExportCardIds(bundle, entries);
  if (resolved.length === 0) {
    throw new Error('Could not resolve any cards from export JSON');
  }

  const deck = await deckRepository.createDeck(
    userId,
    exportData.name.trim(),
    exportData.description?.trim() || ''
  );

  await deckRepository.replaceAllCardsInDeck(
    deck.id,
    resolved.map((c) => ({
      cardType: c.cardType,
      cardId: c.cardId,
      quantity: c.quantity,
    }))
  );

  const updates: Partial<Deck> = {};

  // Keep decks.is_valid authoritative for imported decks (community/tournament).
  const cardsForValidation = resolved.map((c) => ({
    id: '',
    type: c.cardType,
    cardId: c.cardId,
    quantity: c.quantity,
  })) as DeckCard[];
  const validationErrors = await new DeckValidationService(cardRepository).validateDeck(cardsForValidation);
  updates.is_valid = validationErrors.length === 0;

  if (typeof exportData.limited === 'boolean') {
    updates.is_limited = exportData.limited;
  }

  if (exportData.reserve_character) {
    const map = buildAvailableCardsMap(bundle);
    for (const card of map.values()) {
      if (cardTypeOf(card) !== 'character') continue;
      if (cardNameOf(card) === exportData.reserve_character) {
        updates.reserve_character = String(card.id);
        break;
      }
    }
  }

  if (Object.keys(updates).length > 0) {
    await deckRepository.updateDeck(deck.id, updates);
  }

  return {
    deckId: deck.id,
    deckName: exportData.name.trim(),
    cardsAdded: resolved.reduce((sum, c) => sum + c.quantity, 0),
    unresolved: unresolved.map((u) => ({ name: u.name, type: u.type })),
  };
}

function cardTypeOf(card: Record<string, unknown>): string | null {
  const t = card.type ?? card.card_type ?? card.cardType;
  return typeof t === 'string' ? t : null;
}

function cardNameOf(card: Record<string, unknown>): string | null {
  const n = card.name ?? card.card_name;
  return typeof n === 'string' ? n : null;
}
