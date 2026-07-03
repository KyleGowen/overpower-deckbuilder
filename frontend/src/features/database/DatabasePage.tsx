import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../app/AuthProvider';
import { fetchCatalog, fetchFoilCardMap, fetchSets } from '../../lib/api/catalog';
import {
  buildFoilCardMapLookup,
  cardHasFoilVersion,
  dedupeFoilCatalogCards,
  isFoilCard,
  matchesHasFoilFilter,
} from '../../lib/catalog/foilCatalog';
import { fetchUserDecks, addCardToDeck } from '../../lib/api/decks';
import {
  CATALOG_TYPES,
  DBV_TAB_ORDER,
  cardMatchesSearchQuery,
  compareDbvCatalogCards,
  isLandscapeCatalogType,
  metaForDeckType,
  CATALOG_TYPE_BY_SLUG,
  type DbvTabSelection,
} from '../../lib/catalog/catalogTypeMap';
import { compareAllCatalogCards } from '../../lib/catalog/allCatalogSort';
import { resolveDefaultCardForDeckAdd } from '../../lib/catalog/defaultCatalogCards';
import { collectPrintingsForCard } from '../../lib/catalog/cardPrintings';
import type { FoilCardMapLookup } from '../../lib/catalog/foilCatalog';
import { useAllCatalogCards } from '../../lib/catalog/useAllCatalogCards';
import { buildSetNameLookup, resolveSetDisplayName } from '../../lib/catalog/setNames';
import { useCollection, type UseCollectionResult } from '../../lib/collection/useCollection';
import { CardTile } from '../../components/CardTile';
import { CardDetailPanel } from '../../components/CardDetailPanel';
import { CatalogAllList } from '../../components/CatalogAllList';
import { Pagination } from '../../components/Pagination';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { useLayoutMode } from '../../lib/layout/LayoutModeProvider';
import { stepCyclicalIndex } from '../../lib/layout/cyclicalIndex';
import { DBV_SWIPE_BLOCK_SELECTOR, useHorizontalSwipe } from '../../lib/layout/useHorizontalSwipe';
import { useCardDetailHistory } from '../../lib/layout/useCardDetailHistory';
import { IconSearch, IconPlus, IconLock, IconDatabase } from '../../components/icons';
import { clearProgressiveImageSession } from '../../lib/images/progressiveImageLoad';
import type { CatalogCard, CatalogType, CollectionCardType } from '../../lib/api/types';
import { DbvFilterRail } from './components/DbvFilterRail';
import { cardMatchesDbvFilters } from './filters/dbvFilterPredicates';
import { useDbvFilters } from './filters/useDbvFilters';
import './DatabasePage.css';

const PAGE_SIZE_GRID = 24;
const PAGE_SIZE_ALL = 48;

