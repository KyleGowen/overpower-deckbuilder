import fs from 'fs';
import vm from 'vm';
import path from 'path';

const okJson = (data: Record<string, unknown> = {}) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  json: async () => data
});

describe('deck-editor-core legality persistence', () => {
  const scriptPath = path.resolve(process.cwd(), 'public/js/deck-editor-core.js');
  const scriptContent = fs.readFileSync(scriptPath, 'utf8');

  function createBaseSandbox() {
    const notifications: Array<{ message: string; level: string }> = [];
    const sandbox: Record<string, any> = {
      console,
      notifications,
      currentDeckId: 'deck-123',
      currentDeckData: {
        metadata: {
          id: 'deck-123',
          name: 'Test Deck',
          description: '',
          is_limited: false
        }
      },
      isDeckLimited: false,
      isDeckLegalityEvaluationSkipped: function (this: void) {
        return sandbox.isDeckLimited === true;
      },
      computeDeckIsValidForPersistence: function (cards: unknown[]) {
        return sandbox.validateDeck(cards).errors.length === 0;
      },
      window: {
        deckEditorCards: [{ type: 'power', cardId: 'power-energy-uuid', quantity: 1 }],
        history: { pushState: () => undefined },
        location: { href: '' }
      },
      document: {
        body: {
          classList: {
            contains: () => false
          }
        }
      },
      isGuestUser: () => false,
      getCurrentUser: () => ({ id: 'user-1', userId: 'user-1' }),
      validateDeck: () => ({ errors: [{ message: 'bad' }], warnings: [], isValid: false }),
      v1ResponseOk: () => true,
      showNotification: (message: string, level: string) => notifications.push({ message, level }),
      saveDeckExpansionState: () => undefined,
      getCurrentUIPreferences: () => ({}),
      saveUIPreferences: async () => undefined,
      loadDecks: () => undefined,
      alert: () => undefined
    };
    return sandbox;
  }

  it('saveDeckChanges omits is_valid from metadata PUT when deck is Limited', async () => {
    const sandbox = createBaseSandbox();
    sandbox.isDeckLimited = true;
    sandbox.currentDeckData.metadata.is_limited = true;

    const bodies: unknown[] = [];
    sandbox.fetch = jest.fn(async (_url: string, init?: { method?: string; body?: string }) => {
      if (init?.body) {
        try {
          bodies.push(JSON.parse(init.body));
        } catch {
          bodies.push(init.body);
        }
      }
      return okJson({ data: { metadata: {} } });
    });

    vm.createContext(sandbox);
    vm.runInContext(scriptContent, sandbox);

    await sandbox.saveDeckChanges();

    expect(sandbox.fetch).toHaveBeenCalled();
    const metaBody = bodies.find(
      (b) => typeof b === 'object' && b !== null && 'is_limited' in (b as object)
    ) as Record<string, unknown> | undefined;
    expect(metaBody).toBeDefined();
    expect(metaBody!.is_limited).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(metaBody!, 'is_valid')).toBe(false);
    expect(sandbox.notifications.some((n: { level: string }) => n.level === 'success')).toBe(true);
  });

  it('saveDeckChanges includes is_valid when not Limited', async () => {
    const sandbox = createBaseSandbox();
    sandbox.isDeckLimited = false;
    sandbox.validateDeck = () => ({ errors: [], warnings: [], isValid: true });

    const bodies: unknown[] = [];
    sandbox.fetch = jest.fn(async (_url: string, init?: { method?: string; body?: string }) => {
      if (init?.body) {
        bodies.push(JSON.parse(init.body));
      }
      return okJson({ data: { metadata: {} } });
    });

    vm.createContext(sandbox);
    vm.runInContext(scriptContent, sandbox);

    await sandbox.saveDeckChanges();

    const metaBody = bodies.find(
      (b) => typeof b === 'object' && b !== null && 'is_limited' in (b as object)
    ) as Record<string, unknown> | undefined;
    expect(metaBody).toBeDefined();
    expect(metaBody!.is_valid).toBe(true);
  });

  it('syncPersistedDeckCardsFromEditor PUTs is_valid after cards sync when not Limited', async () => {
    const sandbox = createBaseSandbox();
    sandbox.isDeckLimited = false;

    const calls: Array<{ url: string; body: unknown }> = [];
    sandbox.fetch = jest.fn(async (url: string, init?: { method?: string; body?: string }) => {
      let body: unknown;
      if (init?.body) {
        body = JSON.parse(init.body);
      }
      calls.push({ url, body });
      return okJson({ data: {}, errors: [] });
    });

    vm.createContext(sandbox);
    vm.runInContext(scriptContent, sandbox);

    const ok = await sandbox.syncPersistedDeckCardsFromEditor();
    expect(ok).toBe(true);

    const metaCall = calls.find((c) => c.url.endsWith('/api/v1/decks/deck-123') && c.body);
    expect(metaCall).toBeDefined();
    expect(metaCall!.body).toEqual({ is_valid: false });
    expect(sandbox.currentDeckData.metadata.is_valid).toBe(false);
  });

  it('syncPersistedDeckCardsFromEditor skips is_valid PUT when Limited', async () => {
    const sandbox = createBaseSandbox();
    sandbox.isDeckLimited = true;

    const urls: string[] = [];
    sandbox.fetch = jest.fn(async (url: string, init?: { method?: string; body?: string }) => {
      urls.push(url);
      if (init?.body) {
        JSON.parse(init.body);
      }
      return okJson({ data: {}, errors: [] });
    });

    vm.createContext(sandbox);
    vm.runInContext(scriptContent, sandbox);

    await sandbox.syncPersistedDeckCardsFromEditor();

    expect(urls.filter((u) => u.includes('/decks/deck-123') && !u.includes('/cards'))).toHaveLength(0);
    expect(urls.some((u) => u.includes('/cards'))).toBe(true);
  });
});
