import { resolveSetDisplayName } from '../../src/database/setsLookup';
import type { PoolClient } from 'pg';

function makeMockClient(rows: { name: string }[]): Pick<PoolClient, 'query'> {
  return {
    query: jest.fn().mockResolvedValue({ rows }),
  } as unknown as PoolClient;
}

describe('resolveSetDisplayName', () => {
  it('returns sets.name when a row matches the code', async () => {
    const client = makeMockClient([{ name: 'My Expansion' }]);
    await expect(resolveSetDisplayName(client as PoolClient, 'TFCP')).resolves.toBe('My Expansion');
    expect(client.query).toHaveBeenCalledWith(
      'SELECT name FROM sets WHERE UPPER(TRIM(code)) = $1 LIMIT 1',
      ['TFCP']
    );
  });

  it('treats empty set as ERB for lookup', async () => {
    const client = makeMockClient([{ name: 'Edgar Rice Burroughs and the World Legends' }]);
    await expect(resolveSetDisplayName(client as PoolClient, null)).resolves.toBe(
      'Edgar Rice Burroughs and the World Legends'
    );
    expect(client.query).toHaveBeenCalledWith(
      'SELECT name FROM sets WHERE UPPER(TRIM(code)) = $1 LIMIT 1',
      ['ERB']
    );
  });

  it('returns raw code when no set row exists', async () => {
    const client = makeMockClient([]);
    await expect(resolveSetDisplayName(client as PoolClient, 'NOSUCH')).resolves.toBe('NOSUCH');
  });

  it('reuses cache when provided', async () => {
    const client = makeMockClient([{ name: 'Cached Name' }]);
    const cache = new Map<string, string>();
    await resolveSetDisplayName(client as PoolClient, 'X', cache);
    await resolveSetDisplayName(client as PoolClient, 'X', cache);
    expect(client.query).toHaveBeenCalledTimes(1);
    expect(cache.get('X')).toBe('Cached Name');
  });
});
