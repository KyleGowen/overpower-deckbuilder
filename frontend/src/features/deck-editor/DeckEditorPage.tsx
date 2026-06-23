import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { MobileBottomNav } from '../../components/MobileBottomNav';
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
  IconCards,
  IconList,
  IconGrid,
} from '../../components/icons';
import {
  buildKoDimmingContext,
  calculateActiveTeamStats,
  shouldDimDeckCard,
  toggleKoCharacterId,
} from '../../lib/decks/simulateKo';
import { canDrawHand, countPlayableCards, drawRandomHand } from '../../lib/decks/drawHand';
import {
  buildDeckCardIndex,
  catalogSlugForDeckType,
  deckCardDisplayName,
  normalizeDeckCardType,
  resolveDeckCatalogCard,
  sortDeckPowerEntries,
} from '../../lib/decks/deckCardCatalog';
import { AddCardsPanel } from './AddCardsPanel';
import { DrawHandPanel } from './DrawHandPanel';
import { DeckListView, persistDeckViewMode, readDeckViewMode } from './DeckListView';
import { KoToggleButton } from './KoToggleButton';
import { ReserveCharacterButton } from './ReserveCharacterButton';
import type {
  CatalogCard,
  CatalogType,
  DeckCardEntry,
  DeckCardType,
} from '../../lib/api/types';
import type { StackCardEntry } from '../../lib/catalog/characterStacks';
import { useLayoutMode } from '../../lib/layout/LayoutModeProvider';
import { useDeckCardDetailHistory } from '../../lib/layout/useDeckCardDetailHistory';
import { clearProgressiveImageSession } from '../../lib/images/progressiveImageLoad';
import { resolveMobileDeckTypeTab, stepCyclicalIndex } from '../../lib/layout/cyclicalIndex';
import { useHorizontalSwipe } from '../../lib/layout/useHorizontalSwipe';
import './DeckEditorPage.css';

function deckCardImgOrientationClass(catalogType?: CatalogType): string {
  if (!catalogType) return 'deck-editor__card-img--portrait';
  if (catalogType === 'characters') return 'deck-editor__card-img--characters';
  if (catalogType === 'locations') return 'deck-editor__card-img--locations';
  if (catalogType === 'events') return 'deck-editor__card-img--events';
  return 'deck-editor__card-img--portrait';
}

/** Location/event thumbs bake contain letterbox incompatible with cover framing. */
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

function DeckThreatStat({ totalThreat }: { totalThreat: number }) {
  const display = formatThreatDisplay(totalThreat);
  return (
    <span
      className="deck-editor__threat-stat"
      aria-label="Deck total threat"
      title={`Threat: ${display}`}
    >
      <span className="deck-editor__stat-group-icon" aria-hidden="true">
        <img src={assetUrl(STAT_ICON_PATHS.threat_level)} alt="" />
      </span>
      <span className="deck-editor__stat-val stat-threat">{display}</span>
    </span>
  );
}

