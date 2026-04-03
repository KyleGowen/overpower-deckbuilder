import { CatalogService } from '../../../../src/api/services/catalogService';

describe('CatalogService', () => {
  it('getAllCharacters delegates to reader', async () => {
    const reader = { getAllCharacters: jest.fn().mockResolvedValue([{ id: 'a' }]) };
    const svc = new CatalogService(reader);
    const out = await svc.getAllCharacters();
    expect(out).toEqual([{ id: 'a' }]);
    expect(reader.getAllCharacters).toHaveBeenCalledTimes(1);
  });
});
