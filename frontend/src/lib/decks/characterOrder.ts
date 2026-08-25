import type { DeckCardEntry } from '../api/types';

function characterIndexes(cards: readonly DeckCardEntry[]): number[] {
  const indexes: number[] = [];
  cards.forEach((card, index) => {
    if (card.type === 'character') indexes.push(index);
  });
  return indexes;
}

/** Move one character to another character's slot without disturbing other card types. */
export function reorderCharacterTo(
  cards: readonly DeckCardEntry[],
  sourceInstanceId: string,
  targetInstanceId: string,
): DeckCardEntry[] {
  if (sourceInstanceId === targetInstanceId) return cards as DeckCardEntry[];

  const slots = characterIndexes(cards);
  const characters = slots.map((index) => cards[index]);
  const sourceIndex = characters.findIndex((card) => card.instanceId === sourceInstanceId);
  const targetIndex = characters.findIndex((card) => card.instanceId === targetInstanceId);
  if (sourceIndex < 0 || targetIndex < 0) return cards as DeckCardEntry[];

  const nextCharacters = [...characters];
  const [moved] = nextCharacters.splice(sourceIndex, 1);
  nextCharacters.splice(targetIndex, 0, moved);

  const next = [...cards];
  slots.forEach((slot, index) => {
    next[slot] = nextCharacters[index];
  });
  return next;
}

/** Move one character by one preview slot. */
export function moveCharacterBy(
  cards: readonly DeckCardEntry[],
  instanceId: string,
  delta: -1 | 1,
): DeckCardEntry[] {
  const characters = cards.filter((card) => card.type === 'character');
  const sourceIndex = characters.findIndex((card) => card.instanceId === instanceId);
  const target = characters[sourceIndex + delta];
  if (sourceIndex < 0 || !target?.instanceId) return cards as DeckCardEntry[];
  return reorderCharacterTo(cards, instanceId, target.instanceId);
}

export function characterOrderPosition(
  cards: readonly DeckCardEntry[],
  instanceId: string,
): { position: number; total: number } {
  const characters = cards.filter((card) => card.type === 'character');
  return {
    position: characters.findIndex((card) => card.instanceId === instanceId),
    total: characters.length,
  };
}
