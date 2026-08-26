import type { CatalogCard, DeckCardEntry } from '../../lib/api/types';
import {
  effectiveTeamCharacterStats,
  type CharacterStatRow,
} from '../../lib/deck-usability';

const MAX_TEAM_CHARACTERS = 4;

function characterStatRow(card: CatalogCard): CharacterStatRow {
  return {
    name: String(card.name ?? 'Unknown'),
    energy: Number(card.energy) || 0,
    combat: Number(card.combat) || 0,
    brute_force: Number(card.brute_force) || 0,
    intelligence: Number(card.intelligence) || 0,
  };
}

/** Effective grids for the character rows shown in the Add Cards Team pane. */
export function buildAddCardsEffectiveCharacterStats(
  cards: DeckCardEntry[],
  deckCatalogIndex?: Map<string, CatalogCard>,
): Map<string, CharacterStatRow> {
  const resolvedCharacters = cards
    .filter((entry) => entry.type === 'character')
    .slice(0, MAX_TEAM_CHARACTERS)
    .flatMap((entry) => {
      const card = deckCatalogIndex?.get(`${entry.type}:${entry.cardId}`);
      return card ? [{ cardId: entry.cardId, card }] : [];
    });
  const effectiveStats = effectiveTeamCharacterStats(
    resolvedCharacters.map(({ card }) => characterStatRow(card)),
  );

  return new Map(
    resolvedCharacters.map(({ cardId }, index) => [cardId, effectiveStats[index]]),
  );
}
