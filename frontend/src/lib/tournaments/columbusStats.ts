import columbusStats from '../../data/tournaments/s1-columbus.json';
import type { TournamentEventStats } from './types';

const S1_COLUMBUS_STATS = columbusStats as TournamentEventStats;

export function getColumbusRegionalStats(): TournamentEventStats {
  return S1_COLUMBUS_STATS;
}
