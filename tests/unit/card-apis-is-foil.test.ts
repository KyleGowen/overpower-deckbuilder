/**
 * Unit tests for card APIs returning is_foil field.
 *
 * Verifies that /api/v1/catalog/characters, /api/power-cards, etc. include is_foil
 * in the response structure when foil rows exist.
 */

import request from 'supertest';
import { app } from '../../src/test-server';
import { mockCharacters, mockPowerCards } from '../mocks/DatabaseMocks';

describe('Card APIs is_foil structure', () => {
  describe('GET /api/v1/catalog/characters', () => {
    it('should include is_foil in response structure', async () => {
      const response = await request(app)
        .get('/api/v1/catalog/characters')
        .expect(200);

      expect(response.body.errors ?? []).toEqual([]);
      expect(Array.isArray(response.body.data)).toBe(true);

      const foilCard = response.body.data.find((c: { is_foil?: boolean }) => c.is_foil === true);
      expect(foilCard).toBeDefined();
      expect(foilCard.is_foil).toBe(true);
    });

    it('should have at least one card with is_foil when foil rows exist', async () => {
      const hasFoil = mockCharacters.some((c) => c.is_foil === true);
      expect(hasFoil).toBe(true);

      const response = await request(app)
        .get('/api/v1/catalog/characters')
        .expect(200);

      expect(response.body.errors ?? []).toEqual([]);
      const foilCards = response.body.data.filter((c: { is_foil?: boolean }) => c.is_foil === true);
      expect(foilCards.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/power-cards', () => {
    it('should include is_foil in response structure', async () => {
      const response = await request(app)
        .get('/api/power-cards')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      const foilCard = response.body.data.find((c: { is_foil?: boolean }) => c.is_foil === true);
      expect(foilCard).toBeDefined();
      expect(foilCard.is_foil).toBe(true);
    });

    it('should have at least one card with is_foil when foil rows exist', async () => {
      const hasFoil = mockPowerCards.some((c) => c.is_foil === true);
      expect(hasFoil).toBe(true);

      const response = await request(app)
        .get('/api/power-cards')
        .expect(200);

      const foilCards = response.body.data.filter((c: { is_foil?: boolean }) => c.is_foil === true);
      expect(foilCards.length).toBeGreaterThanOrEqual(1);
    });
  });
});
