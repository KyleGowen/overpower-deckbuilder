export interface DeckEditorLocationState {
  returnTo?: string;
}

export const DECK_EDITOR_RETURN_HOME = '/home';
export const DECK_EDITOR_RETURN_COLUMBUS = '/home/columbus-regional';

function isSafeInternalPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//');
}

export function getDeckEditorReturnTo(state: unknown): string | undefined {
  if (!state || typeof state !== 'object') return undefined;
  const returnTo = (state as DeckEditorLocationState).returnTo;
  if (typeof returnTo !== 'string' || returnTo.length === 0) return undefined;
  return isSafeInternalPath(returnTo) ? returnTo : undefined;
}

export function buildDeckEditorNavigateState(returnTo: string): DeckEditorLocationState {
  return { returnTo };
}

export function buildDeckSelectionReturnPath(userId: string): string {
  return `/users/${userId}/decks`;
}

export function getDeckEditorBackAriaLabel(returnTo?: string): string {
  if (!returnTo) return 'Back to decks';
  if (returnTo === DECK_EDITOR_RETURN_HOME) return 'Back to home';
  if (returnTo === DECK_EDITOR_RETURN_COLUMBUS) return 'Back to tournament stats';
  if (returnTo.endsWith('/decks')) return 'Back to decks';
  return 'Back';
}