import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { LoadingState } from '../components/LoadingState';
import { ProtectedRoute } from './ProtectedRoute';
import { RootLayout } from './RootLayout';

const LoginPage = lazy(() => import('../features/login/LoginPage'));
const HomePage = lazy(() => import('../features/home/HomePage'));
const HomeUpdatesPage = lazy(() => import('../features/home/HomeUpdatesPage'));
const DatabasePage = lazy(() => import('../features/database/DatabasePage'));
const CollectionPage = lazy(() => import('../features/collection/CollectionPage'));
const DeckSelectionPage = lazy(() => import('../features/deck-selection/DeckSelectionPage'));
const CommunityPage = lazy(() => import('../features/community/CommunityPage'));
const DeckEditorPage = lazy(() => import('../features/deck-editor/DeckEditorPage'));

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingState fullscreen label="Loading..." />}>{children}</Suspense>;
}

/** Layout for the primary navigable pages (top nav + mobile bottom nav). */
function ShelledLayout() {
  return (
    <ProtectedRoute>
      <AppShell>
        <Lazy>
          <Outlet />
        </Lazy>
      </AppShell>
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/login',
        element: (
          <Lazy>
            <LoginPage />
          </Lazy>
        ),
      },
      {
        element: <ShelledLayout />,
        children: [
          { path: '/', element: <Navigate to="/home" replace /> },
          { path: '/home', element: <HomePage /> },
          { path: '/home/updates', element: <HomeUpdatesPage /> },
          { path: '/data', element: <DatabasePage /> },
          { path: '/community', element: <CommunityPage /> },
          { path: '/users/:userId/decks', element: <DeckSelectionPage /> },
          { path: '/users/:userId/collection', element: <CollectionPage /> },
        ],
      },
      {
        // Deck editor has its own chrome (no standard shell) and is unguarded so
        // shared / read-only deck links work for not-yet-authenticated visitors.
        path: '/users/:userId/decks/:deckId',
        element: (
          <Lazy>
            <DeckEditorPage />
          </Lazy>
        ),
      },
      { path: '*', element: <Navigate to="/home" replace /> },
    ],
  },
]);
