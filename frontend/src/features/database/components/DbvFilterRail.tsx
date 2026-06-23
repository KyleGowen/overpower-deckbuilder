import { useMemo } from 'react';
import { IconChevronDown } from '../../../components/icons';
import type { CatalogCard, CatalogType } from '../../../lib/api/types';
import { collectMissionSetOptions } from '../filters/dbvFilterPredicates';
import { getDbvFilterConfig } from '../filters/dbvFilterConfig';
import type { FilterChip } from '../filters/dbvFilterTypes';
import type { UseDbvFiltersReturn } from '../filters/useDbvFilters';
import { DbvFunctionIconStrip } from './DbvFunctionIconStrip';
import { DbvMissionSetSelect } from './DbvMissionSetSelect';
import { DbvNumericStatInline } from './DbvNumericStatInline';
import { DbvPowerTypeStrip } from './DbvPowerTypeStrip';
import './DbvFilterRail.css';

const MAX_VISIBLE_CHIPS = 4;

interface DbvFilterRailProps {
  catalogType: CatalogType;
  filters: UseDbvFiltersReturn;
  allCards: CatalogCard[];
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  hasFoilFilter: boolean;
  onHasFoilFilterChange: (checked: boolean) => void;
}

function FilterChips({
  chips,
  onRemove,
}: {
  chips: FilterChip[];
  onRemove: (chip: FilterChip) => void;
}) {
  if (!chips.length) return null;
  const visible = chips.slice(0, MAX_VISIBLE_CHIPS);
  const overflow = chips.length - visible.length;

  return (
    <div className="dbv-filter-rail__chips" aria-label="Active filters">
      {visible.map((chip) => (
        <button
          key={chip.id}
          type="button"
          className="dbv-filter-rail__chip"
          onClick={() => onRemove(chip)}
          title={`Remove ${chip.label} filter`}
        >
          <span>{chip.label}</span>
          <span className="dbv-filter-rail__chip-x" aria-hidden="true">
            ×
          </span>
        </button>
      ))}
      {overflow > 0 ? (
        <span className="dbv-filter-rail__chip-overflow">+{overflow} more</span>
      ) : null}
    </div>
  );
}

export function DbvFilterRail({
  catalogType,
  filters,
  allCards,
  collapsed,
  onCollapsedChange,
  hasFoilFilter,
  onHasFoilFilterChange,
}: DbvFilterRailProps) {
  const config = getDbvFilterConfig(catalogType);
  const hasFilterGroups = config.groups.length > 0;

  const missionSetOptions = useMemo(
    () => (config.groups.includes('missionSet') ? collectMissionSetOptions(allCards) : []),
    [allCards, config.groups],
  );

  if (!hasFilterGroups) return null;

  return (
    <div
      className={`dbv-filter-rail${collapsed ? ' is-collapsed' : ''}`}
      aria-label="Card filters"
    >
      <button
        type="button"
        className={`dbv-filter-rail__toggle${collapsed ? ' dbv-filter-rail__toggle--collapsed-row' : ''}`}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Expand filters' : 'Collapse filters'}
        onClick={() => onCollapsedChange(!collapsed)}
      >
        <span className="dbv-filter-rail__toggle-icon-wrap">
          <IconChevronDown
            className={`dbv-filter-rail__toggle-icon${collapsed ? '' : ' is-expanded'}`}
            aria-hidden
          />
        </span>
        {collapsed ? <span className="dbv-filter-rail__toggle-line" aria-hidden="true" /> : null}
      </button>

      {!collapsed ? (
        <>
          <div className="dbv-filter-rail__controls">
            {config.groups.includes('numeric') && config.numericFields ? (
              <DbvNumericStatInline fields={config.numericFields} filters={filters} />
            ) : null}

            {config.groups.includes('powerTypes') && config.powerTypeKeys ? (
              <div className="dbv-filter-rail__group">
                <span className="dbv-filter-rail__label">Power types</span>
                <DbvPowerTypeStrip powerTypeKeys={config.powerTypeKeys} filters={filters} />
              </div>
            ) : null}

            {config.groups.includes('functionIcons') ? (
              <div className="dbv-filter-rail__group">
                <span className="dbv-filter-rail__label">Function</span>
                <DbvFunctionIconStrip filters={filters} />
              </div>
            ) : null}

            {config.groups.includes('missionSet') ? (
              <DbvMissionSetSelect options={missionSetOptions} filters={filters} />
            ) : null}
          </div>

          <div className="dbv-filter-rail__trailing">
            <FilterChips chips={filters.chips} onRemove={filters.removeChip} />
            {filters.activeCount > 0 ? (
              <button type="button" className="dbv-filter-rail__clear" onClick={filters.clearAll}>
                Clear
              </button>
            ) : null}
            <label className="dbv-filter-rail__foil-toggle">
              <input
                type="checkbox"
                checked={hasFoilFilter}
                onChange={(e) => onHasFoilFilterChange(e.target.checked)}
                aria-label="Has Foil"
              />
              <span className="dbv-filter-rail__foil-toggle-label">Has Foil</span>
            </label>
          </div>
        </>
      ) : null}
    </div>
  );
}
