import type { CatalogCard, DeckCardEntry, DeckListItem } from '../api/types';

export interface DeckPreviewCatalogImages {
  characters: Map<string, string>;
  locations: Map<string, string>;
}

function catalogImagePath(card?: Partial<CatalogCard> | null): string | undefined {
  const raw = card?.image_path ?? card?.image;
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Build cardId → image_path maps for deck tile catalog fallback. */
export function buildDeckPreviewCatalogImages(
  characters: Array<Partial<CatalogCard> & { id: string }> | undefined,
  locations?: Array<Partial<CatalogCard> & { id: string }> | undefined,
): DeckPreviewCatalogImages {
  const characterMap = new Map<string, string>();
  (characters ?? []).forEach((c) => {
    const path = catalogImagePath(c);
    if (path) characterMap.set(c.id, path);
  });

  const locationMap = new Map<string, string>();
  (locations ?? []).forEach((c) => {
    const path = catalogImagePath(c);
    if (path) locationMap.set(c.id, path);
  });

  return { characters: characterMap, locations: locationMap };
}

function enrichPreviewCard(
  card: DeckCardEntry,
  images: DeckPreviewCatalogImages,
): DeckCardEntry {
  const existing = card.defaultImage;
  if (typeof existing === 'string' && existing.trim().length > 0) {
    return card;
  }

  const map =
    card.type === 'character'
      ? images.characters
      : card.type === 'location'
        ? images.locations
        : undefined;
  const fromCatalog = map?.get(card.cardId);
  if (!fromCatalog) return card;

  return { ...card, defaultImage: fromCatalog };
}

/** Fill missing preview defaultImage fields from catalog (deck editor parity for tiles). */
export function enrichDeckListItemPreviewImages(
  deck: DeckListItem,
  images: DeckPreviewCatalogImages,
): DeckListItem {
  const cards = deck.cards ?? [];
  if (cards.length === 0) return deck;

  let changed = false;
  const enriched = cards.map((card) => {
    const next = enrichPreviewCard(card, images);
    if (next !== card) changed = true;
    return next;
  });

  return changed ? { ...deck, cards: enriched } : deck;
}

/** Batch enrich for deck grids/rails. */
export function enrichDeckListPreviewImages(
  decks: DeckListItem[],
  images: DeckPreviewCatalogImages,
): DeckListItem[] {
  if (decks.length === 0) return decks;
  return decks.map((deck) => enrichDeckListItemPreviewImages(deck, images));
}
