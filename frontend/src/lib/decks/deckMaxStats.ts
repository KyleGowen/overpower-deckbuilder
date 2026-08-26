import { cardStats } from '../catalog/catalogTypeMap';
import type { CatalogCard, DeckListItem } from '../api/types';
import type { DeckStatLine } from '../../components/DeckTile';
import { effectiveTeamCharacterStats } from '../deck-usability';

type CharStats = NonNullable<ReturnType<typeof cardStats>>;
type NamedCharStats = CharStats & { name: string };

/** Build a characterId → stat line map from the characters catalog. */
export function buildCharStatsById(
  characters: Array<Partial<CatalogCard> & { id: string }> | undefined,
): Map<string, NamedCharStats> {
  const m = new Map<string, NamedCharStats>();
  (characters ?? []).forEach((c) => {
    const s = cardStats(c);
    if (s) m.set(c.id, { ...s, name: String(c.name ?? 'Unknown') });
  });
  return m;
}

/**
 * Per-stat maximum across a deck's characters (the "max-stat" tile line).
 * Returns null when no character in the deck has catalog stats loaded.
 */
export function deckMaxStats(
  deck: DeckListItem,
  charStatsById: Map<string, NamedCharStats>,
): DeckStatLine | null {
  const chars = (deck.cards ?? []).filter((c) => c.type === 'character');
  if (chars.length === 0) return null;
  let energy = 0;
  let combat = 0;
  let bruteForce = 0;
  let intelligence = 0;
  const characterStats = effectiveTeamCharacterStats(chars.flatMap((c) => {
    const stats = charStatsById.get(c.cardId);
    if (!stats) return [];
    return [{
      name: stats.name,
      energy: stats.energy,
      combat: stats.combat,
      brute_force: stats.bruteForce,
      intelligence: stats.intelligence,
    }];
  }));
  characterStats.forEach((stats) => {
    energy = Math.max(energy, stats.energy);
    combat = Math.max(combat, stats.combat);
    bruteForce = Math.max(bruteForce, stats.brute_force);
    intelligence = Math.max(intelligence, stats.intelligence);
  });
  return characterStats.length > 0 ? { energy, combat, bruteForce, intelligence } : null;
}
