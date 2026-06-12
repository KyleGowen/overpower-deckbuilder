import { assetUrl } from '../../../lib/images/cardImages';
import type { UseDbvFiltersReturn } from '../filters/useDbvFilters';

const POWER_TYPE_IMG: Record<string, string> = {
  Energy: '/src/resources/images/icons/energy.png',
  Combat: '/src/resources/images/icons/combat.png',
  'Brute Force': '/src/resources/images/icons/brute_force.png',
  Intelligence: '/src/resources/images/icons/intelligence.png',
  'Any-Power': '/src/resources/images/icons/any-power.png',
};

interface DbvPowerTypeStripProps {
  powerTypeKeys: string[];
  filters: UseDbvFiltersReturn;
  ariaLabel?: string;
}

export function DbvPowerTypeStrip({
  powerTypeKeys,
  filters,
  ariaLabel = 'Filter by power type',
}: DbvPowerTypeStripProps) {
  return (
    <div className="dbv-power-strip" role="group" aria-label={ariaLabel}>
      {powerTypeKeys.map((pt) => {
        const isActive = filters.state.powerTypes.includes(pt);
        const isMp = pt === 'Multi-Power';
        const img = POWER_TYPE_IMG[pt];
        return (
          <button
            key={pt}
            type="button"
            className={`dbv-power-strip__btn ${isActive ? 'is-active' : ''}`}
            aria-pressed={isActive}
            title={pt}
            onClick={() => filters.togglePowerType(pt)}
          >
            {isMp ? (
              <span className="dbv-power-strip__mp">MP</span>
            ) : img ? (
              <img src={assetUrl(img)} alt="" />
            ) : (
              <span>{pt}</span>
            )}
            <span className="sr-only">{pt}</span>
          </button>
        );
      })}
    </div>
  );
}
