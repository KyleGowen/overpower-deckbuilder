import fs from 'fs';
import vm from 'vm';
import path from 'path';

type FetchResponseShape = {
  ok: boolean;
  status: number;
  statusText: string;
  json?: () => Promise<any>;
  text?: () => Promise<string>;
};

describe('deck-editor-core saveDeckChanges error specificity', () => {
  function buildSandbox(fetchResponse: FetchResponseShape) {
    const scriptPath = path.resolve(process.cwd(), 'public/js/deck-editor-core.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    const notifications: Array<{ message: string; level: string }> = [];

    const sandbox: Record<string, any> = {
      console,
      notifications,
      currentDeckId: 'deck-123',
      currentDeckData: {
        metadata: {
          id: 'deck-123',
          name: 'Test Deck',
          description: ''
        }
      },
      isDeckLimited: false,
      window: {
        deckEditorCards: [
          { type: 'power', cardId: 'power-energy-uuid', quantity: 1 }
        ],
        history: {
          pushState: () => undefined
        },
        location: {
          href: ''
        }
      },
      document: {
        body: {
          classList: {
            contains: () => false
          }
        }
      },
      fetch: jest.fn().mockResolvedValue(fetchResponse),
      isGuestUser: () => false,
      getCurrentUser: () => ({ id: 'user-1', userId: 'user-1' }),
      validateDeck: () => ({ errors: [], warnings: [], isValid: true }),
      showNotification: (message: string, level: string) => notifications.push({ message, level }),
      saveDeckExpansionState: () => undefined,
      getCurrentUIPreferences: () => ({}),
      saveUIPreferences: async () => undefined,
      loadDecks: () => undefined,
      alert: () => undefined
    };

    vm.createContext(sandbox);
    vm.runInContext(scriptContent, sandbox);
    return sandbox;
  }

  it('shows backend JSON error message in toast', async () => {
    const sandbox = buildSandbox({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({
        success: false,
        error: 'Card at index 4: quantity must be a number between 1 and 100'
      }),
      text: async () => 'ignored text'
    });

    await sandbox.saveDeckChanges();

    expect(sandbox.notifications).toContainEqual({
      message: 'Card at index 4: quantity must be a number between 1 and 100',
      level: 'error'
    });
  });

  it('falls back to status text when no error payload can be parsed', async () => {
    const sandbox = buildSandbox({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => {
        throw new Error('invalid json');
      },
      text: async () => ''
    });

    await sandbox.saveDeckChanges();

    expect(sandbox.notifications).toContainEqual({
      message: 'Failed to save deck cards: 400 Bad Request',
      level: 'error'
    });
  });
});
