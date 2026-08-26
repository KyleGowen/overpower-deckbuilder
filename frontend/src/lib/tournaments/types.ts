import type { CatalogType } from '../api/types';

/** Single ranked row in a regional decklist sheet. */
export interface RegionalDeckRow {
  rank: number;
  player: string;
  frontLine1: string;
  frontLine2: string;
  frontLine3: string;
  reserve: string;
  homebase: string;
  cataclysm: string;
}

export interface CountEntry {
  name: string;
  count: number;
  catalogType: CatalogType;
}

export interface HomebaseCountEntry extends CountEntry {
  top8: number;
  top3: number;
  wins: number;
}

export interface SpotlightEntry {
  name: string;
  catalogType: CatalogType;
  totalPlays: number;
  top8Plays: number;
  label: string;
  detail: string;
}

export interface TournamentEventLocation {
  venueName?: string;
  addressLine?: string;
  city: string;
  region: string;
  postalCode?: string;
  country?: string;
  mapUrl?: string;
}

export interface TournamentEventMeta {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  playerCount: number;
  winnerName: string;
  seasonLabel: string;
  location?: TournamentEventLocation;
}

export const TOURNAMENT_PODIUM_PLACEMENTS = ['1st', '2nd', '3rd'] as const;

export type TournamentPodiumPlacement = (typeof TOURNAMENT_PODIUM_PLACEMENTS)[number];

export interface TournamentPodiumResult {
  placement: TournamentPodiumPlacement;
  playerName: string;
}

export interface TournamentEventStats {
  meta: TournamentEventMeta;
  characterAppearances: CountEntry[];
  top8CharacterAppearances: CountEntry[];
  mostPlaysWithoutTop8: SpotlightEntry | null;
  highestTop8Rate: SpotlightEntry | null;
  newWinningCharacters: CountEntry[];
  newTop8Characters: CountEntry[];
  topReserves: CountEntry[];
  topHomebases: HomebaseCountEntry[];
  topCataclysms: CountEntry[];
  cataclysmReportedCount: number;
}
