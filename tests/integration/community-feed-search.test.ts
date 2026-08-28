import request from 'supertest';
import { app, initializeTestServer } from '../../src/test-server';
import { DataSourceConfig } from '../../src/config/DataSourceConfig';
import type { Deck, User } from '../../src/types';

describe('GET /api/v1/community/decks search', () => {
  let owner: User;
  let deck: Deck;

  beforeAll(async () => {
    await initializeTestServer();

    const suffix = Date.now().toString(36);
    const userRepository = DataSourceConfig.getInstance().getUserRepository();
    const deckRepository = DataSourceConfig.getInstance().getDeckRepository();

    owner = await userRepository.createUser(
      `community-search-owner-${suffix}`,
      `community-search-owner-${suffix}@example.com`,
      'test-password',
      'USER',
    );
    deck = await deckRepository.createDeck(
      owner.id,
      `Community search deck ${suffix}`,
      'Community search fixture',
    );

    const pool = DataSourceConfig.getInstance().getPool();
    await pool.query(
      'UPDATE decks SET is_private = false, is_valid = true, is_limited = false WHERE id = $1',
      [deck.id],
    );
  });

  afterAll(async () => {
    const dataSource = DataSourceConfig.getInstance();
    await dataSource.getDeckRepository().deleteDeck(deck.id);
    await dataSource.getUserRepository().deleteUser(owner.id);
  });

  it('matches deck titles and owner usernames', async () => {
    const byDeckName = await request(app)
      .get('/api/v1/community/decks')
      .query({ search: deck.name })
      .expect(200);
    const byUsername = await request(app)
      .get('/api/v1/community/decks')
      .query({ search: owner.name })
      .expect(200);

    expect(byDeckName.body.data.map((item: { metadata: { id: string } }) => item.metadata.id)).toContain(deck.id);
    expect(byUsername.body.data.map((item: { metadata: { id: string } }) => item.metadata.id)).toContain(deck.id);
  });
});
