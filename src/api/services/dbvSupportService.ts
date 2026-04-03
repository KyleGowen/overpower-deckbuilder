import { listAllSets } from '../../database/setsLookup';

type SetsPool = Parameters<typeof listAllSets>[0];

/**
 * DBV support reads (sets list, deck backgrounds when migrated). HTTP layers call this only.
 */
export class DbvSupportService {
  constructor(private readonly getPool: () => SetsPool) {}

  getAllSets(): Promise<{ code: string; name: string }[]> {
    return listAllSets(this.getPool());
  }
}
