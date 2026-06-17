import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../app/AuthProvider';
import { fetchCommunityDecks, fetchTournamentDecks } from '../../lib/api/decks';
import { fetchCatalog } from '../../lib/api/catalog';
import { fetchRecentUpdates } from '../../lib/api/recent-updates';
import { buildMissionSetByCardId, deckMissionSetName } from '../../lib/decks/missionSetLabel';
import { resolveImageUrl, resolveThumbUrl, assetUrl } from '../../lib/images/cardImages';
import { DeckTile } from '../../components/DeckTile';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import {
  IconUsers,
  IconTrophy,
  IconSparkles,
  IconChevronRight,
  IconDecks,
} from '../../components/icons';
import type { DeckListItem } from '../../lib/api/types';
import './HomePage.css';

const HERO_BANNER = '/src/resources/images/home/home-hero.png';
const HERO_BANNER_2X = '/src/resources/images/home/home-hero-2x.png';

export default function HomePage() {
  const { user, communityDecksUserId, tournamentDecksUserId } = useAuth();
  const navigate = useNavigate();

  const communityQuery = useQuery({
    queryKey: ['decks', 'community'],
    queryFn: () => fetchCommunityDecks(),
    staleTime: 10 * 60 * 1000,
  });

  const communityDecks = (communityQuery.data ?? []).filter(
    (deck) => !communityDecksUserId || deck.metadata.userId === communityDecksUserId,
  );
  const tournamentQuery = useQuery({
    queryKey: ['decks', 'tournament'],
    queryFn: () => fetchTournamentDecks(),
    staleTime: 10 * 60 * 1000,
  });

  const tournamentDecks = (tournamentQuery.data ?? []).filter(
    (deck) => !tournamentDecksUserId || deck.metadata.userId === tournamentDecksUserId,
  );

  const missionsQuery = useQuery({
    queryKey: ['catalog', 'missions'],
    queryFn: () => fetchCatalog('missions'),
    staleTime: 30 * 60 * 1000,
  });

  const missionSetByCardId = useMemo(
    () => buildMissionSetByCardId(missionsQuery.data ?? []),
    [missionsQuery.data],
  );

  const openDeck = (deck: DeckListItem) => {
    const m = deck.metadata;
    navigate(`/users/${m.userId}/decks/${m.id}?readonly=true`);
  };

  return (
    <div className="home">
      <div className="home__inner">
        <section className="home__hero panel">
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
          <div className="home__hero-art" aria-hidden="true">
            <img
              className="home__hero-art-image"
              src={assetUrl(HERO_BANNER)}
              srcSet={`${assetUrl(HERO_BANNER)} 1x, ${assetUrl(HERO_BANNER_2X)} 2x`}
              sizes="(min-width: 2000px) 1333px, 66vw"
              alt=""
            />
          </div>
        </section>

        <NewsSection />

        <DeckRail
          icon={<IconUsers />}
          title="Community Decks"
          loading={communityQuery.isLoading}
          error={communityQuery.isError}
          decks={communityDecks}
          emptyMessage="Community decks will appear here as they are shared."
          missionSetByCardId={missionSetByCardId}
          onOpen={openDeck}
        />

        <DeckRail
          icon={<IconTrophy />}
          title="Tournament Winning Decks"
          loading={tournamentQuery.isLoading}
          error={tournamentQuery.isError}
          decks={tournamentDecks}
          emptyMessage="Tournament-winning decks will appear here as they are added."
          missionSetByCardId={missionSetByCardId}
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
  missionSetByCardId: Map<string, string>;
  onOpen: (deck: DeckListItem) => void;
}

function DeckRail({
  icon,
  title,
  loading,
  error,
  decks,
  emptyMessage,
  missionSetByCardId,
  onOpen,
}: DeckRailProps) {
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
              <DeckTile
                deck={deck}
                variant="compact"
                missionSetName={deckMissionSetName(deck, missionSetByCardId)}
                onOpen={() => onOpen(deck)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function formatUpdateTypeLabel(type: string): string {
  if (type === 'new_cards') return 'NEW CARDS';
  return type.replace(/_/g, ' ').toUpperCase();
}

function NewsSection() {
  // Single-open accordion: clicking a tile expands it horizontally to reveal the
  // full summary and collapses any previously open tile.
  const [openId, setOpenId] = useState<string | null>(null);
  const updatesQuery = useQuery({
    queryKey: ['recent-updates'],
    queryFn: () => fetchRecentUpdates(),
    staleTime: 10 * 60 * 1000,
  });

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));
  const updates = updatesQuery.data ?? [];

  return (
    <section className="home__section">
      <header className="home__section-head">
        <h2 className="home__section-title">
          <span className="home__section-icon"><IconSparkles /></span>
          Recent Updates
        </h2>
      </header>

      {updatesQuery.isLoading ? (
        <LoadingState label="Loading updates..." />
      ) : updatesQuery.isError || updates.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          message="Recent updates will appear here."
          icon={<IconSparkles />}
        />
      ) : (
        <div className="home__news">
          {updates.map((item) => {
            const isOpen = openId === item.id;
            const typeLabel = formatUpdateTypeLabel(item.type);
            const typeClass = item.type.replace(/_/g, '-');
            return (
              <button
                type="button"
                className={`home__news-item${isOpen ? ' home__news-item--open' : ''}`}
                key={item.id}
                aria-expanded={isOpen}
                onClick={() => toggle(item.id)}
              >
                <div className="home__news-thumb">
                  {item.cardImageUrl ? (
                    <img src={resolveThumbUrl(item.cardImageUrl)} alt="" loading="lazy" draggable={false} />
                  ) : (
                    <span className="home__news-thumb-icon"><IconSparkles /></span>
                  )}
                </div>
                <div className="home__news-body">
                  <span className={`home__news-tag home__news-tag--${typeClass}`}>
                    {typeLabel}
                  </span>
                  <h3 className="home__news-title">{item.title}</h3>
                  <p className={`home__news-summary home__news-summary--${isOpen ? 'expanded' : 'clamped'}`}>
                    {item.description}
                  </p>
                  <span className="home__news-date">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