function DeckStatsPanel({
  maxStats,
  iconTotals,
  totalThreat,
  showThreatInPanel = true,
}: {
  maxStats: Record<(typeof DECK_STAT_ROWS)[number]['key'], number>;
  iconTotals: Record<(typeof DECK_STAT_ROWS)[number]['key'], number>;
  totalThreat: number;
  showThreatInPanel?: boolean;
}) {
  return (
    <div className="deck-editor__stats-panel">
      {showThreatInPanel ? <DeckThreatStat totalThreat={totalThreat} /> : null}
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
  const { isMobile } = useLayoutMode();

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
  const [drawHandOpen, setDrawHandOpen] = useState(false);
  const [drawnCards, setDrawnCards] = useState<DeckCardEntry[]>([]);
  const [mobileDeckTypeTab, setMobileDeckTypeTab] = useState<CatalogType | null>(null);
  const [deckViewMode, setDeckViewMode] = useState(readDeckViewMode);
  const loadedRef = useRef(false);
  const savedReserveRef = useRef<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const typeTabsRef = useRef<HTMLDivElement>(null);
  const canSimulateKo = Boolean(user);

  const { close: closeCardDetail } = useDeckCardDetailHistory(Boolean(selected), () => setSelected(null));

  useEffect(() => {
    loadedRef.current = false;
    setKoCharacterIds(new Set());
    setDrawHandOpen(false);
    setDrawnCards([]);
  }, [deckId]);

  useEffect(() => () => clearProgressiveImageSession('deck-editor'), []);

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
    () => Array.from(new Set(cards.map((c) => normalizeDeckCardType(c.type)))),
    [cards],
  );
  const catalogQueries = useQueries({
    queries: deckCatalogTypes.map((deckType) => {
      const slug = catalogSlugForDeckType(deckType);
      return {
        queryKey: ['catalog', slug ?? deckType],
        queryFn: () => fetchCatalog(slug as CatalogType),
        enabled: Boolean(slug),
        staleTime: 30 * 60 * 1000,
      };
    }),
  });
  const cardIndex = useMemo(
    () => buildDeckCardIndex(deckCatalogTypes, catalogQueries.map((q) => q.data)),
    [catalogQueries, deckCatalogTypes],
  );

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
      const slug = catalogSlugForDeckType(deckType);
      if (slug) map.set(slug, q.data ?? []);
    });
    return map;
  }, [catalogQueries, deckCatalogTypes]);

  const totalCards = countPlayableCards(cards);

  const koCtx = useMemo(
    () =>
      koCharacterIds.size > 0
        ? buildKoDimmingContext(cards, cardIndex, koCharacterIds)
        : null,
    [cards, cardIndex, koCharacterIds],
  );

  const drawHandKoCtx = useMemo(
    () => buildKoDimmingContext(cards, cardIndex, koCharacterIds),
    [cards, cardIndex, koCharacterIds],
  );

  const canDraw = useMemo(() => canDrawHand(cards), [cards]);

  useEffect(() => {
    if (!canDraw && drawHandOpen) {
      setDrawHandOpen(false);
      setDrawnCards([]);
    }
  }, [canDraw, drawHandOpen]);

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
    return CATALOG_TYPES.map((meta) => {
      const raw = map.get(meta.deckType) ?? [];
      const entries =
        meta.deckType === 'power' ? sortDeckPowerEntries(raw, cardIndex) : raw;
      return { meta, entries };
    }).filter((g) => g.entries.length > 0);
  }, [cards, cardIndex]);

  const immersiveOpen = addOpen || drawHandOpen || Boolean(selected);
  const deckTypeTabs = grouped;

  useEffect(() => {
    if (!isMobile || deckTypeTabs.length === 0) {
      setMobileDeckTypeTab(null);
      return;
    }
    setMobileDeckTypeTab((prev) =>
      resolveMobileDeckTypeTab(
        prev,
        deckTypeTabs.map((g) => g.meta.type),
      ),
    );
  }, [isMobile, deckTypeTabs]);

  const visibleGroups = useMemo(() => {
    if (!isMobile || deckViewMode === 'list') return grouped;
    if (deckTypeTabs.length === 0) return [];
    const type = mobileDeckTypeTab ?? deckTypeTabs[0].meta.type;
    const active = grouped.find((g) => g.meta.type === type);
    return active ? [active] : [deckTypeTabs[0]];
  }, [isMobile, deckViewMode, grouped, deckTypeTabs, mobileDeckTypeTab]);

  const scrollContainerRef = isMobile ? mainRef : contentRef;

  useEffect(() => {
    if (!isMobile) return;
    mainRef.current?.scrollTo({ top: 0 });
  }, [mobileDeckTypeTab, isMobile]);

  useEffect(() => {
    if (!isMobile || !mobileDeckTypeTab || !typeTabsRef.current) return;
    const activeTab = typeTabsRef.current.querySelector<HTMLElement>(
      `[data-deck-type="${mobileDeckTypeTab}"]`,
    );
    activeTab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [mobileDeckTypeTab, isMobile]);

  const goToRelativeDeckType = useCallback(
    (delta: 1 | -1) => {
      if (deckTypeTabs.length <= 1) return;
      const activeIndex = deckTypeTabs.findIndex((g) => g.meta.type === mobileDeckTypeTab);
      const idx = activeIndex >= 0 ? activeIndex : 0;
      const next = stepCyclicalIndex(idx, deckTypeTabs.length, delta);
      setMobileDeckTypeTab(deckTypeTabs[next].meta.type);
    },
    [deckTypeTabs, mobileDeckTypeTab],
  );

  useHorizontalSwipe({
    targetRef: scrollContainerRef,
    enabled:
      isMobile && deckViewMode === 'card' && !immersiveOpen && deckTypeTabs.length > 1,
    onSwipeLeft: () => goToRelativeDeckType(1),
    onSwipeRight: () => goToRelativeDeckType(-1),
  });

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

  const closeDrawHand = () => {
    setDrawHandOpen(false);
    setDrawnCards([]);
  };

  const handleBackToDecks = () => {
    if (selected) {
      closeCardDetail();
      return;
    }
    if (drawHandOpen) {
      closeDrawHand();
      return;
    }
    if (addOpen) {
      setAddOpen(false);
      return;
    }
    navigate(`/users/${user?.id ?? userId}/decks`);
  };

  const handleDrawHandToggle = () => {
    if (drawHandOpen) {
      closeDrawHand();
      return;
    }
    setDrawnCards(drawRandomHand(cards));
    setDrawHandOpen(true);
  };

  const handleViewModeToggle = () => {
    setDeckViewMode((prev) => {
      const next = prev === 'card' ? 'list' : 'card';
      persistDeckViewMode(next);
      return next;
    });
  };

  const handleDrawHandRedraw = () => {
    setDrawnCards(drawRandomHand(cards));
  };

  const handleDrawHandReorder = (fromIndex: number, toIndex: number) => {
    setDrawnCards((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
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
    const entry = cards.find((c) => c.instanceId === selected.instanceId);
    if (!entry) return;

    const deckType = CATALOG_TYPE_BY_SLUG[selected.type].deckType;
    const targetCard =
      cardIndex.get(`${deckType}:${printingId}`) ??
      cardIndex.get(`${normalizeDeckCardType(deckType)}:${printingId}`) ??
      cardIndex.get(printingId) ??
      (catalogBySlug.get(selected.type) ?? []).find((c) => c.id === printingId);
    if (!targetCard) return;

    const previousCardId = entry.cardId;
    const imagePath =
      (targetCard.image_path as string) || (targetCard.image as string) || undefined;

    setCards((prev) =>
      prev.map((c) =>
        c.instanceId === selected.instanceId
          ? {
              ...c,
              cardId: printingId,
              defaultImage: imagePath,
              is_foil: isFoilCard(targetCard),
              name: cardDisplayName(targetCard),
            }
          : c,
      ),
    );

    if (entry.type === 'character' && previousCardId !== printingId) {
      if (reserveCharacterId === previousCardId) {
        setReserveCharacterId(printingId);
      }
      setKoCharacterIds((prev) => {
        if (!prev.has(previousCardId)) return prev;
        const next = new Set(prev);
        next.delete(previousCardId);
        next.add(printingId);
        return next;
      });
    }

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
  const showMobileNav = isMobile && !immersiveOpen;
  const showMobileTypeTabs =
    isMobile && deckViewMode === 'card' && cards.length > 0 && deckTypeTabs.length > 1;

  return (
    <>
    <div className="deck-editor">
      {/* Left rail (desktop) */}
      <aside className="deck-editor__rail">
        <button type="button" className="deck-editor__rail-logo" onClick={() => navigate('/home')} aria-label="Home">
          <Logo variant="emblem" height={26} />
        </button>
        <nav className="deck-editor__rail-nav">
          <button type="button" onClick={() => navigate('/home')} title="Home"><IconHome /></button>
          <button type="button" onClick={() => navigate(`/users/${user?.id ?? userId}/decks`)} title="Decks"><IconDecks /></button>
          <button type="button" onClick={() => navigate(`/users/${user?.id ?? userId}/collection`)} title="Collection"><IconCollection /></button>
        </nav>
      </aside>

      <div className="deck-editor__main" ref={mainRef}>
        <header className="deck-editor__header">
          <div className="deck-editor__topbar">
            <div className="deck-editor__topbar-leading">
              <button type="button" className="deck-editor__back" onClick={handleBackToDecks} aria-label="Back to decks">
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
                <span className={`badge ${legality.valid ? 'badge-legal' : 'badge-not-legal'}`} title={legality.message}>
                  {legality.valid ? 'Legal' : 'Not Legal'}
                </span>
                {isMobile ? <DeckThreatStat totalThreat={totalThreat} /> : null}
              </div>
            </div>

            <DeckStatsPanel
              maxStats={maxStats}
              iconTotals={iconTotals}
              totalThreat={totalThreat}
              showThreatInPanel={!isMobile}
            />

            <div className="deck-editor__actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleViewModeToggle}
                title={deckViewMode === 'card' ? 'Switch to list view' : 'Switch to card view'}
              >
                {deckViewMode === 'card' ? (
                  <>
                    <IconList /> List View
                  </>
                ) : (
                  <>
                    <IconGrid /> Card View
                  </>
                )}
              </button>
              <button
                type="button"
                className={`btn btn-ghost${drawHandOpen ? ' is-active' : ''}`}
                disabled={!canDraw}
                title={
                  canDraw
                    ? 'Draw a random 8-card hand'
                    : 'Deck must contain at least 8 playable cards.'
                }
                onClick={handleDrawHandToggle}
              >
                <IconCards /> Draw Hand
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

        {showMobileTypeTabs ? (
          <div
            className="deck-editor__type-tabs"
            ref={typeTabsRef}
            role="tablist"
            aria-label="Deck card types"
          >
            {deckTypeTabs.map(({ meta, entries }) => (
              <button
                key={meta.type}
                type="button"
                role="tab"
                data-deck-type={meta.type}
                aria-selected={mobileDeckTypeTab === meta.type}
                className={`deck-editor__type ${mobileDeckTypeTab === meta.type ? 'is-active' : ''}`}
                onClick={() => setMobileDeckTypeTab(meta.type)}
              >
                {meta.shortLabel}
                <span className="deck-editor__type-count">{entries.length}</span>
              </button>
            ))}
          </div>
        ) : null}

        {/* Card list + draw hand overlay */}
        <div className="deck-editor__content" ref={contentRef}>
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
          ) : deckViewMode === 'list' ? (
            <DeckListView
              groups={visibleGroups}
              cardIndex={cardIndex}
              isMobile={isMobile}
              isOwner={isOwner}
              koCtx={koCtx}
              koCharacterIds={koCharacterIds}
              reserveCharacterId={reserveCharacterId}
              characterEntries={characterEntries}
              canSimulateKo={canSimulateKo}
              selectedInstanceId={selected?.instanceId ?? null}
              onSelectCard={selectDeckCard}
              onToggleKo={(cardId) =>
                setKoCharacterIds((prev) => toggleKoCharacterId(prev, cardId))
              }
              onSelectReserve={selectReserveCharacter}
              onDeselectReserve={deselectReserveCharacter}
            />
          ) : (
            visibleGroups.map(({ meta, entries }) => (
              <section className="deck-editor__group" key={meta.type}>
                {!showMobileTypeTabs ? (
                  <h2 className="deck-editor__group-title">
                    {meta.label}
                    <span className="deck-editor__group-count">{entries.length}</span>
                  </h2>
                ) : null}
                <div
                  className={`deck-editor__cards${
                    isLandscapeCatalogType(meta.type) ? ' deck-editor__cards--landscape' : ''
                  }`}
                >
                  {entries.map((entry) => {
                    const catalogCard = resolveDeckCatalogCard(entry, cardIndex);
                    const imagePath =
                      entry.defaultImage ||
                      (catalogCard?.image_path as string | undefined) ||
                      (catalogCard?.image as string | undefined);
                    const cardName = deckCardDisplayName(entry, cardIndex);
                    const catalogType = catalogSlugForDeckType(entry.type);
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
                            progressive={deckEditorUsesThumbnail(catalogType)}
                            progressiveSessionScope="deck-editor"
                            loading="eager"
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

          <DrawHandPanel
            open={drawHandOpen}
            drawnCards={drawnCards}
            cardIndex={cardIndex}
            koCtx={drawHandKoCtx}
            onRedraw={handleDrawHandRedraw}
            onClose={closeDrawHand}
            onReorder={handleDrawHandReorder}
            onCardClick={selectDeckCard}
          />
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
        onClose={closeCardDetail}
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
    {showMobileNav ? <MobileBottomNav /> : null}
    </>
  );
}
