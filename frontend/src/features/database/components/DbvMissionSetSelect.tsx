import type { UseDbvFiltersReturn } from '../filters/useDbvFilters';

interface DbvMissionSetSelectProps {
  options: string[];
  filters: UseDbvFiltersReturn;
}

export function DbvMissionSetSelect({ options, filters }: DbvMissionSetSelectProps) {
  return (
    <div className="dbv-mission-set">
      <label className="dbv-mission-set__label" htmlFor="dbv-mission-set-filter">
        Mission set
      </label>
      <select
        id="dbv-mission-set-filter"
        className="dbv-mission-set__select"
        value={filters.state.missionSet}
        onChange={(e) => filters.setMissionSet(e.target.value)}
        aria-label="Filter by mission set"
      >
        <option value="">All mission sets</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
