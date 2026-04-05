/**
 * Unit tests for foil API and FoilCardMapRepository.
 *
 * - GET /api/v1/catalog/foil-card-map returns v1 envelope with foil map array
 * - FoilCardMapRepository returns entries with foilCardId, baseCardId, cardType
 */

const mockGetFoilCardMap = jest.fn().mockResolvedValue([
  { foilCardId: 'foil-power-1', baseCardId: 'base-power-1', cardType: 'power' },
  { foilCardId: 'foil-char-1', baseCardId: 'base-char-1', cardType: 'character' },
]);

jest.mock('../../src/database/foilCardMapRepository', () => ({
  FoilCardMapRepository: jest.fn().mockImplementation(() => ({
    getFoilCardMap: mockGetFoilCardMap,
  })),
}));

import request from 'supertest';
import { app } from '../../src/test-server';

describe('Foil API and Repository', () => {
  let catalogCookie: string;

  beforeAll(async () => {
    const login = await request(app).post('/api/auth/login').send({ username: 'kyle', password: 'test' });
    expect(login.status).toBe(200);
    const raw = login.headers['set-cookie'];
    expect(raw).toBeDefined();
    catalogCookie = (Array.isArray(raw) ? raw[0] : raw).split(';')[0];
  });

  beforeEach(() => {
    mockGetFoilCardMap.mockClear();
    mockGetFoilCardMap.mockResolvedValue([
      { foilCardId: 'foil-power-1', baseCardId: 'base-power-1', cardType: 'power' },
      { foilCardId: 'foil-char-1', baseCardId: 'base-char-1', cardType: 'character' },
    ]);
  });

  describe('GET /api/v1/catalog/foil-card-map', () => {
    it('should return v1 envelope with data array (foilCardId, baseCardId, cardType)', async () => {
      const response = await request(app)        .get('/api/v1/catalog/foil-card-map')

        .set('Cookie', catalogCookie)
        .expect(200);

      expect(response.body.errors).toEqual([]);
      expect(response.body.meta).toEqual({});
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);

      const entry = response.body.data[0];
      expect(entry).toHaveProperty('foilCardId');
      expect(entry).toHaveProperty('baseCardId');
      expect(entry).toHaveProperty('cardType');
    });

    it('should return entries with correct structure', async () => {
      const response = await request(app)        .get('/api/v1/catalog/foil-card-map')

        .set('Cookie', catalogCookie)
        .expect(200);

      expect(response.body.errors).toEqual([]);
      for (const entry of response.body.data) {
        expect(typeof entry.foilCardId).toBe('string');
        expect(typeof entry.baseCardId).toBe('string');
        expect(typeof entry.cardType).toBe('string');
        expect(['character', 'special', 'power']).toContain(entry.cardType);
      }
    });
  });

  describe('FoilCardMapRepository', () => {
    it('should return entries with expected shape when given mock pool', async () => {
      const mockPool = {
        query: jest.fn().mockResolvedValue({
          rows: [
            { foil_card_id: 'f1', base_card_id: 'b1', card_type: 'power' },
            { foil_card_id: 'f2', base_card_id: 'b2', card_type: 'character' },
          ],
        }),
      };

      const { FoilCardMapRepository: RealRepo } = jest.requireActual<typeof import('../../src/database/foilCardMapRepository')>('../../src/database/foilCardMapRepository');
      const repo = new RealRepo(mockPool as any);
      const entries = await repo.getFoilCardMap();

      expect(entries).toHaveLength(2);
      expect(entries[0]).toEqual({ foilCardId: 'f1', baseCardId: 'b1', cardType: 'power' });
      expect(entries[1]).toEqual({ foilCardId: 'f2', baseCardId: 'b2', cardType: 'character' });
    });
  });
});
