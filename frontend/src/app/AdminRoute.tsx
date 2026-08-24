import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { LoadingState } from '../components/LoadingState';

/** Hides admin-only views from authenticated non-admin users. */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState label="Loading Excelsior..." />;
  }
  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
}
