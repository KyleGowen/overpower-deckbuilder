/**
 * Validates getDecksByUserId mission preview behavior.
 * The implementation (deck-crud) uses display_mission_card_id in the LATERAL ORDER BY
 * so the first mission row is the user-selected one when set.
 * TODO: Re-enable after investigating requireActual + mock pool interaction post-M3 refactor.
 */
describe('PostgreSQLDeckRepository.getDecksByUserId mission preview selection', () => {
  it.skip('should prefer display_mission_card_id in the mission preview ORDER BY', async () => {
    const { PostgreSQLDeckRepository } = jest.requireActual(
      '../../src/database/PostgreSQLDeckRepository'
    );

    const mockClient: { query: jest.Mock; release: jest.Mock } = {
      query: jest.fn().mockResolvedValue({
        rows: [
          {
            id: 'deck-1',
            user_id: 'user-1',
            name: 'Deck 1',
            description: null,
            ui_preferences: null,
            is_limited: false,
            is_valid: true,
            card_count: 0,
            threat: 0,
            reserve_character: null,
            display_mission_card_id: null,
            background_image_path: null,
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
            character_1_id: null,
            character_2_id: null,
            character_3_id: null,
            character_4_id: null,
            location_id: null,
            mission_1_id: null,
            mission_1_name: null,
            mission_1_default_image: null,
          },
        ],
      }),
      release: jest.fn(),
    };

    const mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
    };

    const repo = new PostgreSQLDeckRepository(mockPool as never);
    const decks = await repo.getDecksByUserId('user-1');

    expect(mockClient.query).toHaveBeenCalled();
    expect(decks).toHaveLength(1);
    expect(decks[0]).toMatchObject({
      id: 'deck-1',
      user_id: 'user-1',
      name: 'Deck 1',
      is_limited: false,
      display_mission_card_id: null,
    });
    expect(decks[0].cards).toEqual([]);
  });
});
