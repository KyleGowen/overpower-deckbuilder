/**
 * Integration tests for username persistence via auth API
 */

import request from 'supertest';
import { app } from '../../src/test-server';
import { integrationTestUtils } from '../setup-integration';
import { DataSourceConfig } from '../../src/config/DataSourceConfig';

describe('Username Persistence Flow', () => {
    let testUser: any;
    let authCookie: string;

    beforeEach(async () => {
        testUser = await integrationTestUtils.createTestUser({
            name: 'testuser',
            email: `testuser-${Date.now()}@example.com`
        });

        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: testUser.username,
                password: 'password123'
            });

        expect(loginResponse.status).toBe(200);
        const setCookie = loginResponse.headers['set-cookie'];
        expect(setCookie).toBeDefined();
        authCookie = setCookie![0];
    });

    afterEach(async () => {
        if (testUser) {
            try {
                const userRepo = DataSourceConfig.getInstance().getUserRepository();
                await userRepo.deleteUser(testUser.id);
            } catch (error) {
                // Ignore cleanup errors
            }
        }
    });

    test('should return consistent username from /api/auth/me across deck API calls', async () => {
        const beforeMe = await request(app)
            .get('/api/auth/me')
            .set('Cookie', authCookie)
            .expect(200);

        expect(beforeMe.body.success).toBe(true);
        expect(beforeMe.body.data.name).toBe(testUser.username);

        const createDeckResponse = await request(app)
            .post('/api/v1/decks')
            .set('Cookie', authCookie)
            .send({
                name: 'Username Persistence Deck',
                description: 'Deck created during username persistence test'
            })
            .expect(201);

        integrationTestUtils.trackTestDeck(createDeckResponse.body.data.id);

        const afterMe = await request(app)
            .get('/api/auth/me')
            .set('Cookie', authCookie)
            .expect(200);

        expect(afterMe.body.success).toBe(true);
        expect(afterMe.body.data.name).toBe(beforeMe.body.data.name);
        expect(afterMe.body.data.id).toBe(testUser.id);
    });
});
