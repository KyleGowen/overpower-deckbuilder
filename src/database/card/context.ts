import { Pool } from 'pg';
import type { Battleground, Character, Location } from '../../types';

export type CardStats = {
  characters: number;
  locations: number;
  battlegrounds: number;
  specialCards: number;
  missions: number;
  events: number;
  aspects: number;
  advancedUniverse: number;
  teamwork: number;
  allyUniverse: number;
  training: number;
  basicUniverse: number;
  powerCards: number;
};

export interface CardCache {
  characters: Character[] | null;
  locations: Location[] | null;
  battlegrounds: Battleground[] | null;
  cacheTime: number;
  cardStats: CardStats | null;
  cardStatsCacheTime: number;
}

export interface CardRepositoryContext {
  pool: Pool;
  cache: CardCache;
  cacheTtlMs: number;
  cardStatsCacheTtlMs: number;
}

export function createCardRepositoryContext(
  pool: Pool,
  cache: CardCache,
  cacheTtlMs: number,
  cardStatsCacheTtlMs: number
): CardRepositoryContext {
  return {
    pool,
    cache,
    cacheTtlMs,
    cardStatsCacheTtlMs,
  };
}
