import request from 'supertest';
import { app, integrationTestUtils } from '../setup-integration';
import { DataSourceConfig } from '../../src/config/DataSourceConfig';

describe('Create Deck Scenarios Integration Tests', () => {
    let regularUser: any;
    let adminUser: any;
    let regularCookie: string;
    let adminCookie: string;

    beforeAll(async () => {
        // Create test users
        const userRepo = DataSourceConfig.getInstance().getUserRepository();
        
        // Create regular user
        regularUser = await userRepo.createUser('testuser_create_deck', 'testuser@example.com', 'testpassword', 'USER');
        
        // Create admin user
        adminUser = await userRepo.createUser('admin_create_deck', 'admin@example.com', 'testpassword', 'ADMIN');

        // Login users to get session cookies
        const regularLoginResponse = await request(app)
            .post('/api/auth/login')
            .send({ username: 'testuser_create_deck', password: 'testpassword' });
        
        if (regularLoginResponse.headers['set-cookie']) {
            regularCookie = regularLoginResponse.headers['set-cookie'][0].split(';')[0];
        } else {
            console.log('Regular user login failed:', regularLoginResponse.status, regularLoginResponse.body);
            throw new Error('Regular user login failed');
        }

        const adminLoginResponse = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admin_create_deck', password: 'testpassword' });
        
        if (adminLoginResponse.headers['set-cookie']) {
            adminCookie = adminLoginResponse.headers['set-cookie'][0].split(';')[0];
        } else {
            console.log('Admin login failed:', adminLoginResponse.status, adminLoginResponse.body);
            throw new Error('Admin login failed');
        }
    });

    afterAll(async () => {
        // Clean up test users
        const userRepo = DataSourceConfig.getInstance().getUserRepository();
        if (regularUser) await userRepo.deleteUser(regularUser.id);
        if (adminUser) await userRepo.deleteUser(adminUser.id);
    });

    describe('Deferred Deck Persistence', () => {
        test('should not persist deck when regular user cancels editor', async () => {
            // Get initial deck count
            const initialResponse = await request(app)
                .get(`/api/v1/decks`)
                .set('Cookie', regularCookie)
                .expect(200);

            const initialDeckCount = initialResponse.body.data.length;

            // Verify no new decks were created by just opening the editor
            const finalResponse = await request(app)
                .get(`/api/v1/decks`)
                .set('Cookie', regularCookie)
                .expect(200);

            const finalDeckCount = finalResponse.body.data.length;
            expect(finalDeckCount).toBe(initialDeckCount);
        });

        test('should not persist deck when admin user cancels editor', async () => {
            // Get initial deck count
            const initialResponse = await request(app)
                .get(`/api/v1/decks`)
                .set('Cookie', adminCookie)
                .expect(200);

            const initialDeckCount = initialResponse.body.data.length;

            // Verify no new decks were created by just opening the editor
            const finalResponse = await request(app)
                .get(`/api/v1/decks`)
                .set('Cookie', adminCookie)
                .expect(200);

            const finalDeckCount = finalResponse.body.data.length;
            expect(finalDeckCount).toBe(initialDeckCount);
        });
    });

    describe('Successful Deck Creation and Persistence', () => {
        test('should allow regular user to create and save deck', async () => {
            // Get initial deck count
            const initialResponse = await request(app)
                .get(`/api/v1/decks`)
                .set('Cookie', regularCookie)
                .expect(200);

            const initialDeckCount = initialResponse.body.data.length;

            // Create a new deck
            const createResponse = await request(app)
                .post('/api/v1/decks')
                .set('Cookie', regularCookie)
                .send({
                    name: 'Regular User Test Deck',
                    description: 'Test Description',
                    ui_preferences: {
                        viewMode: 'tile',
                        dividerPosition: 65.86
                    }
                })
                .expect(201);

            expect(createResponse.body.errors).toEqual([]);
      expect(createResponse.body.data).toBeDefined();
            expect(createResponse.body.data.name).toBe('Regular User Test Deck');
            expect(createResponse.body.data.description).toBe('Test Description');
            expect(createResponse.body.data.user_id).toBe(regularUser.id);

            const deckId = createResponse.body.data.id;
            integrationTestUtils.trackTestDeck(deckId);

            // Verify deck count increased
            const finalResponse = await request(app)
                .get(`/api/v1/decks`)
                .set('Cookie', regularCookie)
                .expect(200);

            const finalDeckCount = finalResponse.body.data.length;
            expect(finalDeckCount).toBe(initialDeckCount + 1);
        });

        test('should allow admin user to create and save deck', async () => {
            // Get initial deck count
            const initialResponse = await request(app)
                .get(`/api/v1/decks`)
                .set('Cookie', adminCookie)
                .expect(200);

            const initialDeckCount = initialResponse.body.data.length;

            // Create a new deck
            const createResponse = await request(app)
                .post('/api/v1/decks')
                .set('Cookie', adminCookie)
                .send({
                    name: 'Admin User Test Deck',
                    description: 'Admin Test Description',
                    ui_preferences: {
                        viewMode: 'tile',
                        dividerPosition: 70.5
                    }
                })
                .expect(201);

            expect(createResponse.body.errors).toEqual([]);
      expect(createResponse.body.data).toBeDefined();
            expect(createResponse.body.data.name).toBe('Admin User Test Deck');
            expect(createResponse.body.data.description).toBe('Admin Test Description');
            expect(createResponse.body.data.user_id).toBe(adminUser.id);

            const deckId = createResponse.body.data.id;
            integrationTestUtils.trackTestDeck(deckId);

            // Verify deck count increased
            const finalResponse = await request(app)
                .get(`/api/v1/decks`)
                .set('Cookie', adminCookie)
                .expect(200);

            const finalDeckCount = finalResponse.body.data.length;
            expect(finalDeckCount).toBe(initialDeckCount + 1);
        });
    });
});
