import { useEffect, useMemo, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { fetchCatalog, fetchFoilCardMap, fetchSets } from '../../lib/api/catalog';
import {
  CATALOG_TYPES,
  CATALOG_TYPE_BY_SLUG,
  type CatalogTabSelection,
} from '../../lib/catalog/catalogTypeMap';
import {
  prepareAddCardsCatalogList,
  qtyInDeckForRepresentative,
} from '../../lib/catalog/defaultCatalogCards';
import { buildFoilCardMapLookup } from '../../lib/catalog/foilCatalog';
import { useAllCatalogCards } from '../../lib/catalog/useAllCatalogCards';
import { CardTile } from '../../components/CardTile';
import { Pagination } from '../../components/Pagination';
import { SlideOutPanel } from '../../components/SlideOutPanel';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { IconSearch, IconPlus, IconCheck, IconClose } from '../../components/icons';
import type { CatalogCard, CatalogType, DeckCardEntry } from '../../lib/api/types';
import {
  ADD_CARDS_STACKS_PAGE_SIZE,
  buildCharacterStacks,
  stackCardsInAddOrder,
  stackTotalCardCount,
  type CharacterStack,
  type StackCardEntry,
} from '../../lib/catalog/characterStacks';
import { CharacterStackRow } from './CharacterStackRow';
import { MissionSetRow } from './MissionSetRow';
import {
  ADD_CARDS_MISSION_SETS_PAGE_SIZE,
  buildMissionSets,
  countDeckMissions,
  missionSetCardsInAddOrder,
  type MissionSet,
} from '../../lib/catalog/missionSets';
import { useLayoutMode } from '../../lib/layout/LayoutModeProvider';
import {
  addCardsGridClassName,
  addCardsPageSizeAll,
  addCardsPageSizeForType,
  flattenAddCardsSections,
  groupAllCatalogByType,
  groupPageItemsByType,
  paginateItems,
} from './addCardsCatalog';
import {
  buildAddCardsSectionsWithOptions,
  filterAndSortTypeCardsWithOptions,
  filterCharacterStacksWithOptions,
  filterMissionSetsWithOptions,
  type AddCardsFilterOptions,
} from './addCardsFilters';
import { AddCardsFilterBar } from './AddCardsFilterBar';
import { buildDeckUsabilityContext, effectiveHideUnusablesForTab, tabSupportsHideUnusables } from '../../lib/deck-usability';

const STACK_CATALOG_TYPES = ['characters', 'special-cards', 'advanced-universe'] as const;

/** Catalog slugs needed for hide-unusable deck context when tab-scoped data is incomplete. */
const DECK_USABILITY_CONTEXT_TYPES = ['characters', 'missions', 'locations'] as const;

const ADD_CARDS_SEARCH_PLACEHOLDER = 'Search name, character, or card text...';
const STACKS_SEARCH_PLACEHOLDER = 'Search character names...';
const ADD_CARDS_SEARCH_ARIA_LABEL = 'Search cards to add';
const STACKS_SEARCH_ARIA_LABEL = 'Search character names';

function useDebounced<T>(value: T, delay = 250): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export interface AddCardsPanelProps {
  open: boolean;
  onClose: () => void;
  onAdd: (card: CatalogCard, type: CatalogType) => void;
  onAddStack: (entries: StackCardEntry[]) => void;
  cards: DeckCardEntry[];
  /** Resolved catalog rows for deck cards (`${deckType}:${cardId}`), from DeckEditorPage. */
  deckCatalogIndex?: Map<string, CatalogCard>;
}

function cardTileOverlay(inDeck: number) {
  if (inDeck > 0) {
    return (
      <span className="add-cards__badge">
        <IconCheck /> {inDeck}
      </span>
    );
  }
  return (
    <span className="add-cards__add">
      <IconPlus />
    </span>
  );
}

export function AddCardsPanel({
  open,
  onClose,
  onAdd,
  onAddStack,
  cards,
  deckCatalogIndex,
}: AddCardsPanelProps) {
  const { isMobile } = useLayoutMode();
  const [tab, setTab] = useState<CatalogTabSelection>('all');
  const [search, setSearch] = useState('');
  const [setFilter, setSetFilter] = useState('');
  const [hideUnusables, setHideUnusables] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search);

  const isAllTab = tab === 'all';
  const isStacksTab = tab === 'stacks';
  const isMissionsTab = tab === 'missions';
  const activeType = isAllTab || isStacksTab ? null : tab;

  useEffect(() => {
    if (open) {
      setTab('all');
      setSearch('');
      setSetFilter('');
      setHideUnusables(false);
      setPage(1);
    }
  }, [open]);

  useEffect(() => {
    setPage(1);
  }, [tab, debouncedSearch, setFilter, hideUnusables]);

  const foilMapQuery = useQuery({
    queryKey: ['foil-card-map'],
    queryFn: () => fetchFoilCardMap(),
    enabled: open,
    staleTime: 60 * 60 * 1000,
  });

  const setsQuery = useQuery({
    queryKey: ['dbv-sets'],
    queryFn: () => fetchSets(),
    enabled: open,
    staleTime: 60 * 60 * 1000,
  });

  const foilLookup = useMemo(
    () => buildFoilCardMapLookup(foilMapQuery.data ?? []),
    [foilMapQuery.data],
  );

  const allCatalogQuery = useAllCatalogCards({ enabled: open && isAllTab });

  const catalogQuery = useQuery({
    queryKey: ['catalog', activeType],
    queryFn: () => fetchCatalog(activeType!),
    enabled: open && !isAllTab && !isStacksTab && activeType !== null,
    staleTime: 30 * 60 * 1000,
  });

  const stackCatalogQueries = useQueries({
    queries: STACK_CATALOG_TYPES.map((type) => ({
      queryKey: ['catalog', type] as const,
      queryFn: () => fetchCatalog(type),
      enabled: open && isStacksTab,
      staleTime: 30 * 60 * 1000,
    })),
  });

  const usabilityContextCatalogQueries = useQueries({
    queries: DECK_USABILITY_CONTEXT_TYPES.map((type) => ({
      queryKey: ['catalog', type] as const,
      queryFn: () => fetchCatalog(type),
      enabled: open,
      staleTime: 30 * 60 * 1000,
    })),
  });

  const usabilityCatalogByType = useMemo(() => {
    const byType: Partial<Record<CatalogType, CatalogCard[]>> = {};
    DECK_USABILITY_CONTEXT_TYPES.forEach((type, i) => {
      const data = usabilityContextCatalogQueries[i]?.data;
      if (data && data.length > 0) {
        byType[type] = data;
      }
    });
    return byType;
  }, [usabilityContextCatalogQueries]);

  const { cardsByType, variantLookupByType } = useMemo(() => {
    const variantLookupByType = new Map<CatalogType, Map<string, string[]>>();

    if (isStacksTab) {
      const charactersRaw = stackCatalogQueries[0]?.data ?? [];
      const specialsRaw = stackCatalogQueries[1]?.data ?? [];
      const uaRaw = stackCatalogQueries[2]?.data ?? [];

      const characters = prepareAddCardsCatalogList(
        charactersRaw,
        'characters',
        foilLookup.foilToBase,
      );
      const specials = prepareAddCardsCatalogList(
        specialsRaw,
        'special-cards',
        foilLookup.foilToBase,
      );
      const advancedUniverse = prepareAddCardsCatalogList(
        uaRaw,
        'advanced-universe',
        foilLookup.foilToBase,
      );

      variantLookupByType.set('characters', characters.variantIdsByRepresentative);
      variantLookupByType.set('special-cards', specials.variantIdsByRepresentative);
      variantLookupByType.set('advanced-universe', advancedUniverse.variantIdsByRepresentative);

      return {
        cardsByType: {
          characters: characters.cards,
          'special-cards': specials.cards,
          'advanced-universe': advancedUniverse.cards,
        } as Partial<Record<CatalogType, CatalogCard[]>>,
        variantLookupByType,
      };
    }

    if (isAllTab) {
      const rawByType = groupAllCatalogByType(allCatalogQuery.cards);
      const dedupedByType: Partial<Record<CatalogType, CatalogCard[]>> = {};
      for (const meta of CATALOG_TYPES) {
        const raw = rawByType[meta.type] ?? [];
        if (raw.length === 0) continue;
        const prepared = prepareAddCardsCatalogList(raw, meta.type, foilLookup.foilToBase);
        dedupedByType[meta.type] = prepared.cards;
        variantLookupByType.set(meta.type, prepared.variantIdsByRepresentative);
      }
      return { cardsByType: dedupedByType, variantLookupByType };
    }

    if (activeType) {
      const prepared = prepareAddCardsCatalogList(
        catalogQuery.data ?? [],
        activeType,
        foilLookup.foilToBase,
      );
      variantLookupByType.set(activeType, prepared.variantIdsByRepresentative);
      return {
        cardsByType: { [activeType]: prepared.cards } as Partial<Record<CatalogType, CatalogCard[]>>,
        variantLookupByType,
      };
    }

    return { cardsByType: {} as Partial<Record<CatalogType, CatalogCard[]>>, variantLookupByType };
  }, [
    isAllTab,
    isStacksTab,
    activeType,
    allCatalogQuery.cards,
    catalogQuery.data,
    stackCatalogQueries,
    foilLookup.foilToBase,
  ]);

  const usabilityCtx = useMemo(
    () =>
      buildDeckUsabilityContext(cards, usabilityCatalogByType, {
        deckCatalogIndex,
      }),
    [cards, usabilityCatalogByType, deckCatalogIndex],
  );

  const effectiveHideUnusables = effectiveHideUnusablesForTab(tab, hideUnusables);

  const filterOptions: AddCardsFilterOptions = useMemo(
    () => ({
      searchQuery: debouncedSearch,
      setFilter,
      hideUnusables: effectiveHideUnusables,
      usabilityCtx,
    }),
    [debouncedSearch, setFilter, effectiveHideUnusables, usabilityCtx],
  );

  const hideUnusablesDisabled = !tabSupportsHideUnusables(tab);
  const hideUnusablesDisabledReason = isStacksTab
    ? 'Not available on the Stacks tab'
    : isMissionsTab
      ? 'Not available on the Missions tab'
      : hideUnusablesDisabled
        ? 'Not available for this card type'
        : undefined;

  const characterStacks = useMemo(() => {
    if (!isStacksTab) return [];
    return buildCharacterStacks({
      characters: cardsByType.characters ?? [],
      specials: cardsByType['special-cards'] ?? [],
      advancedUniverse: cardsByType['advanced-universe'] ?? [],
    });
  }, [isStacksTab, cardsByType]);

  const filteredStacks = useMemo(
    () =>
      filterCharacterStacksWithOptions(characterStacks, filterOptions, {
        characterNameSearchOnly: true,
      }),
    [characterStacks, filterOptions],
  );

  const allSections = useMemo(
    () => buildAddCardsSectionsWithOptions(cardsByType, filterOptions),
    [cardsByType, filterOptions],
  );

  const allFlat = useMemo(() => flattenAddCardsSections(allSections), [allSections]);

  const typeList = useMemo(() => {
    if (isAllTab || isStacksTab || isMissionsTab || !activeType) return [];
    return filterAndSortTypeCardsWithOptions(
      cardsByType[activeType] ?? [],
      activeType,
      filterOptions,
    );
  }, [isAllTab, isStacksTab, isMissionsTab, activeType, cardsByType, filterOptions]);

  const missionSets = useMemo(() => {
    if (!isMissionsTab) return [];
    return buildMissionSets(cardsByType.missions ?? []);
  }, [isMissionsTab, cardsByType.missions]);

  const filteredMissionSets = useMemo(
    () =>
      filterMissionSetsWithOptions(missionSets, filterOptions, {
        missionSetNameSearch: true,
      }),
    [missionSets, filterOptions],
  );

  const deckMissionCount = useMemo(() => countDeckMissions(cards), [cards]);
  const missionLimitReached = deckMissionCount >= 7;

  const pageSize = isStacksTab
    ? ADD_CARDS_STACKS_PAGE_SIZE
    : isMissionsTab
      ? ADD_CARDS_MISSION_SETS_PAGE_SIZE
      : isAllTab
        ? addCardsPageSizeAll(isMobile)
        : addCardsPageSizeForType(activeType!, isMobile);
  const totalItems = isStacksTab
    ? filteredStacks.length
    : isMissionsTab
      ? filteredMissionSets.length
      : isAllTab
        ? allFlat.length
        : typeList.length;
  const maxPage = Math.max(1, Math.ceil(totalItems / pageSize));
  const effectivePage = Math.min(page, maxPage);

  const pageAllItems = useMemo(
    () => (isAllTab ? paginateItems(allFlat, effectivePage, pageSize) : []),
    [isAllTab, allFlat, effectivePage, pageSize],
  );

  const pageAllBlocks = useMemo(
    () => groupPageItemsByType(pageAllItems),
    [pageAllItems],
  );

  const pageTypeCards = useMemo(
    () =>
      !isAllTab && !isStacksTab && !isMissionsTab
        ? paginateItems(typeList, effectivePage, pageSize)
        : [],
    [isAllTab, isStacksTab, isMissionsTab, typeList, effectivePage, pageSize],
  );

  const pageStacks = useMemo(
    () => (isStacksTab ? paginateItems(filteredStacks, effectivePage, pageSize) : []),
    [isStacksTab, filteredStacks, effectivePage, pageSize],
  );

  const pageMissionSets = useMemo(
    () => (isMissionsTab ? paginateItems(filteredMissionSets, effectivePage, pageSize) : []),
    [isMissionsTab, filteredMissionSets, effectivePage, pageSize],
  );

  const qtyInDeck = (card: CatalogCard, catalogType: CatalogType) => {
    const deckType = CATALOG_TYPE_BY_SLUG[catalogType].deckType;
    const variantMap = variantLookupByType.get(catalogType) ?? new Map<string, string[]>();
    return qtyInDeckForRepresentative(card, catalogType, cards, deckType, variantMap);
  };

  const stackInDeckCount = (stack: CharacterStack) =>
    stackCardsInAddOrder(stack).filter(({ card, catalogType }) => qtyInDeck(card, catalogType) > 0)
      .length;

  const handleAddStack = (stack: CharacterStack) => {
    const missing = stackCardsInAddOrder(stack).filter(
      ({ card, catalogType }) => qtyInDeck(card, catalogType) === 0,
    );
    if (missing.length > 0) {
      onAddStack(missing);
    }
  };

  const handleAddMissionSet = (set: MissionSet) => {
    const missing = missionSetCardsInAddOrder(set).filter(
      ({ card }) => qtyInDeck(card, 'missions') === 0,
    );
    if (missing.length > 0) {
      onAddStack(missing);
    }
  };

  const isLoading = isStacksTab
    ? stackCatalogQueries.some((q) => q.isLoading) || foilMapQuery.isLoading
    : isAllTab
      ? allCatalogQuery.isLoading || foilMapQuery.isLoading
      : catalogQuery.isLoading || foilMapQuery.isLoading;
  const isError = isStacksTab
    ? stackCatalogQueries.some((q) => q.isError)
    : isAllTab
      ? allCatalogQuery.isError
      : catalogQuery.isError;
  const hasResults = totalItems > 0;

  return (
    <SlideOutPanel open={open} onClose={onClose} title="Add Cards" ariaLabel="Add cards" width={575}>
      <div className="add-cards">
        <div className="add-cards__search">
          <IconSearch className="add-cards__search-icon" />
          <input
            type="search"
            placeholder={isStacksTab ? STACKS_SEARCH_PLACEHOLDER : ADD_CARDS_SEARCH_PLACEHOLDER}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={isStacksTab ? STACKS_SEARCH_ARIA_LABEL : ADD_CARDS_SEARCH_ARIA_LABEL}
          />
        </div>
        <div className="add-cards__types" role="tablist" aria-label="Card types">
          <button
            type="button"
            role="tab"
            aria-selected={isAllTab}
            className={`add-cards__type ${isAllTab ? 'is-active' : ''}`}
            onClick={() => setTab('all')}
          >
            All
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isStacksTab}
            className={`add-cards__type ${isStacksTab ? 'is-active' : ''}`}
            onClick={() => setTab('stacks')}
          >
            Stacks
          </button>
          {CATALOG_TYPES.map((meta) => (
            <button
              key={meta.type}
              type="button"
              role="tab"
              aria-selected={tab === meta.type}
              className={`add-cards__type ${tab === meta.type ? 'is-active' : ''}`}
              onClick={() => setTab(meta.type)}
            >
              {meta.shortLabel}
            </button>
          ))}
        </div>

        <AddCardsFilterBar
          sets={setsQuery.data ?? []}
          setFilter={setFilter}
          onSetFilterChange={setSetFilter}
          hideUnusables={effectiveHideUnusables}
          onHideUnusablesChange={setHideUnusables}
          hideUnusablesDisabled={hideUnusablesDisabled}
          hideUnusablesDisabledReason={hideUnusablesDisabledReason}
        />

        {isLoading ? (
          <LoadingState label="Loading..." />
        ) : isError ? (
          <EmptyState title="Could not load cards" message="Try again in a moment." icon={<IconSearch />} />
        ) : !hasResults ? (
          <EmptyState title="No cards" message="Try another search or type." icon={<IconSearch />} />
        ) : isStacksTab ? (
          <div className="add-cards__stack-list">
            {pageStacks.map((stack) => (
              <CharacterStackRow
                key={stack.characterName}
                stack={stack}
                inDeckCount={stackInDeckCount(stack)}
                totalCount={stackTotalCardCount(stack)}
                onAddStack={() => handleAddStack(stack)}
              />
            ))}
          </div>
        ) : isMissionsTab ? (
          <div className="add-cards__mission-set-list">
            {pageMissionSets.map((set) => (
              <MissionSetRow
                key={set.missionSetName}
                missionSet={set}
                qtyInDeck={(card) => qtyInDeck(card, 'missions')}
                missionLimitReached={missionLimitReached}
                renderOverlay={cardTileOverlay}
                onAddMission={(card) => onAdd(card, 'missions')}
                onAddSet={() => handleAddMissionSet(set)}
              />
            ))}
          </div>
        ) : isAllTab ? (
          <div className="add-cards__sections">
            {pageAllBlocks.map((block, blockIndex) => (
              <section className="add-cards__section" key={`${block.meta.type}-${blockIndex}`}>
                <h3 className="add-cards__section-title">
                  {block.meta.label}
                  <span className="add-cards__section-count">{block.cards.length}</span>
                </h3>
                <div className={addCardsGridClassName(block.meta.type)}>
                  {block.cards.map((card) => {
                    const catalogType = block.meta.type;
                    const inDeck = qtyInDeck(card, catalogType);
                    return (
                      <CardTile
                        key={`${catalogType}-${card.id}`}
                        card={card}
                        catalogType={catalogType}
                        showMeta={false}
                        onClick={() => onAdd(card, catalogType)}
                        overlay={cardTileOverlay(inDeck)}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className={addCardsGridClassName(activeType!)}>
            {pageTypeCards.map((card) => {
              const catalogType = activeType!;
              const inDeck = qtyInDeck(card, catalogType);
              return (
                <CardTile
                  key={card.id}
                  card={card}
                  catalogType={catalogType}
                  showMeta={false}
                  onClick={() => onAdd(card, catalogType)}
                  overlay={cardTileOverlay(inDeck)}
                />
              );
            })}
          </div>
        )}

        {hasResults && !isLoading ? (
          <Pagination
            className="add-cards__pagination"
            page={effectivePage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        ) : null}
      </div>
      <button type="button" className="add-cards__done btn btn-primary" onClick={onClose}>
        <IconClose /> Done
      </button>
    </SlideOutPanel>
  );
}
