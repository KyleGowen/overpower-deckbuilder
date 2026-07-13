import { IconChevronRight } from '../icons';
import type { ColumbusPodiumDeckEntry, ColumbusPodiumPlacement } from '../../lib/tournaments/columbusPodiumDecks';
import { extractPodiumPlayerName } from '../../lib/tournaments/columbusPodiumDecks';
import './TournamentCharts.css';

const PODIUM_ITEM_CLASS: Record<ColumbusPodiumPlacement, string> = {
  '1st': 'tournament-podium-tile__item--1st',
  '2nd': 'tournament-podium-tile__item--2nd',
  '3rd': 'tournament-podium-tile__item--3rd',
};

interface TournamentPodiumDeckRowsProps {
  entries: ColumbusPodiumDeckEntry[];
  onOpenDeck: (deckId: string, userId: string) => void;
}

export function TournamentPodiumDeckRows({ entries, onOpenDeck }: TournamentPodiumDeckRowsProps) {
  return (
    <ul className="tournament-podium-tile__list">
      {entries.map(({ placement, deck }) => {
        const meta = deck?.metadata;
        const playerName = meta
          ? extractPodiumPlayerName(meta.name, placement)
          : 'Deck unavailable';
        const clickable = Boolean(meta);
        const itemClass = PODIUM_ITEM_CLASS[placement];

        return (
          <li key={placement} className={`tournament-podium-tile__item ${itemClass}`.trim()}>
            {clickable && meta ? (
              <button
                type="button"
                className="tournament-podium-tile__row"
                onClick={() => onOpenDeck(meta.id, meta.userId)}
              >                <span className="tournament-podium-tile__badge">{placement}</span>
                <span className="tournament-podium-tile__name">{playerName}</span>
                <IconChevronRight className="tournament-podium-tile__chevron" aria-hidden />
              </button>
            ) : (
              <div className="tournament-podium-tile__row tournament-podium-tile__row--disabled">
                <span className="tournament-podium-tile__badge">{placement}</span>
                <span className="tournament-podium-tile__name tournament-podium-tile__name--muted">
                  {playerName}
                </span>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
