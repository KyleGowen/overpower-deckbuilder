import type { DeckListItem } from '../api/types';
import {
  TOURNAMENT_PODIUM_PLACEMENTS,
  type TournamentPodiumPlacement,
  type TournamentPodiumResult,
} from './types';

export interface TournamentPodiumDeckEntry extends TournamentPodiumResult {
  deck: DeckListItem | null;
  deckId: string | null;
  userId: string | null;
}

export interface TournamentPodiumDeckOptions {
  deckNameLabel: string;
  podium: TournamentPodiumResult[];
  stableDeckIds?: Partial<Record<TournamentPodiumPlacement, string>>;
  stableDeckUserId?: string;
}

function findDeckByNamePrefix(
  decks: DeckListItem[],
  deckNameLabel: string,
  placement: TournamentPodiumPlacement,
): DeckListItem | undefined {
  const prefix = `S1 Regionals (${deckNameLabel} ${placement}`.toLowerCase();
  return decks.find((deck) => deck.metadata.name.toLowerCase().startsWith(prefix));
}

/** Resolve podium decks by stable ID when available, then by the shared title convention. */
export function resolveTournamentPodiumDecks(
  decks: DeckListItem[],
  options: TournamentPodiumDeckOptions,
): TournamentPodiumDeckEntry[] {
  return TOURNAMENT_PODIUM_PLACEMENTS.map((placement) => {
    const result = options.podium.find((entry) => entry.placement === placement);
    const stableId = options.stableDeckIds?.[placement];
    const deck =
      (stableId ? decks.find((entry) => entry.metadata.id === stableId) : undefined) ??
      findDeckByNamePrefix(decks, options.deckNameLabel, placement) ??
      null;

    return {
      placement,
      playerName: result?.playerName ?? 'Deck unavailable',
      deck,
      deckId: deck?.metadata.id ?? stableId ?? null,
      userId: deck?.metadata.userId ?? (stableId ? options.stableDeckUserId ?? null : null),
    };
  });
}

/** Extract the player name from a conventionally named tournament deck. */
export function extractTournamentPodiumPlayerName(
  deckName: string,
  placement: TournamentPodiumPlacement,
  deckNameLabel: string,
): string {
  const escapedLabel = deckNameLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = deckName.match(new RegExp(`${escapedLabel}\\s+${placement},\\s*(.+?)\\)?$`, 'i'));
  return match?.[1]?.trim() || deckName;
}
