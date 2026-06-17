import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../app/AuthProvider';
import {
  fetchDeckFull,
  replaceDeckCards,
  updateDeckMeta,
  validateDeck,
  type DeckCardInput,
  type UpdateDeckMetaInput,
} from '../../lib/api/decks';
import { fetchCatalog, fetchFoilCardMap, fetchSets } from '../../lib/api/catalog';
import { calculateDeckTotalThreat, formatThreatDisplay } from '../../lib/decks/deckThreat';
import { calculateDeckIconTotals } from '../../lib/decks/iconTotals';
import {
  characterDeckEntries,
  computeReserveRowState,
  reserveSlotVisible,
} from '../../lib/decks/reserveCharacter';
import {
  aggregateInstancesForSave,
  expandDeckToInstances,
  removeInstance,
  createInstanceId,
} from '../../lib/decks/deckInstances';
import { collectPrintingsForCard } from '../../lib/catalog/cardPrintings';
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
import {
  buildKoDimmingContext,
  calculateActiveTeamStats,
  shouldDimDeckCard,
  toggleKoCharacterId,
} from '../../lib/decks/simulateKo';
import { AddCardsPanel } from './AddCardsPanel';
import { KoToggleButton } from './KoToggleButton';
import { ReserveCharacterButton } from './ReserveCharacterButton';
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

