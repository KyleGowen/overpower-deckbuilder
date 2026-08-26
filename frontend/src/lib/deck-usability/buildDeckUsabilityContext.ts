import type { CatalogCard, CatalogType, DeckCardEntry } from '../api/types';
import { metaForDeckType } from '../catalog/catalogTypeMap';
import { deckCatalogIndexKey } from './deckCatalogIndex';
import type { CharacterStatRow, DeckUsabilityContext } from './types';
import {
  effectiveTeamCharacterStats,
  isGdaAnyCharacterSpecial,
  specialLinkedCharacterName,
} from './deckUsabilityUtils';

function findCatalogCardInList(
  catalogByType: Partial<Record<CatalogType, CatalogCard[]>>,
  deckType: string,
  cardId: string,
): CatalogCard | undefined {
  const meta = metaForDeckType(deckType);
  if (!meta) return undefined;
  const list = catalogByType[meta.type] ?? [];
  return list.find((c) => c.id === cardId);
}

function resolveDeckCatalogCard(
  deckCard: Pick<DeckCardEntry, 'type' | 'cardId'>,
  catalogByType: Partial<Record<CatalogType, CatalogCard[]>>,
  deckCatalogIndex?: Map<string, CatalogCard>,
): CatalogCard | undefined {
  const fromIndex = deckCatalogIndex?.get(deckCatalogIndexKey(deckCard.type, deckCard.cardId));
  if (fromIndex) return fromIndex;
  return findCatalogCardInList(catalogByType, deckCard.type, deckCard.cardId);
}

function characterStatRow(card: CatalogCard): CharacterStatRow {
  return {
    name: String(card.name ?? 'Unknown'),
    energy: Number(card.energy) || 0,
    combat: Number(card.combat) || 0,
    brute_force: Number(card.brute_force) || 0,
    intelligence: Number(card.intelligence) || 0,
  };
}

export interface BuildDeckUsabilityContextOptions {
  deckCatalogIndex?: Map<string, CatalogCard>;
}

export function buildDeckUsabilityContext(
  deckCards: DeckCardEntry[],
  catalogByType: Partial<Record<CatalogType, CatalogCard[]>>,
  options: BuildDeckUsabilityContextOptions = {},
): DeckUsabilityContext {
  const { deckCatalogIndex } = options;
  const characterDeckCards = deckCards.filter((c) => c.type === 'character');
  const missionDeckCards = deckCards.filter((c) => c.type === 'mission');
  const locationDeckCards = deckCards.filter((c) => c.type === 'location');
  const battlegroundDeckCards = deckCards.filter((c) => c.type === 'battleground');
  const specialDeckCards = deckCards.filter((c) => c.type === 'special');

  const characterStats: CharacterStatRow[] = [];
  const characterNames: string[] = [];

  for (const deckCard of characterDeckCards) {
    const catalogCard = resolveDeckCatalogCard(deckCard, catalogByType, deckCatalogIndex);
    if (!catalogCard) continue;
    const row = characterStatRow(catalogCard);
    characterStats.push(row);
    characterNames.push(row.name);
  }

  const angryMobCharacterNames = characterNames.filter((name) => name.startsWith('Angry Mob'));

  const missionSets = new Set<string>();
  for (const deckCard of missionDeckCards) {
    const catalogCard = resolveDeckCatalogCard(deckCard, catalogByType, deckCatalogIndex);
    const missionSet = String(catalogCard?.mission_set ?? '').trim();
    if (missionSet) missionSets.add(missionSet);
  }

  const firstLocation = locationDeckCards[0];
  const locationCatalog = firstLocation
    ? resolveDeckCatalogCard(firstLocation, catalogByType, deckCatalogIndex)
    : undefined;
  const homebaseName = String(
    locationCatalog?.name ?? locationCatalog?.card_name ?? '',
  ).trim();

  const firstBattleground = battlegroundDeckCards[0];
  const battlegroundCatalog = firstBattleground
    ? resolveDeckCatalogCard(firstBattleground, catalogByType, deckCatalogIndex)
    : undefined;
  const battlegroundName = String(
    battlegroundCatalog?.name ?? battlegroundCatalog?.card_name ?? '',
  ).trim();

  let hasGdaAnyCharacterSpecial = false;
  let hasNonGdaAnyCharacterSpecial = false;
  for (const deckCard of specialDeckCards) {
    const catalogCard = resolveDeckCatalogCard(deckCard, catalogByType, deckCatalogIndex);
    if (!catalogCard || specialLinkedCharacterName(catalogCard).toLowerCase() !== 'any character') {
      continue;
    }
    if (isGdaAnyCharacterSpecial(catalogCard)) hasGdaAnyCharacterSpecial = true;
    else hasNonGdaAnyCharacterSpecial = true;
  }

  return {
    characterNames,
    characterStats: effectiveTeamCharacterStats(characterStats),
    angryMobCharacterNames,
    missionSets,
    homebaseName,
    battlegroundName,
    hasGdaAnyCharacterSpecial,
    hasNonGdaAnyCharacterSpecial,
    characterCount: characterDeckCards.length,
  };
}
