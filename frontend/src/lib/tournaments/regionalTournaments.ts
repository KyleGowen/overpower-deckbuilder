import columbusStats from '../../data/tournaments/s1-columbus.json';
import niagaraStats from '../../data/tournaments/s1-niagara.json';
import type { TournamentEventStats, TournamentPodiumResult } from './types';

export const FEATURED_TOURNAMENT_ID = 's1-niagara' as const;
export const REGIONAL_TOURNAMENT_DECKS_USER_ID = '00000000-0000-0000-0000-000000000003';

export const COLUMBUS_PODIUM_DECK_IDS = {
  '1st': '81d73769-e987-4c85-a9f8-6629980a1807',
  '2nd': 'a6df76ba-c073-4e65-bc68-2046ee3919b1',
  '3rd': 'bb9a2144-9c15-4cb3-9c38-851e66972c74',
} as const;

export const NIAGARA_PODIUM_DECK_IDS = {
  '1st': '6fbe94b4-1fc6-439a-a771-b16ff35875b5',
  '2nd': '6cfb8b38-fa5a-45a2-bb15-ea6d8f7ed1b0',
} as const;

export interface RegionalTournamentDefinition {
  id: string;
  selectorLabel: string;
  deckNameLabel: string;
  stats: TournamentEventStats;
  podium: TournamentPodiumResult[];
  stableDeckIds?: Partial<Record<TournamentPodiumResult['placement'], string>>;
  stableDeckUserId?: string;
}

export const REGIONAL_TOURNAMENTS: RegionalTournamentDefinition[] = [
  {
    id: 's1-niagara',
    selectorLabel: 'Niagara Regional — Aug 2026',
    deckNameLabel: 'Niagara',
    stats: niagaraStats as TournamentEventStats,
    podium: [
      { placement: '1st', playerName: 'Jessica Simms' },
      { placement: '2nd', playerName: 'Justin Sadaie' },
      { placement: '3rd', playerName: 'Sean Ballantyne' },
    ],
    stableDeckIds: NIAGARA_PODIUM_DECK_IDS,
    stableDeckUserId: REGIONAL_TOURNAMENT_DECKS_USER_ID,
  },
  {
    id: 's1-columbus',
    selectorLabel: 'Columbus Regional — Jun 2026',
    deckNameLabel: 'Columbus',
    stats: columbusStats as TournamentEventStats,
    podium: [
      { placement: '1st', playerName: 'Justin Sadaie' },
      { placement: '2nd', playerName: 'Noor El-barrad' },
      { placement: '3rd', playerName: 'Charlie Hanford' },
    ],
    stableDeckIds: COLUMBUS_PODIUM_DECK_IDS,
    stableDeckUserId: REGIONAL_TOURNAMENT_DECKS_USER_ID,
  },
];

export function getRegionalTournament(id: string | null | undefined): RegionalTournamentDefinition {
  return REGIONAL_TOURNAMENTS.find((tournament) => tournament.id === id)
    ?? REGIONAL_TOURNAMENTS.find((tournament) => tournament.id === FEATURED_TOURNAMENT_ID)
    ?? REGIONAL_TOURNAMENTS[0];
}

export function buildRegionalEventPath(id: string): string {
  return `/home/regionals?event=${encodeURIComponent(id)}`;
}