function useDebounced<T>(value: T, delay = 250): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function DatabasePage() {
  const { isMobile } = useLayoutMode();
  const collection = useCollection();
  const dbRef = useRef<HTMLDivElement>(null);
  const typeTabsRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<DbvTabSelection>('characters');
  const [search, setSearch] = useState('');
  const [setFilter, setSetFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CatalogCard | null>(null);
  const [selectedCatalogType, setSelectedCatalogType] = useState<CatalogType>('characters');
  const [filterRailCollapsed, setFilterRailCollapsed] = useState(false);
  const [hasFoilFilter, setHasFoilFilter] = useState(false);

  const { close: closeCardDetail } = useCardDetailHistory(Boolean(selected), () => setSelected(null));

  const isAllTab = tab === 'all';
  const pageSize = isAllTab ? PAGE_SIZE_ALL : PAGE_SIZE_GRID;
  const activeCatalogType = isAllTab ? selectedCatalogType : tab;
  /** Pin catalog/deck type to the selected card so tab switches cannot miscategorize adds. */
  const detailCatalogType = selected ? selectedCatalogType : activeCatalogType;

  const debouncedSearch = useDebounced(search);
  const dbvFilters = useDbvFilters(isAllTab ? 'characters' : tab);

  const catalogQuery = useQuery({
    queryKey: ['catalog', tab],
    queryFn: () => fetchCatalog(tab as CatalogType),
    enabled: !isAllTab,
    staleTime: 30 * 60 * 1000,
  });
  const setsQuery = useQuery({ queryKey: ['sets'], queryFn: () => fetchSets(), staleTime: 60 * 60 * 1000 });
  const foilMapQuery = useQuery({
    queryKey: ['foil-card-map'],
    queryFn: () => fetchFoilCardMap(),
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

  const allCatalogQuery = useAllCatalogCards({
    enabled: isAllTab,
    foilToBase: foilLookup.foilToBase,
  });

  const detailTypeCatalogQuery = useQuery({
    queryKey: ['catalog', detailCatalogType],
    queryFn: () => fetchCatalog(detailCatalogType),
    enabled: Boolean(selected),
    staleTime: 30 * 60 * 1000,
  });

  const detailTypeCatalogCards = detailTypeCatalogQuery.data ?? [];

  const detailPrintingRows = useMemo(() => {
    if (!selected) return undefined;
    const printings = collectPrintingsForCard(
      selected,
      detailCatalogType,
      detailTypeCatalogCards,
      foilLookup,
      (set) => resolveSetDisplayName(set, setNameLookup) ?? String(set ?? ''),
    );
    if (printings.length <= 1) return undefined;
    return printings.map((printing) => ({
      card: printing,
      setDisplayName: resolveSetDisplayName(printing.set, setNameLookup) ?? String(printing.set ?? ''),
      setNumber: printing.set_number ? String(printing.set_number) : null,
      isCurrent: printing.id === selected.id,
    }));
  }, [selected, detailCatalogType, detailTypeCatalogCards, foilLookup, setNameLookup]);

  const viewPrintingInDetail = useCallback(
    (printingId: string) => {
      const printing = detailTypeCatalogCards.find((c) => c.id === printingId);
      if (printing) setSelected(printing);
    },
    [detailTypeCatalogCards],
  );

  const perTypeCards = useMemo(
    () => dedupeFoilCatalogCards(catalogQuery.data ?? [], foilLookup.foilToBase),
    [catalogQuery.data, foilLookup.foilToBase],
  );

  const gridFiltered = useMemo(() => {
    if (isAllTab) return [];
    const q = debouncedSearch.trim().toLowerCase();
    const catalogType = tab;
    const result = perTypeCards.filter((c) => {
      if (q && !cardMatchesSearchQuery(c, q)) return false;
      if (setFilter && String(c.set ?? '') !== setFilter) return false;
      if (!cardMatchesDbvFilters(c, catalogType, dbvFilters.state)) return false;
      if (!matchesHasFoilFilter(c, foilLookup.baseToFoil, hasFoilFilter)) return false;
      return true;
    });
    result.sort((a, b) => compareDbvCatalogCards(a, b, catalogType));
    return result;
  }, [perTypeCards, debouncedSearch, setFilter, tab, dbvFilters.state, hasFoilFilter, foilLookup.baseToFoil, isAllTab]);

  const allTabFiltered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    const result = allCatalogQuery.cards.filter(({ card }) => {
      if (q && !cardMatchesSearchQuery(card, q)) return false;
      if (setFilter && String(card.set ?? '') !== setFilter) return false;
      return true;
    });
    result.sort((a, b) => compareAllCatalogCards(a.card, b.card));
    return result;
  }, [allCatalogQuery.cards, debouncedSearch, setFilter]);

  const filtered = isAllTab ? allTabFiltered : gridFiltered;

  useEffect(() => {
    setPage(1);
  }, [tab, debouncedSearch, setFilter, dbvFilters.state, hasFoilFilter]);

  useEffect(() => () => clearProgressiveImageSession('database'), []);

  const goToRelativeTab = useCallback(
    (delta: 1 | -1) => {
      const idx = DBV_TAB_ORDER.indexOf(tab);
      const next = DBV_TAB_ORDER[stepCyclicalIndex(idx >= 0 ? idx : 0, DBV_TAB_ORDER.length, delta)];
      setTab(next);
      if (!selected && next !== 'all') {
        setSelectedCatalogType(next);
      }
    },
    [tab, selected],
  );

  useHorizontalSwipe({
    targetRef: dbRef,
    enabled: isMobile && !selected,
    blockSelector: DBV_SWIPE_BLOCK_SELECTOR,
    onSwipeLeft: () => goToRelativeTab(1),
    onSwipeRight: () => goToRelativeTab(-1),
  });

  useEffect(() => {
    if (!isMobile) return;
    window.scrollTo({ top: 0 });
  }, [tab, isMobile]);

  useEffect(() => {
    if (!isMobile || !typeTabsRef.current) return;
    const activeTab = typeTabsRef.current.querySelector<HTMLElement>(`[data-db-tab="${tab}"]`);
    activeTab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [tab, isMobile]);

  const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  const effectivePage = Math.min(page, maxPage);
  const pageStart = (effectivePage - 1) * pageSize;
  const pageGridCards = isAllTab ? [] : gridFiltered.slice(pageStart, pageStart + pageSize);
  const pageAllItems = isAllTab ? allTabFiltered.slice(pageStart, pageStart + pageSize) : [];

  const isLoading = isAllTab ? allCatalogQuery.isLoading : catalogQuery.isLoading;
  const isError = isAllTab ? allCatalogQuery.isError : catalogQuery.isError;
  const detailCollectionType = CATALOG_TYPE_BY_SLUG[detailCatalogType].collectionType;

  const selectCard = (card: CatalogCard, catalogType: CatalogType) => {
    setSelected(card);
    setSelectedCatalogType(catalogType);
  };

  return (
    <div className="db" ref={dbRef}>
      <div className="db__inner">
        <header className="db__header">
          <h1 className="db__title"><IconDatabase /> Card Database</h1>
          <div className="db__header-controls">
            <div className="db__search">
              <IconSearch className="db__search-icon" />
              <input
                type="search"
                placeholder="Search name, character, or card text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search cards"
              />
            </div>
            <div className="db__set">
              <label className="sr-only" htmlFor="db-set-filter">Set</label>
              <select
                id="db-set-filter"
                value={setFilter}
                onChange={(e) => setSetFilter(e.target.value)}
                aria-label="Filter by set"
              >
                <option value="">All sets</option>
                {(setsQuery.data ?? []).map((s) => (
                  <option key={s.code} value={s.code}>{s.name || s.code}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="db__types" ref={typeTabsRef} role="tablist" aria-label="Card types">
          <button
            type="button"
            role="tab"
            aria-selected={isAllTab}
            className={`db__type ${isAllTab ? 'is-active' : ''}`}
            data-db-tab="all"
            onClick={() => setTab('all')}
          >
            All
          </button>
          {CATALOG_TYPES.map((meta) => (
            <button
              key={meta.type}
              type="button"
              role="tab"
              aria-selected={tab === meta.type}
              className={`db__type ${tab === meta.type ? 'is-active' : ''}`}
              data-db-tab={meta.type}
              onClick={() => {
                setTab(meta.type);
                if (!selected) {
                  setSelectedCatalogType(meta.type);
                }
              }}
            >
              {isMobile ? meta.shortLabel : meta.label}
            </button>
          ))}
        </div>

        {!isError && !isAllTab ? (
          <DbvFilterRail
            catalogType={tab}
            filters={dbvFilters}
            allCards={perTypeCards}
            collapsed={filterRailCollapsed}
            onCollapsedChange={setFilterRailCollapsed}
            hasFoilFilter={hasFoilFilter}
            onHasFoilFilterChange={setHasFoilFilter}
          />
        ) : null}

        {isLoading ? (
          <LoadingState label="Loading cards..." />
        ) : isError ? (
          <EmptyState variant="error" title="Couldn't load cards" message="Please try again." icon={<IconDatabase />} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No cards found" message="Try adjusting your search or filters." icon={<IconSearch />} />
        ) : isAllTab ? (
          <>
            <CatalogAllList
              items={pageAllItems}
              selectedId={selected?.id}
              onSelect={(item) => selectCard(item.card, item.catalogType)}
              setNameLookup={setNameLookup}
            />
            <Pagination page={page} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} />
          </>
        ) : (
          <>
            <div className={`db__grid ${isLandscapeCatalogType(tab) ? 'db__grid--landscape' : 'db__grid--portrait'}`}>
              {pageGridCards.map((card) => (
                <CardTile
                  key={card.id}
                  card={card}
                  catalogType={tab}
                  hasFoilVersion={cardHasFoilVersion(card, foilLookup.baseToFoil)}
                  showFoilEffect={false}
                  onClick={() => selectCard(card, tab)}
                />
              ))}
            </div>
            <Pagination page={page} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} />
          </>
        )}
      </div>

      <CardDetailPanel
        card={selected}
        type={detailCatalogType}
        open={Boolean(selected)}
        onClose={closeCardDetail}
        hasFoil={selected ? cardHasFoilVersion(selected, foilLookup.baseToFoil) : undefined}
        isFoil={selected ? isFoilCard(selected) : undefined}
        setDisplayName={selected ? resolveSetDisplayName(selected.set, setNameLookup) : undefined}
        printings={detailPrintingRows}
        onApplyPrinting={viewPrintingInDetail}
        actions={
          selected ? (
            <DbDetailActions
              card={selected}
              type={detailCatalogType}
              collectionType={detailCollectionType}
              collection={collection}
              catalogCards={detailTypeCatalogCards}
              foilLookup={foilLookup}
            />
          ) : null
        }
      />

    </div>
  );
}

/**
 * Slide-out action row: fixed pill buttons + shared panel for deck picker and feedback.
 * Per product rules, +Deck is disabled for GUEST (see GUEST_DECK_LESSONS_LEARNED.md).
 */
type ActionStatus = { kind: 'success' | 'error'; message: string };

function DbDetailActions({
  card,
  type,
  collectionType,
  collection,
  catalogCards,
  foilLookup,
}: {
  card: CatalogCard;
  type: CatalogType;
  collectionType: CollectionCardType;
  collection: UseCollectionResult;
  catalogCards: CatalogCard[];
  foilLookup: FoilCardMapLookup;
}) {
  const { isGuest, user } = useAuth();
  const queryClient = useQueryClient();
  const [deckMenuOpen, setDeckMenuOpen] = useState(false);
  const [status, setStatus] = useState<ActionStatus | null>(null);

  const decksQuery = useQuery({
    queryKey: ['decks', 'mine', user?.id],
    queryFn: () => fetchUserDecks(),
    enabled: deckMenuOpen && !isGuest,
  });

  useEffect(() => {
    setDeckMenuOpen(false);
    setStatus(null);
  }, [card.id, collectionType]);

  const deckType = CATALOG_TYPE_BY_SLUG[type]?.deckType ?? metaForDeckType(type)?.deckType ?? type;

  const toggleDeckMenu = () => {
    setStatus(null);
    setDeckMenuOpen((open) => !open);
  };

  const addToDeck = async (deckId: string, deckName: string) => {
    setStatus(null);
    try {
      const resolved = resolveDefaultCardForDeckAdd(card, type, catalogCards, foilLookup);
      await addCardToDeck(deckId, { cardType: deckType, cardId: resolved.id, quantity: 1 });
      setStatus({ kind: 'success', message: `Added to ${deckName}` });
      queryClient.invalidateQueries({ queryKey: ['decks'] });
    } catch (err) {
      setStatus({ kind: 'error', message: (err as Error)?.message || 'Could not add card' });
    }
  };

  const addToCollection = async () => {
    setDeckMenuOpen(false);
    setStatus(null);
    try {
      const next = collection.quantityFor(card.id, collectionType) + 1;
      await collection.setQuantity(card, collectionType, next);
      setStatus({ kind: 'success', message: 'Added to collection' });
    } catch (err) {
      setStatus({ kind: 'error', message: (err as Error)?.message || 'Could not add to collection' });
    }
  };

  const showPanel = deckMenuOpen || status !== null;

  return (
    <div className="db__detail-actions">
      <div className="db__detail-actions-row">
        {isGuest ? (
          <button type="button" className="btn btn-ghost db__add-deck" disabled title="Log in to add to decks">
            <IconLock /> Log in to add to decks
          </button>
        ) : (
          <button type="button" className="btn btn-ghost db__add-deck" onClick={toggleDeckMenu}>
            <IconPlus /> Add to Deck
          </button>
        )}
        <button type="button" className="btn btn-ghost db__add-collection" onClick={() => void addToCollection()}>
          <IconPlus /> Collection
        </button>
      </div>
      {showPanel ? (
        <div className="db__detail-actions-panel">
          {deckMenuOpen && !isGuest ? (
            <div className="db__deck-menu">
              {decksQuery.isLoading ? (
                <div className="db__deck-menu-empty">Loading decks...</div>
              ) : (decksQuery.data ?? []).length === 0 ? (
                <div className="db__deck-menu-empty">You have no decks yet.</div>
              ) : (
                (decksQuery.data ?? []).map((d) => (
                  <button
                    key={d.metadata.id}
                    type="button"
                    className="db__deck-menu-item"
                    onClick={() => void addToDeck(d.metadata.id, d.metadata.name)}
                  >
                    {d.metadata.name}
                  </button>
                ))
              )}
            </div>
          ) : null}
          {status ? (
            <div className={`db__add-status${status.kind === 'error' ? ' db__add-status--error' : ''}`}>
              {status.message}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
