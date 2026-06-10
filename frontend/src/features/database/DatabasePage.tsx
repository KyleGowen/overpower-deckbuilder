import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../app/AuthProvider';
import { fetchCatalog, fetchSets } from '../../lib/api/catalog';
import { fetchUserDecks, addCardToDeck } from '../../lib/api/decks';
import {
  CATALOG_TYPES,
  cardDisplayName,
  cardStats,
  metaForDeckType,
  CATALOG_TYPE_BY_SLUG,
} from '../../lib/catalog/catalogTypeMap';
import { CardTile } from '../../components/CardTile';
import { CardDetailPanel } from '../../components/CardDetailPanel';
import { Pagination } from '../../components/Pagination';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { SlideOutPanel } from '../../components/SlideOutPanel';
import { useLayoutMode } from '../../lib/layout/LayoutModeProvider';
import { IconSearch, IconSliders, IconPlus, IconLock, IconDatabase } from '../../components/icons';
import type { CatalogCard, CatalogType } from '../../lib/api/types';
import './DatabasePage.css';

const PAGE_SIZE = 24;

type SortKey = 'name' | 'set' | 'rarity' | 'total';

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
  const [type, setType] = useState<CatalogType>('characters');
  const [search, setSearch] = useState('');
  const [setFilter, setSetFilter] = useState('');
  const [rarityFilter, setRarityFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CatalogCard | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedSearch = useDebounced(search);

  const catalogQuery = useQuery({
    queryKey: ['catalog', type],
    queryFn: () => fetchCatalog(type),
    staleTime: 30 * 60 * 1000,
  });
  const setsQuery = useQuery({ queryKey: ['sets'], queryFn: () => fetchSets(), staleTime: 60 * 60 * 1000 });

  const allCards = catalogQuery.data ?? [];

  const rarities = useMemo(() => {
    const set = new Set<string>();
    allCards.forEach((c) => c.rarity && set.add(String(c.rarity)));
    return Array.from(set).sort();
  }, [allCards]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    let result = allCards.filter((c) => {
      if (q && !cardDisplayName(c).toLowerCase().includes(q)) return false;
      if (setFilter && String(c.set ?? '') !== setFilter) return false;
      if (rarityFilter && String(c.rarity ?? '') !== rarityFilter) return false;
      return true;
    });
    result = [...result].sort((a, b) => {
      if (sortKey === 'total') {
        return (cardStats(b)?.total ?? 0) - (cardStats(a)?.total ?? 0);
      }
      const av = String((a[sortKey] as string) ?? (sortKey === 'name' ? cardDisplayName(a) : '')).toLowerCase();
      const bv = String((b[sortKey] as string) ?? (sortKey === 'name' ? cardDisplayName(b) : '')).toLowerCase();
      if (sortKey === 'name') return cardDisplayName(a).localeCompare(cardDisplayName(b));
      return av.localeCompare(bv);
    });
    return result;
  }, [allCards, debouncedSearch, setFilter, rarityFilter, sortKey]);

  useEffect(() => {
    setPage(1);
  }, [type, debouncedSearch, setFilter, rarityFilter, sortKey]);

  const pageCards = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filterControls = (
    <>
      <div className="db-field">
        <label className="db-field__label">Set</label>
        <select value={setFilter} onChange={(e) => setSetFilter(e.target.value)}>
          <option value="">All sets</option>
          {(setsQuery.data ?? []).map((s) => (
            <option key={s.code} value={s.code}>{s.name || s.code}</option>
          ))}
        </select>
      </div>
      <div className="db-field">
        <label className="db-field__label">Rarity</label>
        <select value={rarityFilter} onChange={(e) => setRarityFilter(e.target.value)}>
          <option value="">All rarities</option>
          {rarities.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className="db-field">
        <label className="db-field__label">Sort by</label>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
          <option value="name">Name</option>
          <option value="set">Set</option>
          <option value="rarity">Rarity</option>
          {type === 'characters' ? <option value="total">Total stats</option> : null}
        </select>
      </div>
    </>
  );

  return (
    <div className="db">
      <div className="db__inner">
        <header className="db__header">
          <h1 className="db__title"><IconDatabase /> Card Database</h1>
          <div className="db__search">
            <IconSearch className="db__search-icon" />
            <input
              type="search"
              placeholder="Search cards by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search cards"
            />
          </div>
          {isMobile ? (
            <button type="button" className="btn btn-secondary db__filter-btn" onClick={() => setFiltersOpen(true)}>
              <IconSliders /> Filters
            </button>
          ) : null}
        </header>

        <div className="db__types" role="tablist" aria-label="Card types">
          {CATALOG_TYPES.map((meta) => (
            <button
              key={meta.type}
              type="button"
              role="tab"
              aria-selected={type === meta.type}
              className={`db__type ${type === meta.type ? 'is-active' : ''}`}
              onClick={() => setType(meta.type)}
            >
              {isMobile ? meta.shortLabel : meta.label}
            </button>
          ))}
        </div>

        {!isMobile ? <div className="db__filters">{filterControls}</div> : null}

        {catalogQuery.isLoading ? (
          <LoadingState label="Loading cards..." />
        ) : catalogQuery.isError ? (
          <EmptyState variant="error" title="Couldn't load cards" message="Please try again." icon={<IconDatabase />} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No cards found" message="Try adjusting your search or filters." icon={<IconSearch />} />
        ) : (
          <>
            <div className="db__grid">
              {pageCards.map((card) => (
                <CardTile key={card.id} card={card} onClick={() => setSelected(card)} />
              ))}
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} totalItems={filtered.length} onPageChange={setPage} />
          </>
        )}
      </div>

      <CardDetailPanel
        card={selected}
        type={type}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        actions={selected ? <AddToDeck card={selected} type={type} /> : null}
      />

      <SlideOutPanel open={filtersOpen} onClose={() => setFiltersOpen(false)} side="bottom" title="Filters" ariaLabel="Filters">
        <div className="db__filters db__filters--sheet">{filterControls}</div>
      </SlideOutPanel>
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
      <button type="button" className="btn btn-secondary db__add-deck" disabled title="Log in to add to decks">
        <IconLock /> Log in to add to decks
      </button>
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
