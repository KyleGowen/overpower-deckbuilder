import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../app/AuthProvider';
import { fetchDecksForUser, createDeck, deleteDeck } from '../../lib/api/decks';
import { fetchCatalog } from '../../lib/api/catalog';
import { cardStats } from '../../lib/catalog/catalogTypeMap';
import { buildMissionSetByCardId, deckMissionSetName } from '../../lib/decks/missionSetLabel';
import { DeckTile, type DeckStatLine } from '../../components/DeckTile';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { SlideOutPanel } from '../../components/SlideOutPanel';
import { IconPlus, IconDecks, IconEdit, IconTrash, IconPlay } from '../../components/icons';
import type { DeckListItem } from '../../lib/api/types';
import './DeckSelectionPage.css';

export default function DeckSelectionPage() {
  const { user, isGuest } = useAuth();
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const ownerId = user?.id ?? params.userId ?? '';

  const decksQuery = useQuery({
    queryKey: ['decks', 'mine', ownerId],
    queryFn: () => fetchDecksForUser(isGuest),
  });
  const charactersQuery = useQuery({
    queryKey: ['catalog', 'characters'],
    queryFn: () => fetchCatalog('characters'),
    staleTime: 30 * 60 * 1000,
  });
  const missionsQuery = useQuery({
    queryKey: ['catalog', 'missions'],
    queryFn: () => fetchCatalog('missions'),
    staleTime: 30 * 60 * 1000,
  });

  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [busy, setBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [menuDeck, setMenuDeck] = useState<DeckListItem | null>(null);

  const charStatsById = useMemo(() => {
    const m = new Map<string, ReturnType<typeof cardStats>>();
    (charactersQuery.data ?? []).forEach((c) => {
      const s = cardStats(c);
      if (s) m.set(c.id, s);
    });
    return m;
  }, [charactersQuery.data]);

  const missionSetByCardId = useMemo(
    () => buildMissionSetByCardId(missionsQuery.data ?? []),
    [missionsQuery.data],
  );

  const deckMissionSetLabel = (deck: DeckListItem): string | null =>
    deckMissionSetName(deck, missionSetByCardId);

  const deckMaxStats = (deck: DeckListItem): DeckStatLine | null => {
    const chars = (deck.cards ?? []).filter((c) => c.type === 'character');
    if (chars.length === 0) return null;
    let energy = 0;
    let combat = 0;
    let bruteForce = 0;
    let intelligence = 0;
    let found = false;
    chars.forEach((c) => {
      const s = charStatsById.get(c.cardId);
      if (s) {
        found = true;
        energy = Math.max(energy, s.energy);
        combat = Math.max(combat, s.combat);
        bruteForce = Math.max(bruteForce, s.bruteForce);
        intelligence = Math.max(intelligence, s.intelligence);
      }
    });
    return found ? { energy, combat, bruteForce, intelligence } : null;
  };

  const decks = decksQuery.data ?? [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? decks.filter((d) => d.metadata.name.toLowerCase().includes(q)) : decks;
    return [...list].sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
  }, [decks, search]);

  const openDeck = (deck: DeckListItem) => {
    navigate(`/users/${deck.metadata.userId}/decks/${deck.metadata.id}`);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !newName.trim()) return;
    setBusy(true);
    setCreateError(null);
    try {
      const created = await createDeck({ name: newName.trim(), description: newDesc.trim() || undefined }, isGuest);
      await queryClient.invalidateQueries({ queryKey: ['decks'] });
      const targetUser = created.userId || user?.id || ownerId;
      navigate(`/users/${targetUser}/decks/${created.id}`);
    } catch (err) {
      setCreateError((err as Error)?.message || 'Could not create deck');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (deck: DeckListItem) => {
    if (!window.confirm(`Delete "${deck.metadata.name}"? This cannot be undone.`)) return;
    try {
      await deleteDeck(deck.metadata.id, isGuest);
      setMenuDeck(null);
      await queryClient.invalidateQueries({ queryKey: ['decks'] });
    } catch (err) {
      window.alert((err as Error)?.message || 'Could not delete deck');
    }
  };

  return (
    <div className="dsel">
      <div className="dsel__inner">
        <header className="dsel__header">
          <div>
            <h1 className="dsel__title"><IconDecks /> {isGuest ? 'Guest Decks' : 'My Decks'}</h1>
            <div className="dsel__stats">
              <span><strong>{decks.length}</strong> decks</span>
              {isGuest ? <span className="dsel__guest-note">Stored for this session</span> : null}
            </div>
          </div>
          <div className="dsel__actions">
            <input
              type="search"
              className="dsel__search"
              placeholder="Search decks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search decks"
            />
            <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
              <IconPlus /> New Deck
            </button>
          </div>
        </header>

        {decksQuery.isLoading ? (
          <LoadingState label="Loading decks..." />
        ) : decksQuery.isError ? (
          <EmptyState variant="error" title="Couldn't load decks" message="Please try again." icon={<IconDecks />} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? 'No decks match' : 'No decks yet'}
            message={search ? 'Try a different search.' : 'Create your first deck to get started.'}
            icon={<IconDecks />}
            action={
              !search ? (
                <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
                  <IconPlus /> New Deck
                </button>
              ) : null
            }
          />
        ) : (
          <div className="dsel__grid">
            {filtered.map((deck) => (
              <DeckTile
                key={deck.metadata.id}
                deck={deck}
                variant="full"
                maxStats={deckMaxStats(deck)}
                missionSetName={deckMissionSetLabel(deck)}
                onOpen={() => openDeck(deck)}
                onMenu={() => setMenuDeck(deck)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create deck panel */}
      <SlideOutPanel open={createOpen} onClose={() => setCreateOpen(false)} title="New Deck" ariaLabel="Create a deck" width={400}>
        <form className="dsel__form" onSubmit={handleCreate}>
          <label className="dsel__field">
            <span>Deck name</span>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Cosmic Beatdown" maxLength={100} required autoFocus />
          </label>
          <label className="dsel__field">
            <span>Description (optional)</span>
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What's the game plan?" maxLength={500} rows={4} />
          </label>
          {createError ? <div className="dsel__error" role="alert">{createError}</div> : null}
          <button type="submit" className="btn btn-primary" disabled={busy || !newName.trim()}>
            {busy ? 'Creating...' : 'Create Deck'}
          </button>
        </form>
      </SlideOutPanel>

      {/* Deck actions panel */}
      <SlideOutPanel
        open={Boolean(menuDeck)}
        onClose={() => setMenuDeck(null)}
        title={menuDeck?.metadata.name}
        ariaLabel="Deck actions"
        width={360}
      >
        {menuDeck ? (
          <div className="dsel__menu">
            <button type="button" className="dsel__menu-item" onClick={() => openDeck(menuDeck)}>
              <IconEdit /> Open / Edit
            </button>
            <button type="button" className="dsel__menu-item" onClick={() => navigate(`/users/${menuDeck.metadata.userId}/decks/${menuDeck.metadata.id}?readonly=true`)}>
              <IconPlay /> View (read-only)
            </button>
            {!isGuest || menuDeck.metadata.id.startsWith('guest_') ? (
              <button type="button" className="dsel__menu-item dsel__menu-item--danger" onClick={() => handleDelete(menuDeck)}>
                <IconTrash /> Delete deck
              </button>
            ) : null}
          </div>
        ) : null}
      </SlideOutPanel>
    </div>
  );
}
