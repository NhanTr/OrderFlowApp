import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

import { authEndpoints } from '@/api/endpoints/auth';
import type { LoginRequestDto } from '@/api/dto';
import type { AuthUser } from '@/types';
import { clearPersistedQueryCache } from '@/query/persistence';

import { authSession } from './session';

type AuthContextValue = {
  isAuthenticated: boolean;
  isRestoring: boolean;
  login: (credentials: LoginRequestDto) => Promise<void>;
  logout: () => Promise<void>;
  user: AuthUser | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const session = useSyncExternalStore(
    authSession.subscribe,
    authSession.getSnapshot,
    authSession.getSnapshot,
  );
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let active = true;

    authSession
      .restore()
      .catch(() => undefined)
      .finally(() => {
        if (active) setIsRestoring(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isRestoring && session.user === null) {
      queryClient.clear();
      void clearPersistedQueryCache();
    }
  }, [isRestoring, queryClient, session.user]);

  const login = useCallback(async (credentials: LoginRequestDto) => {
    const nextSession = await authEndpoints.login(credentials);
    await authSession.establish(nextSession);
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await authSession.getRefreshToken();
      if (refreshToken) {
        await authEndpoints.logout({ refreshToken });
      }
    } finally {
      queryClient.clear();
      await Promise.allSettled([authSession.clear(), clearPersistedQueryCache()]);
    }
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: session.user !== null,
      isRestoring,
      login,
      logout,
      user: session.user,
    }),
    [isRestoring, login, logout, session.user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
