import type { ReactNode } from 'react';
import type { CatalogCard, CatalogType } from '../../lib/api/types';
import {
  CATALOG_TYPE_BY_SLUG,
  cardDisplayName,
} from '../../lib/catalog/catalogTypeMap';
import { isFoilCard } from '../../lib/catalog/foilCatalog';
import { resolveSetDisplayName } from '../../lib/catalog/setNames';
import './CatalogAllList.css';

export interface CatalogAllListItem {
  card: CatalogCard;
  catalogType: CatalogType;
}

interface CatalogAllListProps {
  items: CatalogAllListItem[];
  selectedId?: string | null;
  onSelect: (item: CatalogAllListItem) => void;
  renderTrailing?: (item: CatalogAllListItem) => ReactNode;
  dimmed?: (item: CatalogAllListItem) => boolean;
  /** Uppercased set code → friendly name (from `buildSetNameLookup`). */
  setNameLookup?: Map<string, string>;
}

function setCodeForCard(card: CatalogCard): string {
  return String(card.set ?? (card.universe as string) ?? '').trim();
}

const EMPTY_SET_LOOKUP = new Map<string, string>();

export function CatalogAllList({
  items,
  selectedId,
  onSelect,
  renderTrailing,
  dimmed,
  setNameLookup,
}: CatalogAllListProps) {
  const hasTrailing = Boolean(renderTrailing);

  return (
    <ul className="catalog-all-list" role="list">
      {items.map((item) => {
        const { card, catalogType } = item;
        const meta = CATALOG_TYPE_BY_SLUG[catalogType];
        const setNumber = String(card.set_number ?? '').trim();
        const setCode = setCodeForCard(card);
        const setLabel = setCode
          ? resolveSetDisplayName(setCode, setNameLookup ?? EMPTY_SET_LOOKUP)
          : undefined;
        const isSelected = selectedId === card.id;
        const isDimmed = dimmed?.(item) ?? false;
        const foil = isFoilCard(card);
        const displayName = cardDisplayName(card);

        return (
          <li
            key={`${catalogType}:${card.id}`}
            className={[
              'catalog-all-list__row',
              hasTrailing ? 'catalog-all-list__row--has-trailing' : '',
              isSelected ? 'is-selected' : '',
              isDimmed ? 'is-dimmed' : '',
            ].filter(Boolean).join(' ')}
          >
            <button
              type="button"
              className="catalog-all-list__main"
              onClick={() => onSelect(item)}
              aria-pressed={isSelected}
            >
              <span className="catalog-all-list__number" aria-hidden="true">
                {setNumber ? `#${setNumber}` : '—'}
              </span>
              <span className="catalog-all-list__name" title={displayName}>
                {displayName}
                {foil ? <span className="catalog-all-list__foil"> ✦</span> : null}
              </span>
              <span className="catalog-all-list__badges">
                <span className="badge catalog-all-list__type-badge">{meta.shortLabel}</span>
                {setLabel ? (
                  <span className="badge catalog-all-list__set-badge" title={setLabel}>
                    {setLabel}
                  </span>
                ) : (
                  <span className="catalog-all-list__set-badge" aria-hidden="true" />
                )}
              </span>
            </button>
            {renderTrailing ? (
              <div className="catalog-all-list__trailing">{renderTrailing(item)}</div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
