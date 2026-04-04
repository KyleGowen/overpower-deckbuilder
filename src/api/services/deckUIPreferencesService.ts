import type { UIPreferences } from '../../types';
import type { DeckRepository } from '../../repository/DeckRepository';

export type DeckUIPreferencesRepository = Pick<
  DeckRepository,
  'getUIPreferences' | 'updateUIPreferences' | 'getDeckById' | 'userOwnsDeck'
>;

export type UIPreferencesGetResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; kind: 'forbidden' };

export type UIPreferencesUpdateResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; kind: 'validation_error'; message: string }
  | { ok: false; kind: 'not_found'; message: string }
  | { ok: false; kind: 'forbidden'; message: string };

function validatePreferencesObject(body: unknown): { ok: true; value: Record<string, unknown> } | { ok: false; message: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, message: 'Preferences must be an object' };
  }
  const preferences = body as Record<string, unknown>;

  if (preferences.viewMode && !['tile', 'list'].includes(String(preferences.viewMode))) {
    return { ok: false, message: 'viewMode must be either "tile" or "list"' };
  }

  if (preferences.sortBy && (typeof preferences.sortBy !== 'string' || preferences.sortBy.length > 50)) {
    return { ok: false, message: 'sortBy must be a string with 50 characters or less' };
  }

  if (preferences.filterBy && (typeof preferences.filterBy !== 'string' || preferences.filterBy.length > 50)) {
    return { ok: false, message: 'filterBy must be a string with 50 characters or less' };
  }

  if (JSON.stringify(preferences).length > 1000) {
    return { ok: false, message: 'Preferences object is too large (max 1000 characters)' };
  }

  return { ok: true, value: preferences };
}

export class DeckUIPreferencesService {
  constructor(private readonly deckRepository: DeckUIPreferencesRepository) {}

  async getForOwner(deckId: string, ownerUserId: string): Promise<UIPreferencesGetResult> {
    if (!(await this.deckRepository.userOwnsDeck(deckId, ownerUserId))) {
      return { ok: false, kind: 'forbidden' };
    }
    const preferences = await this.deckRepository.getUIPreferences(deckId);
    return { ok: true, data: (preferences ?? {}) as Record<string, unknown> };
  }

  async updateForOwner(deckId: string, ownerUserId: string, body: unknown): Promise<UIPreferencesUpdateResult> {
    const parsed = validatePreferencesObject(body);
    if (!parsed.ok) {
      return { ok: false, kind: 'validation_error', message: parsed.message };
    }

    const deck = await this.deckRepository.getDeckById(deckId);
    if (!deck) {
      return { ok: false, kind: 'not_found', message: 'Deck not found' };
    }

    if (!(await this.deckRepository.userOwnsDeck(deckId, ownerUserId))) {
      return { ok: false, kind: 'forbidden', message: 'Access denied. You do not own this deck.' };
    }

    const success = await this.deckRepository.updateUIPreferences(deckId, parsed.value as UIPreferences);
    if (!success) {
      return { ok: false, kind: 'not_found', message: 'Deck not found' };
    }

    return { ok: true, data: parsed.value };
  }
}
