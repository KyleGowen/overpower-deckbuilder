import type { CatalogCard, DeckCardEntry } from '../api/types';

export const MAX_TOTAL_THREAT = 76;

const RESERVE_THREAT_OVERRIDES: Record<string, number> = {
  'Victory Harben': 20,
  'Carson of Venus': 19,
  'Morgan le Fay': 20,
};

export type ThreatCatalogLookup = (
  deckType: string,
  cardId: string,
) => CatalogCard | undefined;

function characterThreatLevel(
  card: CatalogCard,
  cardId: string,
  reserveCharacterId: string | null | undefined,
): number {
  let threatLevel = Number(card.threat_level ?? 0);
  if (reserveCharacterId && cardId === reserveCharacterId) {
    const name = String(card.name ?? '');
    if (name in RESERVE_THREAT_OVERRIDES) {
      threatLevel = RESERVE_THREAT_OVERRIDES[name];
    }
  }
  return threatLevel;
}

/**
 * Client-side total threat for the deck editor header.
 * Mirrors v1 `calculateTotalThreat` (characters + locations only).
 */
export function calculateDeckTotalThreat(
  cards: DeckCardEntry[],
  reserveCharacterId: string | null | undefined,
  lookup: ThreatCatalogLookup,
): number {
  let totalThreat = 0;

  for (const entry of cards) {
    if (entry.type !== 'character' && entry.type !== 'location') {
      continue;
    }
    const catalogCard = lookup(entry.type, entry.cardId);
    if (!catalogCard?.threat_level) {
      continue;
    }
    const threatLevel =
      entry.type === 'character'
        ? characterThreatLevel(catalogCard, entry.cardId, reserveCharacterId)
        : Number(catalogCard.threat_level);
    totalThreat += threatLevel * entry.quantity;
  }

  return totalThreat;
}

/** v1 parity: show denominator when over the legal cap. */
export function formatThreatDisplay(total: number): string {
  if (total > MAX_TOTAL_THREAT) {
    return `${total}/${MAX_TOTAL_THREAT}`;
  }
  return String(total);
}
