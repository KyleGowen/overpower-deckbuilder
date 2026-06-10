/** Client-side favorite decks (localStorage). No backend favorites endpoint. */
const KEY = 'favoriteDecks';

export function getFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
}

export function toggleFavorite(deckId: string): Set<string> {
  const favs = getFavorites();
  if (favs.has(deckId)) favs.delete(deckId);
  else favs.add(deckId);
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(favs)));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('favorite-decks-change'));
  return favs;
}
