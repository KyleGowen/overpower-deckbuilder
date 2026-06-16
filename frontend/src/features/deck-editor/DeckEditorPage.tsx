import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useAuth } from '../../app/AuthProvider';
import {
  fetchDeckFull,
  replaceDeckCards,
  updateDeckMeta,
  validateDeck,
  type DeckCardInput,
} from '../../lib/api/decks';
import { fetchCatalog, fetchFoilCardMap, fetchSets } from '../../lib/api/catalog';
import { calculateDeckIconTotals } from '../../lib/decks/iconTotals';
import {
  CATALOG_TYPES,
  CATALOG_TYPE_BY_SLUG,
  cardDisplayName,
  cardStats,
  isLandscapeCatalogType,
} from '../../lib/catalog/catalogTypeMap';
import { assetUrl } from '../../lib/images/cardImages';
import {
  buildFoilCardMapLookup,
  cardHasFoilVersion,
  isFoilCard,
} from '../../lib/catalog/foilCatalog';
import { buildSetNameLookup, resolveSetDisplayName } from '../../lib/catalog/setNames';
import { STAT_ICON_PATHS } from '../database/filters/dbvFilterTypes';
import { CardImage } from '../../components/CardImage';
import { CardDetailPanel } from '../../components/CardDetailPanel';
import { QuantityStepper } from '../../components/QuantityStepper';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { Logo } from '../../components/Logo';
import {
  IconChevronLeft,
  IconHome,
  IconDecks,
  IconCollection,
  IconSave,
  IconPlus,
  IconTrash,
  IconPlay,
} from '../../components/icons';
import { AddCardsPanel } from './AddCardsPanel';
import type {
  CatalogCard,
  CatalogType,
  DeckCardEntry,
  DeckCardType,
} from '../../lib/api/types';
import type { StackCardEntry } from '../../lib/catalog/characterStacks';
import './DeckEditorPage.css';

/** Deck card types are stored hyphen/underscore-keyed; map them to catalog slugs. */
const CATALOG_SLUG_BY_DECK_TYPE = new Map<string, CatalogType>(
  CATALOG_TYPES.map((m) => [m.deckType, m.type]),
);

function deckCardImgOrientationClass(catalogType?: CatalogType): string {
  if (!catalogType) return 'deck-editor__card-img--portrait';
  if (catalogType === 'characters') return 'deck-editor__card-img--characters';
  if (catalogType === 'locations') return 'deck-editor__card-img--locations';
  if (catalogType === 'events') return 'deck-editor__card-img--events';
  return 'deck-editor__card-img--portrait';
}

const DECK_STAT_ROWS = [
  { key: 'energy', label: 'Energy', cls: 'stat-energy', iconKey: 'energy' },
  { key: 'combat', label: 'Combat', cls: 'stat-combat', iconKey: 'combat' },
  { key: 'bruteForce', label: 'Brute Force', cls: 'stat-brute-force', iconKey: 'brute_force' },
  { key: 'intelligence', label: 'Intelligence', cls: 'stat-intelligence', iconKey: 'intelligence' },
] as const;

