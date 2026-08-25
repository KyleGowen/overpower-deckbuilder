import type { CatalogType, DeckCardEntry, DeckListItem } from '../api/types';

export interface DeckTileArtSlide {
  cardId: string;
  name?: string;
  imagePath?: string | null;
  catalogType?: CatalogType;
  isFoil?: boolean;
}

function deckCharacters(deck: DeckListItem): DeckTileArtSlide[] {
  return (deck.cards ?? [])
    .filter((card) => card.type === 'character')
    .slice(0, 4)
    .map((card) => ({
      cardId: card.cardId,
      ...(card.name !== undefined ? { name: card.name } : {}),
      ...(card.defaultImage !== undefined ? { imagePath: card.defaultImage } : {}),
      catalogType: 'characters' as const,
      isFoil: Boolean(card.is_foil),
    }));
}

function firstCardOfType(
  deck: DeckListItem,
  type: DeckCardEntry['type'],
): DeckCardEntry | undefined {
  return (deck.cards ?? []).find((card) => card.type === type);
}

/** Shared compact/full deck-tile carousel order. */
export function deckArtSlides(deck: DeckListItem): DeckTileArtSlide[] {
  const slides = deckCharacters(deck);
  const location = firstCardOfType(deck, 'location');
  if (location?.defaultImage) {
    slides.push({
      cardId: location.cardId,
      name: location.name ?? 'Location',
      imagePath: location.defaultImage,
      catalogType: 'locations',
    });
  }
  const battleground = firstCardOfType(deck, 'battleground');
  if (battleground?.defaultImage) {
    slides.push({
      cardId: battleground.cardId,
      name: battleground.name ?? 'Battleground',
      imagePath: battleground.defaultImage,
      catalogType: 'battlegrounds',
      isFoil: Boolean(battleground.is_foil),
    });
  }
  return slides;
}
