import {
  computePrePlacedFlags,
  isPrePlacedEligible,
} from '../../../frontend/src/lib/decks/prePlaced';
import type { DeckCardIndex } from '../../../frontend/src/lib/decks/deckCardCatalog';
import type { CatalogCard, DeckCardEntry } from '../../../frontend/src/lib/api/types';

function indexCard(type: string, id: string, card: Partial<CatalogCard>): [string, CatalogCard][] {
  const value = { id, ...card } as CatalogCard;
  return [
    [`${type}:${id}`, value],
    [id, value],
  ];
}

/** Deck with both enabling locations; flags resolve via the location entry names. */
const deck: DeckCardEntry[] = [
  { type: 'location', cardId: 'loc-dracula', quantity: 1, name: "Dracula's Armory" },
  { type: 'location', cardId: 'loc-spartan', quantity: 1, name: 'Spartan Training Ground' },
];

const cardIndex: DeckCardIndex = new Map([
  ...indexCard('basic-universe', 'bu1', { card_name: 'Basic Universe (Energy)' }),
  ...indexCard('basic-universe', 'sekhmet', { card_name: 'Sekhmet', one_per_deck: true }),
  ...indexCard('training', 'tr1', { card_name: 'Training (Combat)' }),
  ...indexCard('training', 'tr-opd', { card_name: 'Unique Training', is_one_per_deck: true }),
]);

const flags = computePrePlacedFlags(deck, cardIndex);

describe('isPrePlacedEligible — one-per-deck exclusion', () => {
  it('allows a non-OPD Basic Universe card when Dracula\'s Armory is present', () => {
    const entry: DeckCardEntry = { type: 'basic-universe', cardId: 'bu1', quantity: 1 };
    expect(isPrePlacedEligible(entry, flags, cardIndex)).toBe(true);
  });

  it('hides the toggle for a one-per-deck Basic Universe card (Sekhmet)', () => {
    const entry: DeckCardEntry = { type: 'basic-universe', cardId: 'sekhmet', quantity: 1 };
    expect(isPrePlacedEligible(entry, flags, cardIndex)).toBe(false);
  });

  it('allows a non-OPD Training card when Spartan Training Ground is present', () => {
    const entry: DeckCardEntry = { type: 'training', cardId: 'tr1', quantity: 1 };
    expect(isPrePlacedEligible(entry, flags, cardIndex)).toBe(true);
  });

  it('hides the toggle for a one-per-deck Training card (is_one_per_deck alias)', () => {
    const entry: DeckCardEntry = { type: 'training', cardId: 'tr-opd', quantity: 1 };
    expect(isPrePlacedEligible(entry, flags, cardIndex)).toBe(false);
  });
});