/** Location/event thumbs bake contain letterbox; full-res + cover fills the 236:151 frame like characters. */
function deckEditorUsesThumbnail(catalogType?: CatalogType): boolean {
  return catalogType !== 'locations' && catalogType !== 'events';
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

  const queryClient = useQueryClient();
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
  const [selected, setSelected] = useState<{
    card: CatalogCard;
    type: CatalogType;
    instanceId: string;
  } | null>(null);
  const [validity, setValidity] = useState<{ valid: boolean; message?: string } | null>(null);
  const [reserveCharacterId, setReserveCharacterId] = useState<string | null>(null);
  const [koCharacterIds, setKoCharacterIds] = useState<Set<string>>(() => new Set());
  const loadedRef = useRef(false);
  const savedReserveRef = useRef<string | null>(null);
  const canSimulateKo = Boolean(user);

  useEffect(() => {
    loadedRef.current = false;
    setKoCharacterIds(new Set());
  }, [deckId]);

  useEffect(() => {
    if (deck && !loadedRef.current) {
      setCards(expandDeckToInstances(deck.cards ?? []));
      setName(deck.metadata.name);
      const loadedReserve = deck.metadata.reserve_character ?? null;
      setReserveCharacterId(loadedReserve);
      savedReserveRef.current = loadedReserve;
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

  const catalogBySlug = useMemo(() => {
    const map = new Map<CatalogType, CatalogCard[]>();
    catalogQueries.forEach((q, i) => {
      const deckType = deckCatalogTypes[i];
      const slug = CATALOG_SLUG_BY_DECK_TYPE.get(deckType);
      if (slug) map.set(slug, q.data ?? []);
    });
    return map;
  }, [catalogQueries, deckCatalogTypes]);

  const totalCards = cards.length;

  const koCtx = useMemo(
    () =>
      koCharacterIds.size > 0
        ? buildKoDimmingContext(cards, cardIndex, koCharacterIds)
        : null,
    [cards, cardIndex, koCharacterIds],
  );

  const maxStats = useMemo(() => {
    if (koCtx) {
      return calculateActiveTeamStats(koCtx);
    }
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
  }, [cards, charactersQuery.data, koCtx]);

  const iconTotals = useMemo(
    () =>
      calculateDeckIconTotals(cards, (type, cardId) =>
        cardIndex.get(`${type}:${cardId}`),
      ),
    [cards, cardIndex],
  );

  const characterEntries = useMemo(() => characterDeckEntries(cards), [cards]);

  const totalThreat = useMemo(
    () =>
      calculateDeckTotalThreat(cards, reserveCharacterId, (type, cardId) =>
        cardIndex.get(`${type}:${cardId}`),
      ),
    [cards, reserveCharacterId, cardIndex],
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

  const removeDeckInstance = (instanceId: string) => {
    const entry = cards.find((c) => c.instanceId === instanceId);
    if (!entry) return;
    if (entry.type === 'character' && reserveCharacterId === entry.cardId) {
      setReserveCharacterId(null);
    }
    if (entry.type === 'character') {
      setKoCharacterIds((prev) => {
        if (!prev.has(entry.cardId)) return prev;
        const next = new Set(prev);
        next.delete(entry.cardId);
        return next;
      });
    }
    setCards((prev) => removeInstance(prev, instanceId));
    if (selected?.instanceId === instanceId) {
      setSelected(null);
    }
    setDirty(true);
  };

  const selectReserveCharacter = (cardId: string) => {
    setReserveCharacterId(cardId);
    setDirty(true);
  };

  const deselectReserveCharacter = () => {
    setReserveCharacterId(null);
    setDirty(true);
  };

  const selectDeckCard = (
    catalogCard: CatalogCard,
    catalogType: CatalogType,
    instanceId: string,
  ) => {
    setSelected({ card: catalogCard, type: catalogType, instanceId });
  };

  const selectedDeckEntry = useMemo(() => {
    if (!selected) return null;
    return cards.find((c) => c.instanceId === selected.instanceId) ?? null;
  }, [selected, cards]);

  const printingRows = useMemo(() => {
    if (!selected || !isOwner) return undefined;
    const allCards = catalogBySlug.get(selected.type) ?? [];
    const printings = collectPrintingsForCard(
      selected.card,
      selected.type,
      allCards,
      foilLookup,
      (set) => resolveSetDisplayName(set, setNameLookup) ?? String(set ?? ''),
    );
    if (printings.length <= 1) return undefined;
    const currentId = selectedDeckEntry?.cardId ?? selected.card.id;
    return printings.map((printing) => ({
      card: printing,
      setDisplayName: resolveSetDisplayName(printing.set, setNameLookup) ?? String(printing.set ?? ''),
      setNumber: printing.set_number ? String(printing.set_number) : null,
      isCurrent: printing.id === currentId,
    }));
  }, [selected, isOwner, catalogBySlug, foilLookup, setNameLookup, selectedDeckEntry]);

  const applyPrinting = (printingId: string) => {
    if (!selected?.instanceId || !isOwner) return;
    const deckType = CATALOG_TYPE_BY_SLUG[selected.type].deckType;
    const targetCard = cardIndex.get(`${deckType}:${printingId}`);
    if (!targetCard) return;

    setCards((prev) =>
      prev.map((c) =>
        c.instanceId === selected.instanceId
          ? {
              ...c,
              cardId: printingId,
              defaultImage: (targetCard.image_path as string) || (targetCard.image as string),
              is_foil: isFoilCard(targetCard),
              name: cardDisplayName(targetCard),
            }
          : c,
      ),
    );
    setSelected((prev) => (prev ? { ...prev, card: targetCard } : null));
    setDirty(true);
  };

  const addCard = (card: CatalogCard, type: CatalogType) => {
    const deckType = CATALOG_TYPE_BY_SLUG[type].deckType;
    setCards((prev) => [
      ...prev,
      {
        type: deckType,
        cardId: card.id,
        quantity: 1,
        instanceId: createInstanceId(),
        name: cardDisplayName(card),
        defaultImage: (card.image_path as string) || (card.image as string),
        is_foil: isFoilCard(card),
      },
    ]);
    setDirty(true);
  };

  const addStack = (entries: StackCardEntry[]) => {
    if (entries.length === 0) return;
    setCards((prev) => {
      let next = [...prev];
      for (const { card, catalogType } of entries) {
        const deckType = CATALOG_TYPE_BY_SLUG[catalogType].deckType;
        next = [
          ...next,
          {
            type: deckType,
            cardId: card.id,
            quantity: 1,
            instanceId: createInstanceId(),
            name: cardDisplayName(card),
            defaultImage: (card.image_path as string) || (card.image as string),
            is_foil: isFoilCard(card),
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
      const metaPatch: UpdateDeckMetaInput = {};
      if (name.trim() && name.trim() !== deck?.metadata.name) {
        metaPatch.name = name.trim();
      }
      if (reserveCharacterId !== savedReserveRef.current) {
        metaPatch.reserve_character = reserveCharacterId;
      }
      if (Object.keys(metaPatch).length > 0) {
        const updated = await updateDeckMeta(deckId, metaPatch, isGuest);
        savedReserveRef.current = reserveCharacterId;
        queryClient.setQueryData(['deck', deckId], updated);
      }
      const payload: DeckCardInput[] = aggregateInstancesForSave(cards).map((c) => ({
        cardType: c.type,
        cardId: c.cardId,
        quantity: c.quantity,
        exclude_from_draw: c.exclude_from_draw,
      }));
      const updatedCards = await replaceDeckCards(deckId, payload, isGuest);
      queryClient.setQueryData(['deck', deckId], (prev) => {
        const base = prev ?? updatedCards;
        return {
          ...base,
          cards: updatedCards.cards ?? cards,
          metadata: {
            ...base.metadata,
            ...updatedCards.metadata,
            reserve_character: reserveCharacterId,
          },
        };
      });
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
            <div className="deck-editor__topbar-leading">
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
                <span className="deck-editor__chip">Threat {formatThreatDisplay(totalThreat)}</span>
                <span className={`badge ${legality.valid ? 'badge-legal' : 'badge-not-legal'}`} title={legality.message}>
                  {legality.valid ? 'Legal' : 'Not Legal'}
                </span>
              </div>
            </div>

            <DeckStatsPanel maxStats={maxStats} iconTotals={iconTotals} />

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
                  <span className="deck-editor__group-count">{entries.length}</span>
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
                    const canOpenDetail = Boolean(catalogCard && catalogType);
                    const isCardSelected =
                      canOpenDetail &&
                      selected?.instanceId === entry.instanceId &&
                      selected?.type === catalogType;
                    const reserveRowState =
                      entry.type === 'character'
                        ? computeReserveRowState(
                            entry.cardId,
                            reserveCharacterId,
                            characterEntries,
                            !isOwner,
                          )
                        : null;
                    const showKoOnCharacter = entry.type === 'character' && canSimulateKo;
                    const showCardFooter =
                      isOwner ||
                      (entry.type === 'character' &&
                        reserveRowState !== null &&
                        reserveSlotVisible(reserveRowState)) ||
                      showKoOnCharacter;
                    const koDimmed =
                      koCtx !== null && shouldDimDeckCard(entry, catalogCard, koCtx);
                    return (
                    <div
                      className={`deck-editor__card${koDimmed ? ' deck-editor__card--ko-dimmed' : ''}`}
                      key={entry.instanceId ?? `${entry.type}:${entry.cardId}`}
                    >
                      <div className="deck-editor__card-media">
                        <button
                          type="button"
                          className={`deck-editor__card-img ${deckCardImgOrientationClass(catalogType)}${isCardSelected ? ' is-selected' : ''}`}
                          onClick={() => {
                            if (catalogCard && catalogType && entry.instanceId) {
                              selectDeckCard(catalogCard, catalogType, entry.instanceId);
                            }
                          }}
                          disabled={!canOpenDetail}
                          aria-label={canOpenDetail ? `View ${cardName}` : cardName}
                          aria-pressed={isCardSelected}
                        >
                          <CardImage
                            imagePath={imagePath}
                            catalogType={catalogType}
                            alt={cardName}
                            useThumbnail={deckEditorUsesThumbnail(catalogType)}
                            className="card-image--contain"
                          />
                        </button>
                      </div>
                      {entry.type === 'character' &&
                      reserveRowState &&
                      reserveSlotVisible(reserveRowState) ? (
                        <div className="deck-editor__card-reserve-wrap">
                          <ReserveCharacterButton
                            state={reserveRowState}
                            cardName={cardName}
                            onSelect={() => selectReserveCharacter(entry.cardId)}
                            onDeselect={deselectReserveCharacter}
                          />
                        </div>
                      ) : null}
                      {showCardFooter ? (
                        <div className="deck-editor__card-footer">
                          <div className="deck-editor__card-controls">
                            {showKoOnCharacter ? (
                              <KoToggleButton
                                active={koCharacterIds.has(entry.cardId)}
                                cardName={cardName}
                                onToggle={() =>
                                  setKoCharacterIds((prev) =>
                                    toggleKoCharacterId(prev, entry.cardId),
                                  )
                                }
                              />
                            ) : null}
                            {isOwner ? (
                              <button
                                type="button"
                                className="deck-editor__card-remove"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (entry.instanceId) {
                                    removeDeckInstance(entry.instanceId);
                                  }
                                }}
                                aria-label={`Remove ${cardName}`}
                              >
                                <IconTrash />
                              </button>
                            ) : null}
                          </div>
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
        printings={printingRows}
        onApplyPrinting={isOwner ? applyPrinting : undefined}
      />
    </div>
  );
}
