import type { CreatedDeckRef, DeckCardInput, UpdateDeckMetaInput } from '../api/decks';
import { extractCardsFromImportJson } from './extractCardsFromImportJson';
import type { ImportDeckJson, ImportCatalogMap } from './importTypes';
import {
  findCharacterIdByName,
  resolveImportCardIds,
} from './resolveImportCardIds';

export const DEFAULT_IMPORTED_DECK_NAME = 'Imported Deck';

export const UNRESOLVED_DISPLAY_LIMIT = 10;

export interface ImportDeckSuccess {
  ok: true;
  deckId: string;
  userId: string;
  cardsAdded: number;
}

export type ImportDeckFailure =
  | { ok: false; code: 'empty'; message: string }
  | { ok: false; code: 'parse'; message: string }
  | { ok: false; code: 'structure'; message: string }
  | { ok: false; code: 'no_cards'; message: string }
  | { ok: false; code: 'unresolved'; message: string; unresolved: Array<{ name: string; type: string }> }
  | { ok: false; code: 'api'; message: string };

export type ImportDeckResult = ImportDeckSuccess | ImportDeckFailure;

export type CreateDeckFn = (
  input: { name: string; description?: string },
  isGuest: boolean,
) => Promise<CreatedDeckRef>;

export type ReplaceDeckCardsFn = (
  deckId: string,
  cards: DeckCardInput[],
  isGuest: boolean,
) => Promise<unknown>;

export type UpdateDeckMetaFn = (
  deckId: string,
  input: UpdateDeckMetaInput,
  isGuest: boolean,
) => Promise<unknown>;

export function parseImportDeckJson(raw: string): ImportDeckJson {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('Please paste JSON data into the text area');
  }
  const data = JSON.parse(trimmed) as unknown;
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid import format: JSON must be an object');
  }
  const record = data as Record<string, unknown>;
  if (!record.cards || typeof record.cards !== 'object') {
    throw new Error('Invalid import format: Missing "cards" section');
  }
  return data as ImportDeckJson;
}

export function deckNameFromImportJson(
  exportData: ImportDeckJson,
  overrideName?: string,
): string {
  const trimmedOverride = overrideName?.trim();
  if (trimmedOverride) return trimmedOverride;
  const fromJson = exportData.name?.trim();
  if (fromJson) return fromJson;
  return DEFAULT_IMPORTED_DECK_NAME;
}

export interface ImportDeckFromJsonParams {
  exportData: ImportDeckJson;
  deckName: string;
  isGuest: boolean;
  catalogMap: ImportCatalogMap;
  createDeckFn: CreateDeckFn;
  replaceDeckCardsFn: ReplaceDeckCardsFn;
  updateDeckMetaFn: UpdateDeckMetaFn;
}

/**
 * Resolve import JSON, create a new deck, write cards + metadata.
 * Ported from legacy deck-import.js + server importDeckFromExport.ts.
 */
export async function importDeckFromJson(
  params: ImportDeckFromJsonParams,
): Promise<ImportDeckResult> {
  const {
    exportData,
    deckName,
    isGuest,
    catalogMap,
    createDeckFn,
    replaceDeckCardsFn,
    updateDeckMetaFn,
  } = params;

  const entries = extractCardsFromImportJson(exportData.cards);
  if (entries.length === 0) {
    return { ok: false, code: 'no_cards', message: 'No cards found in import data' };
  }

  const { resolved, unresolved } = resolveImportCardIds(catalogMap, entries);
  if (unresolved.length > 0) {
    return {
      ok: false,
      code: 'unresolved',
      message: 'Could not resolve all cards in the import JSON',
      unresolved: unresolved.map((u) => ({ name: u.name, type: u.type })),
    };
  }
  if (resolved.length === 0) {
    return { ok: false, code: 'no_cards', message: 'No cards found in import data' };
  }

  const name = deckNameFromImportJson(exportData, deckName);
  const description = exportData.description?.trim();

  let created: CreatedDeckRef;
  try {
    created = await createDeckFn(
      description ? { name, description } : { name },
      isGuest,
    );
  } catch (err) {
    return {
      ok: false,
      code: 'api',
      message: (err as Error)?.message || 'Could not create deck',
    };
  }

  const cardPayload: DeckCardInput[] = resolved.map((c) => ({
    cardType: c.cardType,
    cardId: c.cardId,
    quantity: c.quantity,
  }));

  try {
    await replaceDeckCardsFn(created.id, cardPayload, isGuest);
  } catch (err) {
    return {
      ok: false,
      code: 'api',
      message: (err as Error)?.message || 'Could not save imported cards',
    };
  }

  const metaUpdates: UpdateDeckMetaInput = {};

  if (typeof exportData.limited === 'boolean') {
    metaUpdates.is_limited = exportData.limited;
  }

  if (exportData.reserve_character) {
    const reserveId = findCharacterIdByName(catalogMap, exportData.reserve_character);
    if (reserveId) {
      metaUpdates.reserve_character = reserveId;
    }
  }

  if (Object.keys(metaUpdates).length > 0) {
    try {
      await updateDeckMetaFn(created.id, metaUpdates, isGuest);
    } catch (err) {
      return {
        ok: false,
        code: 'api',
        message: (err as Error)?.message || 'Could not apply deck metadata',
      };
    }
  }

  return {
    ok: true,
    deckId: created.id,
    userId: created.userId,
    cardsAdded: resolved.reduce((sum, c) => sum + c.quantity, 0),
  };
}

export function formatUnresolvedImportError(
  unresolved: Array<{ name: string; type: string }>,
): string {
  const shown = unresolved.slice(0, UNRESOLVED_DISPLAY_LIMIT);
  const lines = shown.map((u) => `${u.name} (${u.type})`);
  const remainder = unresolved.length - shown.length;
  if (remainder > 0) {
    lines.push(`…and ${remainder} more`);
  }
  return `Unresolved cards:\n${lines.join('\n')}`;
}
