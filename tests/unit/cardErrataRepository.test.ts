import { CardErrataRepository } from '../../src/database/cardErrataRepository';

describe('CardErrataRepository', () => {
  it('returns linked official errata and caches the migration-owned reference data', async () => {
    const rows = [{
      card_type: 'special',
      card_id: 'card-1',
      id: 'errata-12',
      source_section: 12,
      entry_title: 'Immortal — I am Immortal',
      entry_text: 'Use the full hourglass icon.',
      source_url: 'https://overpowercardgame.com/errata/#s12'
    }];
    const pool = { query: jest.fn().mockResolvedValue({ rows }) };
    const repository = new CardErrataRepository(pool as any);

    await expect(repository.getAllCardErrata()).resolves.toEqual(rows);
    await expect(repository.getAllCardErrata()).resolves.toEqual(rows);
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query.mock.calls[0][0]).toContain('COALESCE(ce.display_text, e.entry_text) AS entry_text');
    expect(pool.query.mock.calls[0][0]).toContain('ORDER BY ce.card_type, ce.card_id, e.source_section');
  });

  it('clears a failed cached read so the next request can retry', async () => {
    const pool = {
      query: jest.fn()
        .mockRejectedValueOnce(new Error('temporary database error'))
        .mockResolvedValueOnce({ rows: [] })
    };
    const repository = new CardErrataRepository(pool as any);

    await expect(repository.getAllCardErrata()).rejects.toThrow('temporary database error');
    await expect(repository.getAllCardErrata()).resolves.toEqual([]);
    expect(pool.query).toHaveBeenCalledTimes(2);
  });
});
