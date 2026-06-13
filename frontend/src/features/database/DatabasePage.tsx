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
  compareCatalogCards,
  isLandscapeCatalogType,
  metaForDeckType,
  CATALOG_TYPE_BY_SLUG,
  type CatalogTabSelection,
} from '../../lib/catalog/catalogTypeMap';
import { compareAllCatalogCards } from '../../lib/catalog/allCatalogSort';
import { useAllCatalogCards } from '../../lib/catalog/useAllCatalogCards';
import { buildSetNameLookup, resolveSetDisplayName } from '../../lib/catalog/setNames';
import { useCollection } from '../../lib/collection/useCollection';
import { CardTile } from '../../components/CardTile';
import { CardDetailPanel } from '../../components/CardDetailPanel';
import { CatalogAllList } from '../../components/CatalogAllList';
import { Pagination } from '../../components/Pagination';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { useLayoutMode } from '../../lib/layout/LayoutModeProvider';
import { IconSearch, IconPlus, IconLock, IconDatabase } from '../../components/icons';
import { clearProgressiveImageSession } from '../../lib/images/progressiveImageLoad';
import type { CatalogCard, CatalogType } from '../../lib/api/types';
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
    result.sort((a, b) => compareCatalogCards(a, b, catalogType));
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
  const detailCollectionType = CATALOG_TYPE_BY_SLUG[activeCatalogType].collectionType;

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
                setSelectedCatalogType(meta.type);
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
        type={activeCatalogType}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        hasFoil={selected ? cardHasFoilVersion(selected, foilLookup.baseToFoil) : undefined}
        setDisplayName={selected ? resolveSetDisplayName(selected.set, setNameLookup) : undefined}
        actions={
          selected ? (
            <div className="db__detail-actions">
              <AddToDeck card={selected} type={activeCatalogType} />
              <button
                type="button"
                className="btn btn-secondary db__add-collection"
                onClick={() =>
                  void collection.setQuantity(
                    selected,
                    detailCollectionType,
                    collection.quantityFor(selected.id, detailCollectionType) + 1,
                  )
                }
              >
                <IconPlus /> Collection
              </button>
            </div>
          ) : null
        }
      />

    </div>
  );
}

/**
 * + Deck control. Per product rules, this is disabled for GUEST (with the
 * "log in to add to decks" message). For logged-in users it lists their decks
 * and adds the card via POST /api/v1/decks/:id/cards.
 */
function AddToDeck({ card, type }: { card: CatalogCard; type: CatalogType }) {
  const { isGuest, user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const decksQuery = useQuery({
    queryKey: ['decks', 'mine', user?.id],
    queryFn: () => fetchUserDecks(),
    enabled: open && !isGuest,
  });

  if (isGuest) {
    return (
      <div className="db__add-deck-wrap">
        <button type="button" className="btn btn-secondary db__add-deck" disabled title="Log in to add to decks">
          <IconLock /> Log in to add to decks
        </button>
      </div>
    );
  }

  const deckType = CATALOG_TYPE_BY_SLUG[type]?.deckType ?? metaForDeckType(type)?.deckType ?? type;

  const add = async (deckId: string, deckName: string) => {
    setStatus(null);
    try {
      await addCardToDeck(deckId, { cardType: deckType, cardId: card.id, quantity: 1 });
      setStatus(`Added to ${deckName}`);
      queryClient.invalidateQueries({ queryKey: ['decks'] });
    } catch (err) {
      setStatus((err as Error)?.message || 'Could not add card');
    }
  };

  return (
    <div className="db__add-deck-wrap">
      <button type="button" className="btn btn-primary db__add-deck" onClick={() => setOpen((o) => !o)}>
        <IconPlus /> Add to Deck
      </button>
      {open ? (
        <div className="db__deck-menu">
          {decksQuery.isLoading ? (
            <div className="db__deck-menu-empty">Loading decks...</div>
          ) : (decksQuery.data ?? []).length === 0 ? (
            <div className="db__deck-menu-empty">You have no decks yet.</div>
          ) : (
            (decksQuery.data ?? []).map((d) => (
              <button key={d.metadata.id} type="button" className="db__deck-menu-item" onClick={() => add(d.metadata.id, d.metadata.name)}>
                {d.metadata.name}
              </button>
            ))
          )}
        </div>
      ) : null}
      {status ? <div className="db__add-status">{status}</div> : null}
    </div>
  );
}
