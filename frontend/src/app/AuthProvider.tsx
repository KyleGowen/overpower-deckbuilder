/**
 * Auth context. Session-cookie based; loads the current user and app config
 * (CDN base + community guest id) via TanStack Query. Exposes login, signup,
 * guest login, Google sign-in and logout to the rest of the app.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchCurrentUser,
  fetchAppConfig,
  login as apiLogin,
  signUp as apiSignUp,
  loginAsGuest as apiLoginAsGuest,
  logout as apiLogout,
  fetchFirebaseConfig,
  completeGoogleSignIn,
} from '../lib/api/auth';
import type { AppUser } from '../lib/api/types';

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  isGuest: boolean;
  isAdmin: boolean;
  communityGuestUserId: string | null;
  login: (username: string, password: string) => Promise<AppUser | null>;
  signUp: (username: string, email: string, password: string) => Promise<AppUser | null>;
  loginAsGuest: () => Promise<AppUser | null>;
  signInWithGoogle: () => Promise<AppUser | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => fetchCurrentUser(),
    staleTime: 0,
  });

  const configQuery = useQuery({
    queryKey: ['app-config'],
    queryFn: () => fetchAppConfig(),
    staleTime: 30 * 60 * 1000,
  });

  const user = userQuery.data ?? null;

  const setUser = useCallback(
    (next: AppUser | null) => {
      queryClient.setQueryData(['auth', 'me'], next);
    },
    [queryClient],
  );

  const login = useCallback(
    async (username: string, password: string) => {
      const u = await apiLogin(username, password);
      setUser(u);
      return u;
    },
    [setUser],
  );

  const signUp = useCallback(
    async (username: string, email: string, password: string) => {
      const u = await apiSignUp(username, email, password);
      setUser(u);
      return u;
    },
    [setUser],
  );

  const loginAsGuest = useCallback(async () => {
    const u = await apiLoginAsGuest();
    setUser(u);
    return u;
  }, [setUser]);

  const signInWithGoogle = useCallback(async () => {
    const cfg = await fetchFirebaseConfig();
    if (!cfg) throw new Error('Google sign-in is not configured.');
    const [{ initializeApp, getApps }, { getAuth, GoogleAuthProvider, signInWithPopup }] =
      await Promise.all([import('firebase/app'), import('firebase/auth')]);
    const app = getApps().length ? getApps()[0] : initializeApp(cfg);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    const u = await completeGoogleSignIn(idToken);
    setUser(u);
    return u;
  }, [setUser]);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    queryClient.clear();
  }, [setUser, queryClient]);

  const refresh = useCallback(async () => {
    await userQuery.refetch();
  }, [userQuery]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading: userQuery.isLoading || configQuery.isLoading,
      isGuest: user?.role === 'GUEST',
      isAdmin: user?.role === 'ADMIN',
      communityGuestUserId: configQuery.data?.communityGuestUserId ?? null,
      login,
      signUp,
      loginAsGuest,
      signInWithGoogle,
      logout,
      refresh,
    }),
    [
      user,
      userQuery.isLoading,
      configQuery.isLoading,
      configQuery.data,
      login,
      signUp,
      loginAsGuest,
      signInWithGoogle,
      logout,
      refresh,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