function DeckStatRow({
  label,
  ariaLabel,
  values,
}: {
  label: string;
  ariaLabel: string;
  values: Record<(typeof DECK_STAT_ROWS)[number]['key'], number>;
}) {
  return (
    <section className="deck-editor__stats-block" aria-label={ariaLabel}>
      <span className="deck-editor__stats-block-label">{label}</span>
      <div className="deck-editor__stats-row">
        {DECK_STAT_ROWS.map(({ key, label: statLabel, cls, iconKey }) => (
          <span
            className="deck-editor__stat-group"
            key={key}
            title={`${statLabel}: ${values[key]}`}
          >
            <span className="deck-editor__stat-group-icon" aria-hidden="true">
              <img src={assetUrl(STAT_ICON_PATHS[iconKey])} alt="" />
            </span>
            <span className={`deck-editor__stat-val ${cls}`}>{values[key]}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

function DeckStatsPanel({
  maxStats,
  iconTotals,
}: {
  maxStats: Record<(typeof DECK_STAT_ROWS)[number]['key'], number>;
  iconTotals: Record<(typeof DECK_STAT_ROWS)[number]['key'], number>;
}) {
  return (
    <div className="deck-editor__stats-panel">
      <DeckStatRow
        label="Character max"
        ariaLabel="Character maximums"
        values={maxStats}
      />
      <DeckStatRow label="Icon totals" ariaLabel="Icon totals" values={iconTotals} />
    </div>
  );
}

export default function DeckEditorPage() {
  const { deckId = '', userId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  const forceReadonly = searchParams.get('readonly') === 'true';

  const deckQuery = useQuery({
    queryKey: ['deck', deckId],
    queryFn: () => fetchDeckFull(deckId, isGuest),
    enabled: Boolean(deckId),
  });

  const deck = deckQuery.data;
  const isOwner = Boolean(deck?.metadata.isOwner) && !forceReadonly;

  const [cards, setCards] = useState<DeckCardEntry[]>([]);
  const [name, setName] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<{ card: CatalogCard; type: CatalogType } | null>(null);
  const [validity, setValidity] = useState<{ valid: boolean; message?: string } | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (deck && !loadedRef.current) {
      setCards(deck.cards ?? []);
      setName(deck.metadata.name);
      loadedRef.current = true;
    }
  }, [deck]);

  // Live validation (debounced) so legality reflects edits.
  useEffect(() => {
    if (cards.length === 0) {
      setValidity(null);
      return;
    }
    const t = setTimeout(() => {
      validateDeck(cards)
        .then((r) => setValidity({ valid: r.valid, message: r.message }))
        .catch(() => setValidity(null));
    }, 500);
    return () => clearTimeout(t);
  }, [cards]);

  // Cards loaded from /full carry only { type, cardId, quantity } — no name or
  // image. Resolve those from the catalog (by deck card type → catalog slug) so
  // the editor shows real card art rather than "No image" placeholders.
  const deckCatalogTypes = useMemo(
    () => Array.from(new Set(cards.map((c) => c.type))),
    [cards],
  );
  const catalogQueries = useQueries({
    queries: deckCatalogTypes.map((deckType) => {
      const slug = CATALOG_SLUG_BY_DECK_TYPE.get(deckType);
      return {
        queryKey: ['catalog', slug ?? deckType],
        queryFn: () => fetchCatalog(slug as CatalogType),
        enabled: Boolean(slug),
        staleTime: 30 * 60 * 1000,
      };
    }),
  });
  const cardIndex = useMemo(() => {
    const index = new Map<string, CatalogCard>();
    catalogQueries.forEach((q, i) => {
      const deckType = deckCatalogTypes[i];
      (q.data ?? []).forEach((card) => index.set(`${deckType}:${card.id}`, card));
    });
    return index;
  }, [catalogQueries, deckCatalogTypes]);

  const foilMapQuery = useQuery({
    queryKey: ['foil-card-map'],
    queryFn: () => fetchFoilCardMap(),
    staleTime: 60 * 60 * 1000,
  });
  const setsQuery = useQuery({
    queryKey: ['dbv-sets'],
    queryFn: () => fetchSets(),
    staleTime: 60 * 60 * 1000,
  });
  const foilLookup = useMemo(
    () => buildFoilCardMapLookup(foilMapQuery.data ?? []),
    [foilMapQuery.data],
  );
  const setNameLookup = useMemo(
    () => buildSetNameLookup(setsQuery.data ?? []),
    [setsQuery.data],
  );

  const charactersQuery = useQuery({
    queryKey: ['catalog', 'characters'],
    queryFn: () => fetchCatalog('characters'),
    staleTime: 30 * 60 * 1000,
  });

  const totalCards = cards.reduce((s, c) => s + c.quantity, 0);

  const maxStats = useMemo(() => {
    const statById = new Map<string, ReturnType<typeof cardStats>>();
    (charactersQuery.data ?? []).forEach((c) => {
      const s = cardStats(c);
      if (s) statById.set(c.id, s);
    });
    const chars = cards.filter((c) => c.type === 'character');
    const acc = { energy: 0, combat: 0, bruteForce: 0, intelligence: 0 };
    chars.forEach((c) => {
      const s = statById.get(c.cardId);
      if (s) {
        acc.energy = Math.max(acc.energy, s.energy);
        acc.combat = Math.max(acc.combat, s.combat);
        acc.bruteForce = Math.max(acc.bruteForce, s.bruteForce);
        acc.intelligence = Math.max(acc.intelligence, s.intelligence);
      }
    });
    return acc;
  }, [cards, charactersQuery.data]);

  const iconTotals = useMemo(
    () =>
      calculateDeckIconTotals(cards, (type, cardId) =>
        cardIndex.get(`${type}:${cardId}`),
      ),
    [cards, cardIndex],
  );

  const grouped = useMemo(() => {
    const map = new Map<DeckCardType, DeckCardEntry[]>();
    cards.forEach((c) => {
      const arr = map.get(c.type) ?? [];
      arr.push(c);
      map.set(c.type, arr);
    });
    return CATALOG_TYPES.map((meta) => ({ meta, entries: map.get(meta.deckType) ?? [] })).filter(
      (g) => g.entries.length > 0,
    );
  }, [cards]);

  const setQuantity = (type: DeckCardType, cardId: string, qty: number) => {
    setCards((prev) => {
      const next = prev
        .map((c) => (c.type === type && c.cardId === cardId ? { ...c, quantity: qty } : c))
        .filter((c) => c.quantity > 0);
      return next;
    });
    setDirty(true);
  };

  const selectDeckCard = (catalogCard: CatalogCard, catalogType: CatalogType) => {
    setSelected({ card: catalogCard, type: catalogType });
  };

  const selectedDeckEntry = useMemo(() => {
    if (!selected) return null;
    const deckType = CATALOG_TYPE_BY_SLUG[selected.type].deckType;
    return cards.find((c) => c.type === deckType && c.cardId === selected.card.id) ?? null;
  }, [selected, cards]);

  const addCard = (card: CatalogCard, type: CatalogType) => {
    const deckType = CATALOG_TYPE_BY_SLUG[type].deckType;
    setCards((prev) => {
      const existing = prev.find((c) => c.type === deckType && c.cardId === card.id);
      if (existing) {
        return prev.map((c) =>
          c === existing ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [
        ...prev,
        {
          type: deckType,
          cardId: card.id,
          quantity: 1,
          name: cardDisplayName(card),
          defaultImage: (card.image_path as string) || (card.image as string),
        },
      ];
    });
    setDirty(true);
  };

  const addStack = (entries: StackCardEntry[]) => {
    if (entries.length === 0) return;
    setCards((prev) => {
      let next = [...prev];
      for (const { card, catalogType } of entries) {
        const deckType = CATALOG_TYPE_BY_SLUG[catalogType].deckType;
        const existing = next.find((c) => c.type === deckType && c.cardId === card.id);
        if (existing) {
          continue;
        }
        next = [
          ...next,
          {
            type: deckType,
            cardId: card.id,
            quantity: 1,
            name: cardDisplayName(card),
            defaultImage: (card.image_path as string) || (card.image as string),
          },
        ];
      }
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    if (!isOwner || saving) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      if (name.trim() && name.trim() !== deck?.metadata.name) {
        await updateDeckMeta(deckId, { name: name.trim() }, isGuest);
      }
      const payload: DeckCardInput[] = cards.map((c) => ({
        cardType: c.type,
        cardId: c.cardId,
        quantity: c.quantity,
        exclude_from_draw: c.exclude_from_draw,
      }));
      await replaceDeckCards(deckId, payload, isGuest);
      setDirty(false);
      setSaveMsg('Saved');
      setTimeout(() => setSaveMsg(null), 2500);
    } catch (err) {
      setSaveMsg((err as Error)?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (deckQuery.isLoading) {
    return <LoadingState fullscreen label="Loading deck..." />;
  }
  if (deckQuery.isError || !deck) {
    return (
      <div className="deck-editor deck-editor--error">
        <EmptyState
          variant="error"
          title="Deck not found"
          message="This deck may have been removed or you don't have access."
          icon={<IconDecks />}
          action={
            <button type="button" className="btn btn-primary" onClick={() => navigate('/home')}>
              Back to Home
            </button>
          }
        />
      </div>
    );
  }

  const legality = validity ?? { valid: deck.metadata.is_valid ?? false };

  return (
    <div className="deck-editor">
      {/* Left rail (desktop) */}
      <aside className="deck-editor__rail">
        <button type="button" className="deck-editor__rail-logo" onClick={() => navigate('/home')} aria-label="Home">
          <Logo height={26} />
        </button>
        <nav className="deck-editor__rail-nav">
          <button type="button" onClick={() => navigate('/home')} title="Home"><IconHome /></button>
          <button type="button" onClick={() => navigate(`/users/${user?.id ?? userId}/decks`)} title="Decks"><IconDecks /></button>
          <button type="button" onClick={() => navigate(`/users/${user?.id ?? userId}/collection`)} title="Collection"><IconCollection /></button>
        </nav>
      </aside>

      <div className="deck-editor__main">
        <header className="deck-editor__header">
          <div className="deck-editor__topbar">
            <button type="button" className="deck-editor__back" onClick={() => navigate(`/users/${user?.id ?? userId}/decks`)} aria-label="Back to decks">
              <IconChevronLeft />
            </button>

            {isOwner ? (
              <input
                className="deck-editor__name-input"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setDirty(true);
                }}
                aria-label="Deck name"
                maxLength={100}
              />
            ) : (
              <h1 className="deck-editor__name">{deck.metadata.name}</h1>
            )}

            <div className="deck-editor__meta">
              <span className="deck-editor__chip">{totalCards} cards</span>
              <span className="deck-editor__chip">Threat {deck.metadata.threat ?? 0}</span>
              <span className={`badge ${legality.valid ? 'badge-legal' : 'badge-not-legal'}`} title={legality.message}>
                {legality.valid ? 'Legal' : 'Not Legal'}
              </span>
            </div>

            <div className="deck-editor__actions">
              <button type="button" className="btn btn-ghost" disabled title="Playtest is coming soon">
                <IconPlay /> Playtest
              </button>
              {isOwner ? (
                <>
                  <button type="button" className="btn btn-secondary" onClick={() => setAddOpen(true)}>
                    <IconPlus /> Add Cards
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving || !dirty}>
                    <IconSave /> {saving ? 'Saving...' : dirty ? 'Save' : 'Saved'}
                  </button>
                </>
              ) : (
                <span className="deck-editor__readonly-tag">Read-only</span>
              )}
              {saveMsg ? <span className="deck-editor__save-msg">{saveMsg}</span> : null}
            </div>
          </div>

          <DeckStatsPanel maxStats={maxStats} iconTotals={iconTotals} />
        </header>

        {/* Card list */}
        <div className="deck-editor__content">
          {cards.length === 0 ? (
            <EmptyState
              title="This deck is empty"
              message={isOwner ? 'Add cards to start building.' : 'No cards in this deck yet.'}
              icon={<IconDecks />}
              action={
                isOwner ? (
                  <button type="button" className="btn btn-primary" onClick={() => setAddOpen(true)}>
                    <IconPlus /> Add Cards
                  </button>
                ) : null
              }
            />
          ) : (
            grouped.map(({ meta, entries }) => (
              <section className="deck-editor__group" key={meta.type}>
                <h2 className="deck-editor__group-title">
                  {meta.label}
                  <span className="deck-editor__group-count">{entries.reduce((s, e) => s + e.quantity, 0)}</span>
                </h2>
                <div
                  className={`deck-editor__cards${
                    isLandscapeCatalogType(meta.type) ? ' deck-editor__cards--landscape' : ''
                  }`}
                >
                  {entries.map((entry) => {
                    const catalogCard = cardIndex.get(`${entry.type}:${entry.cardId}`);
                    const imagePath =
                      entry.defaultImage ||
                      (catalogCard?.image_path as string | undefined) ||
                      (catalogCard?.image as string | undefined);
                    const cardName =
                      entry.name || (catalogCard ? cardDisplayName(catalogCard) : 'Card');
                    const catalogType = CATALOG_SLUG_BY_DECK_TYPE.get(entry.type);
                    const landscape = catalogType ? isLandscapeCatalogType(catalogType) : false;
                    const canOpenDetail = Boolean(catalogCard && catalogType);
                    const isCardSelected =
                      canOpenDetail &&
                      selected?.card.id === entry.cardId &&
                      selected?.type === catalogType;
                    return (
                    <div className="deck-editor__card" key={`${entry.type}:${entry.cardId}`}>
                      <button
                        type="button"
                        className={`deck-editor__card-img ${deckCardImgOrientationClass(catalogType)}${isCardSelected ? ' is-selected' : ''}`}
                        onClick={() => {
                          if (catalogCard && catalogType) selectDeckCard(catalogCard, catalogType);
                        }}
                        disabled={!canOpenDetail}
                        aria-label={canOpenDetail ? `View ${cardName}` : cardName}
                        aria-pressed={isCardSelected}
                      >
                        <CardImage
                          imagePath={imagePath}
                          catalogType={catalogType}
                          alt={cardName}
                          useThumbnail
                          className={landscape ? 'card-image--contain' : ''}
                        />
                        {entry.quantity > 1 ? <span className="deck-editor__card-qty">x{entry.quantity}</span> : null}
                      </button>
                      <div className="deck-editor__card-name" title={cardName}>{cardName}</div>
                      {isOwner ? (
                        <div className="deck-editor__card-controls">
                          <QuantityStepper
                            size="sm"
                            value={entry.quantity}
                            onChange={(q) => setQuantity(entry.type, entry.cardId, q)}
                          />
                          <button
                            type="button"
                            className="deck-editor__card-remove"
                            onClick={() => setQuantity(entry.type, entry.cardId, 0)}
                            aria-label="Remove card"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      ) : null}
                    </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      {/* Add cards panel */}
      {isOwner ? (
        <AddCardsPanel
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onAdd={addCard}
          onAddStack={addStack}
          cards={cards}
          deckCatalogIndex={cardIndex}
        />
      ) : null}

      <CardDetailPanel
        card={selected?.card ?? null}
        type={selected?.type ?? null}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        hasFoil={
          selected ? cardHasFoilVersion(selected.card, foilLookup.baseToFoil) : undefined
        }
        setDisplayName={
          selected ? resolveSetDisplayName(selected.card.set, setNameLookup) : undefined
        }
        isFoil={
          selected
            ? Boolean(selectedDeckEntry?.is_foil || isFoilCard(selected.card))
            : undefined
        }
      />
    </div>
  );
}
