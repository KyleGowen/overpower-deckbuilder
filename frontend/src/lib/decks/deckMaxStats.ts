import { cardStats } from '../catalog/catalogTypeMap';
import type { CatalogCard, DeckListItem } from '../api/types';
import type { DeckStatLine } from '../../components/DeckTile';

type CharStats = NonNullable<ReturnType<typeof cardStats>>;

/** Build a characterId → stat line map from the characters catalog. */
export function buildCharStatsById(
  characters: Array<Partial<CatalogCard> & { id: string }> | undefined,
): Map<string, CharStats> {
  const m = new Map<string, CharStats>();
  (characters ?? []).forEach((c) => {
    const s = cardStats(c);
    if (s) m.set(c.id, s);
  });
  return m;
}

/**
 * Per-stat maximum across a deck's characters (the "max-stat" tile line).
 * Returns null when no character in the deck has catalog stats loaded.
 */
export function deckMaxStats(
  deck: DeckListItem,
  charStatsById: Map<string, CharStats>,
): DeckStatLine | null {
  const chars = (deck.cards ?? []).filter((c) => c.type === 'character');
  if (chars.length === 0) return null;
  let energy = 0;
  let combat = 0;
  let bruteForce = 0;
  let intelligence = 0;
  let found = false;
  chars.forEach((c) => {
    const s = charStatsById.get(c.cardId);
    if (s) {
      found = true;
      energy = Math.max(energy, s.energy);
      combat = Math.max(combat, s.combat);
      bruteForce = Math.max(bruteForce, s.bruteForce);
      intelligence = Math.max(intelligence, s.intelligence);
    }
  });
  return found ? { energy, combat, bruteForce, intelligence } : null;
}
