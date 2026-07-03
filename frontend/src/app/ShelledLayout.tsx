import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { LoadingState } from '../components/LoadingState';
import { ProtectedRoute } from './ProtectedRoute';

/** Protected app chrome (nav + mobile bottom nav) wrapping route outlets. */
export default function ShelledLayout() {
  return (
    <ProtectedRoute>
      <AppShell>
        <Suspense fallback={<LoadingState label="Loading..." />}>
          <Outlet />
        </Suspense>
      </AppShell>
    </ProtectedRoute>
  );
}
