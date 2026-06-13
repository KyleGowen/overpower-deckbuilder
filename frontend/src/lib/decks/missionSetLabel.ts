import type { CatalogCard, DeckListItem } from '../api/types';

export function buildMissionSetByCardId(missions: CatalogCard[]): Map<string, string> {
  const m = new Map<string, string>();
  missions.forEach((mission) => {
    const setName = String(mission.mission_set ?? '').trim();
    if (setName) m.set(mission.id, setName);
  });
  return m;
}

export function deckMissionSetName(
  deck: DeckListItem,
  missionSetByCardId: Map<string, string>,
): string | null {
  const mission = (deck.cards ?? []).find((c) => c.type === 'mission');
  if (!mission?.cardId) return null;
  return missionSetByCardId.get(mission.cardId) ?? null;
}
