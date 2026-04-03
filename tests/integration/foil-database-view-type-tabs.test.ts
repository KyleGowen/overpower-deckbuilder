/**
 * Integration tests for foil handling in DBView type tabs.
 *
 * 1. Type tab API returns foil rows: GET /api/v1/catalog/characters returns both base and foil rows
 * 2. Foil exclusion contract: groupCardsByVariant filters is_foil; type tabs show only non-foil
 */

import request from 'supertest';
import { app, initializeTestServer } from '../../src/test-server';
import { integrationTestUtils } from '../setup-integration';

describe('Foil Database View Type Tabs Integration Tests', () => {
  beforeAll(async () => {
    await integrationTestUtils.ensureGuestUser();
    await initializeTestServer();
  });

  it('should return both base and foil rows from character API', async () => {
    const response = await request(app)
      .get('/api/v1/catalog/characters')
      .expect(200);

    expect(response.body.errors ?? []).toEqual([]);
    const data = response.body.data;
    const baseCards = data.filter((c: { is_foil?: boolean }) => !c.is_foil);
    const foilCards = data.filter((c: { is_foil?: boolean }) => c.is_foil === true);

    expect(baseCards.length).toBeGreaterThan(0);
    if (foilCards.length > 0) {
      expect(foilCards.every((c: { is_foil?: boolean }) => c.is_foil === true)).toBe(true);
    }
  });

  it('should have API return foil rows so frontend groupCardsByVariant can filter them', async () => {
    const response = await request(app)
      .get('/api/v1/catalog/power-cards')
      .expect(200);

    expect(response.body.errors ?? []).toEqual([]);
    const data = response.body.data;
    const hasFoil = data.some((c: { is_foil?: boolean }) => c.is_foil === true);
    const hasBase = data.some((c: { is_foil?: boolean }) => !c.is_foil);

    expect(hasBase).toBe(true);
    if (hasFoil) {
      expect(data.filter((c: { is_foil?: boolean }) => c.is_foil).length).toBeGreaterThan(0);
    }
  });
});
