/**
 * Integration: live catalog special-cards expose banned rows (e.g. Kali); Add All "Any Character"
 * must not treat banned cards as addable candidates (matches public/js/deck-card-operations.js).
 */
import request from 'supertest';
import { app } from '../../src/test-server';
import { DataSourceConfig } from '../../src/config/DataSourceConfig';
import { integrationTestUtils } from '../setup-integration';
import { readFileSync } from 'fs';
import { join } from 'path';
import vm from 'vm';

function loadGuardFn(): (cardId: string, deckEditorType: string, catalogRowOptional?: unknown) => boolean {
    const code = readFileSync(join(__dirname, '../../public/js/bulk-add-banned-guard.js'), 'utf8');
    const sandbox: { window?: typeof globalThis } = {};
    const ctx = sandbox as unknown as vm.Context & { window: vm.Context };
    ctx.window = ctx as unknown as typeof globalThis;
    vm.createContext(ctx);
    vm.runInContext(code, ctx);
    const fn = (ctx as unknown as { window: { isCatalogCardBannedForBulkAdd: (a: string, b: string, c?: unknown) => boolean } })
        .window.isCatalogCardBannedForBulkAdd;
    if (typeof fn !== 'function') {
        throw new Error('isCatalogCardBannedForBulkAdd not installed on sandbox');
    }
    return fn;
}

/** SYNC: deck-card-operations.js addAllSpecialCardsForCharacter — Any Character branch only (integration focuses on Kali path). */
function anyCharacterSpecialRows(rows: Array<Record<string, unknown>>): Record<string, unknown>[] {
    return rows.filter((card) => {
        const specialCharacter = String(card.character ?? card.character_name ?? '');
        if (specialCharacter === 'Any Character') {
            return true;
        }
        return false;
    });
}

describe('Deck special catalog — banned + Add All (integration)', () => {
    let username: string;
    let password: string;

    beforeAll(async () => {
        await integrationTestUtils.ensureGuestUser();
        const ts = Date.now();
        username = `deck-banned-sp-${ts}`;
        password = 'DeckBannedSpInt123';
        const userRepository = DataSourceConfig.getInstance().getUserRepository();
        const user = await userRepository.createUser(username, `${username}@example.com`, password, 'USER');
        integrationTestUtils.trackTestUser(user.id);
    });

    it('GET /api/v1/catalog/special-cards includes Kali with banned true and Any Character add-all candidates exclude it', async () => {
        const login = await request(app).post('/api/auth/login').send({ username, password }).expect(200);
        const cookie = login.headers['set-cookie']![0].split(';')[0];

        const res = await request(app).get('/api/v1/catalog/special-cards').set('Cookie', cookie).expect(200);

        expect(res.body.errors ?? []).toEqual([]);
        const rows = res.body.data as Array<Record<string, unknown>>;
        expect(Array.isArray(rows)).toBe(true);
        expect(rows.length).toBeGreaterThan(0);

        const kali = rows.find(
            (r) => typeof r.name === 'string' && String(r.name).includes('Kali') && String(r.name).includes('Goddess')
        );
        expect(kali).toBeDefined();
        expect(kali!.banned).toBe(true);
        expect(String(kali!.character ?? kali!.character_name ?? '')).toMatch(/Any Character/i);

        const isCatalogCardBannedForBulkAdd = loadGuardFn();

        const anyCharNonFoil = anyCharacterSpecialRows(rows).filter((c) => !c.is_foil);
        expect(anyCharNonFoil.length).toBeGreaterThan(1);

        const candidates = anyCharNonFoil.filter(
            (card) => !isCatalogCardBannedForBulkAdd(String(card.id), 'special', card)
        );

        expect(candidates.some((c) => String(c.name ?? '').includes('Kali'))).toBe(false);
        expect(candidates.length).toBeGreaterThan(0);
    });
});
