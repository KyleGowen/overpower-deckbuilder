import type { TournamentEventMeta } from '../../lib/tournaments/types';
import { formatEventLocation } from '../../lib/tournaments/formatEventLocation';
import { PreviewTextTile } from './PreviewTextTile';
import './TournamentCharts.css';

function formatEventDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

interface TournamentPlacardTileProps {
  meta: TournamentEventMeta;
}

export function TournamentPlacardTile({ meta }: TournamentPlacardTileProps) {
  return (
    <PreviewTextTile
      className="tournament-placard-tile"
      title={meta.title}
      subtitle={meta.seasonLabel}
      sections={[
        {
          label: 'Location',
          value: formatEventLocation(meta.location),
          wrap: true,
        },
        {
          label: 'Date',
          value: formatEventDate(meta.date),
        },
        {
          label: 'Players',
          value: String(meta.playerCount),
        },
        {
          label: 'Winner Name',
          value: meta.winnerName,
          variant: 'accent',
        },
      ]}
    />
  );
}
