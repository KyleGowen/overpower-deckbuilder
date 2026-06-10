import type { ReactNode } from 'react';
import { SlideOutPanel } from '../SlideOutPanel';
import { CardImage } from '../CardImage';
import { cardDisplayName, cardStats, cardAbilityText, labelForCatalogType } from '../../lib/catalog/catalogTypeMap';
import type { CatalogCard, CatalogType } from '../../lib/api/types';
import './CardDetailPanel.css';

interface CardDetailPanelProps {
  card: CatalogCard | null;
  type: CatalogType | null;
  open: boolean;
  onClose: () => void;
  /** Action area rendered under the header (e.g. +Deck, collection stepper). */
  actions?: ReactNode;
}

/** Internal / non-display fields hidden from the auto-generated field list. */
const HIDDEN_FIELDS = new Set([
  'id',
  'image',
  'image_path',
  'thumb',
  'name',
  'card_name',
  'created_at',
  'updated_at',
  'energy',
  'combat',
  'brute_force',
  'intelligence',
  'special_abilities',
  'special_ability',
  'card_effect',
  'game_effect',
  'card_text',
]);

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bId\b/, 'ID');
}

function formatValue(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    const items = value.filter((v) => v !== null && v !== undefined && v !== '');
    return items.length ? items.join(', ') : null;
  }
  if (typeof value === 'object') return null;
  return String(value);
}

const STAT_ROWS: Array<{ key: 'energy' | 'combat' | 'bruteForce' | 'intelligence'; label: string; cls: string }> = [
  { key: 'energy', label: 'Energy', cls: 'stat-energy' },
  { key: 'combat', label: 'Combat', cls: 'stat-combat' },
  { key: 'bruteForce', label: 'Brute Force', cls: 'stat-brute-force' },
  { key: 'intelligence', label: 'Intelligence', cls: 'stat-intelligence' },
];

export function CardDetailPanel({ card, type, open, onClose, actions }: CardDetailPanelProps) {
  if (!card) return null;

  const name = cardDisplayName(card);
  const stats = cardStats(card);
  const ability = cardAbilityText(card);
  const typeLabel = type ? labelForCatalogType(type) : '';

  const extraFields = Object.entries(card)
    .filter(([key]) => !HIDDEN_FIELDS.has(key))
    .map(([key, value]) => [key, formatValue(value)] as const)
    .filter(([, value]) => value !== null);

  return (
    <SlideOutPanel open={open} onClose={onClose} title={name} ariaLabel={`${name} details`} width={420}>
      <div className="card-detail">
        <div className="card-detail__image">
          <CardImage imagePath={(card.image_path as string) || (card.image as string)} alt={name} useThumbnail={false} className="card-image--contain" />
        </div>

        <div className="card-detail__tags">
          {typeLabel ? <span className="badge">{typeLabel}</span> : null}
          {card.set ? <span className="badge">{card.set}</span> : null}
          {card.rarity ? <span className="badge">{card.rarity}</span> : null}
          {card.set_number ? <span className="badge">#{card.set_number}</span> : null}
        </div>

        {actions ? <div className="card-detail__actions">{actions}</div> : null}

        {stats ? (
          <div className="card-detail__stats">
            {STAT_ROWS.map((s) => (
              <div className="card-detail__stat" key={s.key}>
                <span className={`card-detail__stat-val ${s.cls}`}>{stats[s.key]}</span>
                <span className="card-detail__stat-label">{s.label}</span>
              </div>
            ))}
            <div className="card-detail__stat card-detail__stat--total">
              <span className="card-detail__stat-val stat-total">{stats.total}</span>
              <span className="card-detail__stat-label">Total</span>
            </div>
          </div>
        ) : null}

        {ability ? (
          <section className="card-detail__section">
            <h4 className="card-detail__section-title">Ability</h4>
            <p className="card-detail__text">{ability}</p>
          </section>
        ) : null}

        {extraFields.length > 0 ? (
          <section className="card-detail__section">
            <h4 className="card-detail__section-title">Details</h4>
            <dl className="card-detail__fields">
              {extraFields.map(([key, value]) => (
                <div className="card-detail__field" key={key}>
                  <dt>{humanizeKey(key)}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>
    </SlideOutPanel>
  );
}
