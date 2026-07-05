import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoadingState } from '../components/LoadingState';
import { RootLayout } from './RootLayout';

const LoginPage = lazy(() => import('../features/login/LoginPage'));
const HomePage = lazy(() => import('../features/home/HomePage'));
const HomeUpdatesPage = lazy(() => import('../features/home/HomeUpdatesPage'));
const ColumbusRegionalPage = lazy(() => import('../features/home/ColumbusRegionalPage'));
const DatabasePage = lazy(() => import('../features/database/DatabasePage'));
const CollectionPage = lazy(() => import('../features/collection/CollectionPage'));
const DeckSelectionPage = lazy(() => import('../features/deck-selection/DeckSelectionPage'));
const CommunityPage = lazy(() => import('../features/community/CommunityPage'));
const DeckEditorPage = lazy(() => import('../features/deck-editor/DeckEditorPage'));
const ShelledLayout = lazy(() => import('./ShelledLayout'));

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingState fullscreen label="Loading..." />}>{children}</Suspense>;
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
        element: (
          <Lazy>
            <ShelledLayout />
          </Lazy>
        ),
        children: [
          { path: '/', element: <Navigate to="/home" replace /> },
          { path: '/home', element: <HomePage /> },
          { path: '/home/updates', element: <HomeUpdatesPage /> },
          { path: '/home/columbus-regional', element: <ColumbusRegionalPage /> },
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
