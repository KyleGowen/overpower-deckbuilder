import { Checkbox } from '../../components/Checkbox';
import type { SetInfo } from '../../lib/api/types';

export interface AddCardsFilterBarProps {
  sets: SetInfo[];
  setFilter: string;
  onSetFilterChange: (value: string) => void;
  hideUnusables: boolean;
  onHideUnusablesChange: (checked: boolean) => void;
  hideUnusablesDisabled: boolean;
  hideUnusablesDisabledReason?: string;
}

export function AddCardsFilterBar({
  sets,
  setFilter,
  onSetFilterChange,
  hideUnusables,
  onHideUnusablesChange,
  hideUnusablesDisabled,
  hideUnusablesDisabledReason,
}: AddCardsFilterBarProps) {
  return (
    <div className="add-cards__filters" aria-label="Add cards filters">
      <div className="add-cards__filters-block">
        <label className="add-cards__filters-label" htmlFor="add-cards-set-filter">
          Set
        </label>
        <select
          id="add-cards-set-filter"
          className="add-cards__filters-select"
          value={setFilter}
          onChange={(e) => onSetFilterChange(e.target.value)}
          aria-label="Filter by set"
        >
          <option value="">All sets</option>
          {sets.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name || s.code}
            </option>
          ))}
        </select>
      </div>
      <div
        className="add-cards__filters-block"
        title={hideUnusablesDisabled ? hideUnusablesDisabledReason : undefined}
      >
        <Checkbox
          className="add-cards__filters-toggle"
          label="Hide Unusables"
          checked={hideUnusables}
          disabled={hideUnusablesDisabled}
          onChange={onHideUnusablesChange}
        />
      </div>
    </div>
  );
}
