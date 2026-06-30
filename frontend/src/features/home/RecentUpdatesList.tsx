import { useState } from 'react';
import type { RecentUpdate } from '../../lib/api/types';
import { RecentUpdateTile } from './RecentUpdateTile';
import './recentUpdates.css';

export type RecentUpdatesLayout = 'rail' | 'stacked';

interface RecentUpdatesListProps {
  updates: RecentUpdate[];
  layout?: RecentUpdatesLayout;
}

export function RecentUpdatesList({ updates, layout = 'rail' }: RecentUpdatesListProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  const listClass = layout === 'stacked'
    ? 'home__news recent-updates-list--stacked'
    : 'home__news';

  return (
    <div className={listClass}>
      {updates.map((item) => (
        <RecentUpdateTile
          key={item.id}
          item={item}
          isOpen={openId === item.id}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </div>
  );
}
