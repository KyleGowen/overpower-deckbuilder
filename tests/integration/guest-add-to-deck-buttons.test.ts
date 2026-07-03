import request from 'supertest';
import { app } from '../../src/test-server';
import { integrationTestUtils } from '../setup-integration';

describe('Guest Add to Deck Buttons Integration Tests', () => {
    let guestUser: any;
    let regularUser: any;
    let adminUser: any;
    let guestAuthCookie: string;
    let userAuthCookie: string;
    let adminAuthCookie: string;

    beforeAll(async () => {
        // Use the Test-Guest user instead of creating a new one
        guestUser = {
            id: '00000000-0000-0000-0000-000000000002',
            name: 'Test-Guest',
            email: 'test-guest@example.com',
            role: 'GUEST',
            username: 'Test-Guest'
        };

        regularUser = await integrationTestUtils.createTestUser({
            name: 'testuser',
            email: 'testuser@example.com',
            role: 'USER',
            password: 'testpass'
        });

        adminUser = await integrationTestUtils.createTestUser({
            name: 'admin',
            email: 'admin@example.com',
            role: 'ADMIN',
            password: 'adminpass'
        });

        // Login as guest user
        const guestLoginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'Test-Guest',
                password: 'test-guest'
            });
        
        if (guestLoginResponse.headers['set-cookie']) {
            guestAuthCookie = guestLoginResponse.headers['set-cookie'][0];
        }

        // Login as regular user
        const userLoginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: regularUser.username,
                password: 'testpass'
            });
        
        if (userLoginResponse.headers['set-cookie']) {
            userAuthCookie = userLoginResponse.headers['set-cookie'][0];
        }

        // Login as admin user
        const adminLoginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: adminUser.username,
                password: 'adminpass'
            });
        
        if (adminLoginResponse.headers['set-cookie']) {
            adminAuthCookie = adminLoginResponse.headers['set-cookie'][0];
        }
    });

    afterAll(async () => {
        // Cleanup is handled by global afterAll in setup-integration.ts
        // No need for individual cleanup here
    });

    describe('Guest Role Add to Deck Functionality Verification', () => {
        let testDeckId: string;
        const createdDeckIds: string[] = [];

        beforeAll(async () => {
            // Create a test deck for the guest user
            const createDeckResponse = await request(app)
                .post('/api/v1/decks')
                .set('Cookie', guestAuthCookie)
                .send({
                    name: 'Guest Test Deck',
                    description: 'Test deck for guest user verification'
                });

            if (createDeckResponse.status === 200) {
                testDeckId = createDeckResponse.body.data.metadata.id;
                createdDeckIds.push(testDeckId);
                // Track this deck for cleanup
                integrationTestUtils.trackTestDeck(testDeckId);
            }
        });

        afterAll(async () => {
            // Clean up all test decks
            for (const deckId of createdDeckIds) {
                try {
                    await request(app)
                        .delete(`/api/v1/decks/${deckId}`)
                        .set('Cookie', guestAuthCookie);
                } catch (error) {
                    console.warn(`Failed to delete test deck ${deckId}:`, error);
                }
            }
            
            // Cleanup is now handled by the tracking system
            // No pattern-based deletion needed here
        });

        it('should prevent guest users from adding character cards to deck', async () => {
            // Try to add a character card to the deck
            const addCardResponse = await request(app)
                .post(`/api/v1/decks/${testDeckId}/cards`)
                .set('Cookie', guestAuthCookie)
                .send({
                    cardType: 'character',
                    cardId: 'char_1', // Assuming this exists
                    quantity: 1
                });

            // Guest users should not be able to add cards (returns 403 for guest restrictions)
            expect(addCardResponse.status).toBe(403);
            expect(addCardResponse.body.success).toBe(false);
        });

        it('should prevent guest users from adding special cards to deck', async () => {
            // Try to add a special card to the deck
            const addCardResponse = await request(app)
                .post(`/api/v1/decks/${testDeckId}/cards`)
                .set('Cookie', guestAuthCookie)
                .send({
                    cardType: 'special',
                    cardId: 'special_1', // Assuming this exists
                    quantity: 1
                });

            // Guest users should not be able to add cards (returns 403 for guest restrictions)
            expect(addCardResponse.status).toBe(403);
            expect(addCardResponse.body.success).toBe(false);
        });

        it('should prevent guest users from adding any card type to deck', async () => {
            const cardTypes = [
                'character', 'special', 'location', 'mission', 
                'event', 'aspect', 'advanced-universe', 'teamwork',
                'ally-universe', 'training', 'basic-universe', 'power'
            ];

            for (const cardType of cardTypes) {
                const addCardResponse = await request(app)
                    .post(`/api/v1/decks/${testDeckId}/cards`)
                    .set('Cookie', guestAuthCookie)
                    .send({
                        cardType: cardType,
                        cardId: `${cardType}_1`,
                        quantity: 1
                    });

                // Guest users should not be able to add any card type (returns 403 for guest restrictions)
                expect(addCardResponse.status).toBe(403);
                expect(addCardResponse.body.success).toBe(false);
            }
        });

        it('should block guest users from creating decks', async () => {
            const createDeckResponse = await request(app)
                .post('/api/v1/decks')
                .set('Cookie', guestAuthCookie)
                .send({
                    name: 'Guest Attempted Deck',
                    description: 'This should fail for guest users'
                });

            // Guest users should not be able to create decks (returns 403 for guest restrictions)
            expect(createDeckResponse.status).toBe(403);
            expect(createDeckResponse.body.errors?.length).toBeGreaterThan(0);
            
            // Track this deck for cleanup
            if (createDeckResponse.body.data && createDeckResponse.body.data.metadata) {
                createdDeckIds.push(createDeckResponse.body.data.metadata.id);
            }
        });

        it('should prevent guest users from modifying existing decks', async () => {
            if (!testDeckId) {
                // Skip if no test deck was created
                return;
            }

            const updateDeckResponse = await request(app)
                .put(`/api/v1/decks/${testDeckId}`)
                .set('Cookie', guestAuthCookie)
                .send({
                    name: 'Modified Guest Deck',
                    description: 'This should fail for guest users'
                });

            // Guest users should not be able to modify decks
            expect(updateDeckResponse.status).toBe(401);
            expect(updateDeckResponse.body.success).toBe(false);
            expect(updateDeckResponse.body.error).toContain('Unauthorized');
        });

        it('should prevent guest users from deleting cards from deck', async () => {
            if (!testDeckId) {
                // Skip if no test deck was created
                return;
            }

            const deleteCardResponse = await request(app)
                .delete(`/api/v1/decks/${testDeckId}/cards`)
                .set('Cookie', guestAuthCookie)
                .send({
                    cardType: 'character',
                    cardId: 'char_1',
                    quantity: 1
                });

            // Guest users should not be able to delete cards
            expect(deleteCardResponse.status).toBe(401);
            expect(deleteCardResponse.body.success).toBe(false);
            expect(deleteCardResponse.body.error).toContain('Unauthorized');
        });

        it('should verify guest user role in session', async () => {
            const meResponse = await request(app)
                .get('/api/auth/me')
                .set('Cookie', guestAuthCookie)
                .expect(200);

            // Verify the user is actually a guest
            expect(meResponse.body.success).toBe(true);
            expect(meResponse.body.data.role).toBe('GUEST');
            expect(meResponse.body.data.name).toMatch(/Test-Guest|guest/);
        });
    });
});
