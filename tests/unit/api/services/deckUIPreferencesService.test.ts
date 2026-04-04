import { DeckUIPreferencesService } from '../../../../src/api/services/deckUIPreferencesService';
import type { Deck } from '../../../../src/types';

describe('DeckUIPreferencesService', () => {
  const baseDeck: Deck = {
    id: 'd1',
    user_id: 'u1',
    name: 'D',
    cards: []
  };

  it('getForOwner returns forbidden when user does not own deck', async () => {
    const repo = {
      userOwnsDeck: jest.fn().mockResolvedValue(false),
      getUIPreferences: jest.fn(),
      getDeckById: jest.fn(),
      updateUIPreferences: jest.fn()
    };
    const svc = new DeckUIPreferencesService(repo);
    await expect(svc.getForOwner('d1', 'u2')).resolves.toEqual({ ok: false, kind: 'forbidden' });
    expect(repo.getUIPreferences).not.toHaveBeenCalled();
  });

  it('getForOwner returns stored preferences or empty object', async () => {
    const repo = {
      userOwnsDeck: jest.fn().mockResolvedValue(true),
      getUIPreferences: jest.fn().mockResolvedValue({ viewMode: 'tile' }),
      getDeckById: jest.fn(),
      updateUIPreferences: jest.fn()
    };
    const svc = new DeckUIPreferencesService(repo);
    await expect(svc.getForOwner('d1', 'u1')).resolves.toEqual({
      ok: true,
      data: { viewMode: 'tile' }
    });

    repo.getUIPreferences.mockResolvedValue(null);
    await expect(svc.getForOwner('d1', 'u1')).resolves.toEqual({ ok: true, data: {} });
  });

  it('updateForOwner rejects invalid body', async () => {
    const repo = {
      userOwnsDeck: jest.fn(),
      getUIPreferences: jest.fn(),
      getDeckById: jest.fn(),
      updateUIPreferences: jest.fn()
    };
    const svc = new DeckUIPreferencesService(repo);
    const r = await svc.updateForOwner('d1', 'u1', []);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.kind).toBe('validation_error');
    expect(repo.getDeckById).not.toHaveBeenCalled();
  });

  it('updateForOwner returns not_found when deck missing', async () => {
    const repo = {
      userOwnsDeck: jest.fn(),
      getUIPreferences: jest.fn(),
      getDeckById: jest.fn().mockResolvedValue(undefined),
      updateUIPreferences: jest.fn()
    };
    const svc = new DeckUIPreferencesService(repo);
    await expect(svc.updateForOwner('d1', 'u1', { viewMode: 'tile' })).resolves.toEqual({
      ok: false,
      kind: 'not_found',
      message: 'Deck not found'
    });
  });

  it('updateForOwner returns forbidden when not owner', async () => {
    const repo = {
      userOwnsDeck: jest.fn().mockResolvedValue(false),
      getUIPreferences: jest.fn(),
      getDeckById: jest.fn().mockResolvedValue(baseDeck),
      updateUIPreferences: jest.fn()
    };
    const svc = new DeckUIPreferencesService(repo);
    await expect(svc.updateForOwner('d1', 'u2', { viewMode: 'tile' })).resolves.toEqual({
      ok: false,
      kind: 'forbidden',
      message: 'Access denied. You do not own this deck.'
    });
    expect(repo.updateUIPreferences).not.toHaveBeenCalled();
  });

  it('updateForOwner returns not_found when update fails', async () => {
    const repo = {
      userOwnsDeck: jest.fn().mockResolvedValue(true),
      getUIPreferences: jest.fn(),
      getDeckById: jest.fn().mockResolvedValue(baseDeck),
      updateUIPreferences: jest.fn().mockResolvedValue(false)
    };
    const svc = new DeckUIPreferencesService(repo);
    await expect(svc.updateForOwner('d1', 'u1', { viewMode: 'list' })).resolves.toEqual({
      ok: false,
      kind: 'not_found',
      message: 'Deck not found'
    });
  });

  it('updateForOwner persists and returns body on success', async () => {
    const body = { viewMode: 'tile' as const, sortBy: 'name' };
    const repo = {
      userOwnsDeck: jest.fn().mockResolvedValue(true),
      getUIPreferences: jest.fn(),
      getDeckById: jest.fn().mockResolvedValue(baseDeck),
      updateUIPreferences: jest.fn().mockResolvedValue(true)
    };
    const svc = new DeckUIPreferencesService(repo);
    await expect(svc.updateForOwner('d1', 'u1', body)).resolves.toEqual({ ok: true, data: body });
    expect(repo.updateUIPreferences).toHaveBeenCalledWith('d1', body);
  });
});
