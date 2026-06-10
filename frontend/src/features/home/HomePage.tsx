import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../app/AuthProvider';
import { fetchCommunityDecks } from '../../lib/api/decks';
import { resolveImageUrl, resolveThumbUrl } from '../../lib/images/cardImages';
import { DeckTile } from '../../components/DeckTile';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { RECENT_UPDATES } from '../../content/recent-updates';
import {
  IconUsers,
  IconTrophy,
  IconSparkles,
  IconChevronRight,
  IconDecks,
} from '../../components/icons';
import type { DeckListItem } from '../../lib/api/types';
import './HomePage.css';

const HERO_ART = 'specials/department_of_theoretical_physics.webp';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const communityQuery = useQuery({
    queryKey: ['decks', 'community'],
    queryFn: () => fetchCommunityDecks(),
    staleTime: 10 * 60 * 1000,
  });

  const communityDecks = communityQuery.data ?? [];
  // Tournament decks have no data source yet (documented placeholder).
  const tournamentDecks: DeckListItem[] = [];

  const openDeck = (deck: DeckListItem) => {
    const m = deck.metadata;
    navigate(`/users/${m.userId}/decks/${m.id}?readonly=true`);
  };

  return (
    <div className="home">
      <div className="home__inner">
        <section
          className="home__hero panel"
          style={{ ['--hero-art' as string]: `url("${resolveImageUrl(HERO_ART)}")` }}
        >
          <div className="home__hero-text">
            <h1 className="home__hero-title">Welcome to Excelsior</h1>
            <p className="home__hero-tagline">OverPower deck building and collection tracking companion.</p>
            <p className="home__hero-sub">
              Build decks, explore cards, track your collection, and share your decks with the community.
            </p>
            <button
              type="button"
              className="btn btn-primary home__hero-cta"
              onClick={() => navigate(user ? `/users/${user.id}/decks` : '/data')}
            >
              <IconDecks /> Explore Decks
            </button>
          </div>
          <div className="home__hero-art" aria-hidden="true" />
        </section>

        <NewsSection />

        <DeckRail
          icon={<IconUsers />}
          title="Community Decks"
          loading={communityQuery.isLoading}
          error={communityQuery.isError}
          decks={communityDecks}
          emptyMessage="Community decks will appear here as they are shared."
          onOpen={openDeck}
        />

        <DeckRail
          icon={<IconTrophy />}
          title="Tournament Winning Decks"
          loading={false}
          error={false}
          decks={tournamentDecks}
          emptyMessage="Tournament-winning decks are coming soon."
          onOpen={openDeck}
        />
      </div>
    </div>
  );
}

interface DeckRailProps {
  icon: React.ReactNode;
  title: string;
  loading: boolean;
  error: boolean;
  decks: DeckListItem[];
  emptyMessage: string;
  onOpen: (deck: DeckListItem) => void;
}

function DeckRail({ icon, title, loading, error, decks, emptyMessage, onOpen }: DeckRailProps) {
  return (
    <section className="home__section">
      <header className="home__section-head">
        <h2 className="home__section-title">
          <span className="home__section-icon">{icon}</span>
          {title}
        </h2>
        {decks.length > 0 ? (
          <span className="home__view-all">View All <IconChevronRight /></span>
        ) : null}
      </header>

      {loading ? (
        <LoadingState label="Loading decks..." />
      ) : error || decks.length === 0 ? (
        <EmptyState title="Nothing here yet" message={emptyMessage} icon={icon} />
      ) : (
        <div className="home__rail">
          {decks.map((deck) => (
            <div className="home__rail-item" key={deck.metadata.id}>
              <DeckTile deck={deck} variant="compact" onOpen={() => onOpen(deck)} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function NewsSection() {
  return (
    <section className="home__section">
      <header className="home__section-head">
        <h2 className="home__section-title">
          <span className="home__section-icon"><IconSparkles /></span>
          Recent Updates
        </h2>
      </header>
      <div className="home__news">
        {RECENT_UPDATES.map((item) => (
          <article className="home__news-item" key={item.id}>
            <div className="home__news-thumb">
              {item.imagePath ? (
                <img src={resolveThumbUrl(item.imagePath)} alt="" loading="lazy" draggable={false} />
              ) : (
                <span className="home__news-thumb-icon"><IconSparkles /></span>
              )}
            </div>
            <div className="home__news-body">
              <span className={`home__news-tag home__news-tag--${item.tag.replace(/\s+/g, '-').toLowerCase()}`}>
                {item.tag}
              </span>
              <h3 className="home__news-title">{item.title}</h3>
              <p className="home__news-summary">{item.summary}</p>
              <span className="home__news-date">
                {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <IconChevronRight className="home__news-caret" />
          </article>
        ))}
      </div>
    </section>
  );
}
