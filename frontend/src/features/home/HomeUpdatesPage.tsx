import { useEffect, useMemo, useState } from 'react';
import { IconSparkles } from '../../components/icons';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { Pagination } from '../../components/Pagination';
import { RecentUpdatesList } from './RecentUpdatesList';
import { useScrollToTopOnMount } from '../../lib/layout/useScrollToTopOnMount';
import { useRecentUpdates } from './useRecentUpdates';
import './HomeUpdatesPage.css';

const UPDATES_PAGE_SIZE = 10;

export default function HomeUpdatesPage() {
  useScrollToTopOnMount();

  const [page, setPage] = useState(1);
  const updatesQuery = useRecentUpdates();
  const updates = updatesQuery.data ?? [];

  const totalPages = Math.max(1, Math.ceil(updates.length / UPDATES_PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const pageUpdates = useMemo(() => {
    const start = (page - 1) * UPDATES_PAGE_SIZE;
    return updates.slice(start, start + UPDATES_PAGE_SIZE);
  }, [updates, page]);

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="home-updates">
      <div className="home-updates__inner">
        <header className="home-updates__head">
          <h1 className="home-updates__title">
            <span className="home-updates__icon"><IconSparkles /></span>
            Recent Updates
          </h1>
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
          <>
            <RecentUpdatesList updates={pageUpdates} layout="stacked" />
            {updates.length > UPDATES_PAGE_SIZE ? (
              <div className="home-updates__pagination">
                <Pagination
                  page={page}
                  pageSize={UPDATES_PAGE_SIZE}
                  totalItems={updates.length}
                  onPageChange={handlePageChange}
                />
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
