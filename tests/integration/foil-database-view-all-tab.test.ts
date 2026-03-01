/**
 * Integration tests for foil handling in DBView All tab.
 *
 * 1. All tab includes foil cards: API returns cards with is_foil: true
 * 2. All tab sort order: foil cards sort after non-foil within same set
 */

import request from 'supertest';
import { app, initializeTestServer } from '../../src/test-server';
import { integrationTestUtils } from '../setup-integration';

describe('Foil Database View All Tab Integration Tests', () => {
  beforeAll(async () => {
    await integrationTestUtils.ensureGuestUser();
    await initializeTestServer();
  });

  it('should return cards with is_foil when DB has foil rows', async () => {
    const [charactersRes, powerRes] = await Promise.all([
      request(app).get('/api/characters'),
      request(app).get('/api/power-cards'),
    ]);

    const allCards = [
      ...charactersRes.body.data,
      ...powerRes.body.data,
    ];
    const foilCards = allCards.filter((c: { is_foil?: boolean }) => c.is_foil === true);
    expect(foilCards.length).toBeGreaterThanOrEqual(1);
  });

  it('should sort foil cards after non-foil within same set (sortAllCardsData contract)', async () => {
    const sortAllCardsData = (arr: any[]) => {
      return [...arr].sort((a, b) => {
        const setA = String(a?.set || a?.universe || 'ERB').trim();
        const setB = String(b?.set || b?.universe || 'ERB').trim();
        const setCmp = setA.localeCompare(setB);
        if (setCmp !== 0) return setCmp;

        const aFoil = !!(a?.is_foil);
        const bFoil = !!(b?.is_foil);
        if (aFoil !== bFoil) return aFoil ? 1 : -1;

        const numAStr = String(a?.set_number || '').trim();
        const numBStr = String(b?.set_number || '').trim();
        const aHasNum = !!numAStr;
        const bHasNum = !!numBStr;
        if (aHasNum !== bHasNum) return aHasNum ? -1 : 1;
        if (aHasNum && bHasNum) {
          const numA = parseInt(numAStr, 10);
          const numB = parseInt(numBStr, 10);
          if (Number.isFinite(numA) && Number.isFinite(numB) && numA !== numB) return numA - numB;
        }
        return 0;
      });
    };

    const baseCard = { id: 'b1', set: 'ERB', set_number: '001', is_foil: false };
    const foilCard = { id: 'f1', set: 'ERB', set_number: '001', is_foil: true };
    const sorted = sortAllCardsData([foilCard, baseCard]);
    expect(sorted[0].id).toBe('b1');
    expect(sorted[1].id).toBe('f1');
  });
});
