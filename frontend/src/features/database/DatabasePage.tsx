import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../app/AuthProvider';
import { fetchCatalog, fetchFoilCardMap, fetchSets } from '../../lib/api/catalog';
import {
  buildFoilCardMapLookup,
  cardHasFoilVersion,
  dedupeFoilCatalogCards,
} from '../../lib/catalog/foilCatalog';
import { fetchUserDecks, addCardToDeck } from '../../lib/api/decks';
import {
  CATALOG_TYPES,
  cardMatchesSearchQuery,
  compareDbvCatalogCards,
  isLandscapeCatalogType,
  metaForDeckType,
  CATALOG_TYPE_BY_SLUG,
  type CatalogTabSelection,
} from '../../lib/catalog/catalogTypeMap';
import { compareAllCatalogCards } from '../../lib/catalog/allCatalogSort';
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
  const [tab, setTab] = useState<CatalogTabSelection>('characters');
  const [search, setSearch] = useState('');
  const [setFilter, setSetFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CatalogCard | null>(null);
  const [selectedCatalogType, setSelectedCatalogType] = useState<CatalogType>('characters');
  const [filterRailCollapsed, setFilterRailCollapsed] = useState(false);

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
      return true;
    });
    result.sort((a, b) => compareDbvCatalogCards(a, b, catalogType));
    return result;
  }, [perTypeCards, debouncedSearch, setFilter, tab, dbvFilters.state, isAllTab]);

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
  }, [tab, debouncedSearch, setFilter, dbvFilters.state]);

  useEffect(() => () => clearProgressiveImageSession('database'), []);

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
    <div className="db">
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

        <div className="db__types" role="tablist" aria-label="Card types">
          <button
            type="button"
            role="tab"
            aria-selected={isAllTab}
            className={`db__type ${isAllTab ? 'is-active' : ''}`}
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
        onClose={() => setSelected(null)}
        hasFoil={selected ? cardHasFoilVersion(selected, foilLookup.baseToFoil) : undefined}
        setDisplayName={selected ? resolveSetDisplayName(selected.set, setNameLookup) : undefined}
        actions={
          selected ? (
            <DbDetailActions
              card={selected}
              type={detailCatalogType}
              collectionType={detailCollectionType}
              collection={collection}
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
}: {
  card: CatalogCard;
  type: CatalogType;
  collectionType: CollectionCardType;
  collection: UseCollectionResult;
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
      await addCardToDeck(deckId, { cardType: deckType, cardId: card.id, quantity: 1 });
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
