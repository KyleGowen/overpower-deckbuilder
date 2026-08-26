export type TournamentCatalogType = 'characters' | 'locations' | 'special-cards';

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
  catalogType: TournamentCatalogType;
}

export interface HomebaseCountEntry extends CountEntry {
  top8: number;
  top3: number;
  wins: number;
}

export interface SpotlightEntry {
  name: string;
  catalogType: TournamentCatalogType;
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
