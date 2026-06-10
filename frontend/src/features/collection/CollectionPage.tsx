import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCatalog } from '../../lib/api/catalog';
import { useCollection } from '../../lib/collection/useCollection';
import { CATALOG_TYPES, CATALOG_TYPE_BY_SLUG, cardDisplayName } from '../../lib/catalog/catalogTypeMap';
import { CardTile } from '../../components/CardTile';
import { CardDetailPanel } from '../../components/CardDetailPanel';
import { QuantityStepper } from '../../components/QuantityStepper';
import { Pagination } from '../../components/Pagination';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { useLayoutMode } from '../../lib/layout/LayoutModeProvider';
import { IconSearch, IconCollection } from '../../components/icons';
import type { CatalogCard, CatalogType } from '../../lib/api/types';
import './CollectionPage.css';

const PAGE_SIZE = 24;

function useDebounced<T>(value: T, delay = 250): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function CollectionPage() {
  const { isMobile } = useLayoutMode();
  const collection = useCollection();
  const [type, setType] = useState<CatalogType>('characters');
  const [search, setSearch] = useState('');
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CatalogCard | null>(null);

  const debouncedSearch = useDebounced(search);
  const collectionType = CATALOG_TYPE_BY_SLUG[type].collectionType;

  const catalogQuery = useQuery({
    queryKey: ['catalog', type],
    queryFn: () => fetchCatalog(type),
    staleTime: 30 * 60 * 1000,
  });
  const allCards = catalogQuery.data ?? [];

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return allCards.filter((c) => {
      if (q && !cardDisplayName(c).toLowerCase().includes(q)) return false;
      if (ownedOnly && collection.quantityFor(c.id, collectionType) <= 0) return false;
      return true;
    });
  }, [allCards, debouncedSearch, ownedOnly, collection, collectionType]);

  useEffect(() => {
    setPage(1);
  }, [type, debouncedSearch, ownedOnly]);

  const pageCards = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="col">
      <div className="col__inner">
        <header className="col__header">
          <div className="col__heading">
            <h1 className="col__title"><IconCollection /> My Collection</h1>
            <div className="col__stats">
              <span className="col__stat"><strong>{collection.totalOwned}</strong> cards owned</span>
              <span className="col__stat"><strong>{collection.uniqueCards}</strong> unique</span>
              {collection.isGuest ? <span className="col__guest-note">Stored on this device</span> : null}
            </div>
          </div>
          <div className="col__controls">
            <div className="col__search">
              <IconSearch className="col__search-icon" />
              <input
                type="search"
                placeholder="Search your collection..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search collection"
              />
            </div>
            <label className="col__owned-toggle">
              <input type="checkbox" checked={ownedOnly} onChange={(e) => setOwnedOnly(e.target.checked)} />
              Owned only
            </label>
          </div>
        </header>

        <div className="col__types" role="tablist" aria-label="Card types">
          {CATALOG_TYPES.map((meta) => (
            <button
              key={meta.type}
              type="button"
              role="tab"
              aria-selected={type === meta.type}
              className={`col__type ${type === meta.type ? 'is-active' : ''}`}
              onClick={() => setType(meta.type)}
            >
              {isMobile ? meta.shortLabel : meta.label}
            </button>
          ))}
        </div>

        {catalogQuery.isLoading || collection.isLoading ? (
          <LoadingState label="Loading collection..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={ownedOnly ? 'No cards owned here yet' : 'No cards found'}
            message={ownedOnly ? 'Add cards to your collection to see them here.' : 'Try a different search or type.'}
            icon={<IconCollection />}
          />
        ) : (
          <>
            <div className="col__grid">
              {pageCards.map((card) => {
                const qty = collection.quantityFor(card.id, collectionType);
                return (
                  <CardTile
                    key={card.id}
                    card={card}
                    dimmed={qty <= 0}
                    onClick={() => setSelected(card)}
                    overlay={qty > 0 ? <span className="col__owned-badge">x{qty}</span> : null}
                    footer={
                      <QuantityStepper
                        value={qty}
                        size="sm"
                        onChange={(next) => void collection.setQuantity(card, collectionType, next)}
                      />
                    }
                  />
                );
              })}
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
        actions={
          selected ? (
            <div className="col__detail-qty">
              <span>In your collection</span>
              <QuantityStepper
                value={collection.quantityFor(selected.id, collectionType)}
                onChange={(next) => void collection.setQuantity(selected, collectionType, next)}
              />
            </div>
          ) : null
        }
      />
    </div>
  );
}
