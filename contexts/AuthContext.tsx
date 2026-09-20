// contexts/AuthContext.tsx
'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { setSessionExpiredCallback } from '@/services/core/http.service';
import { authService } from '@/services/auth/auth.service';
import {
  accessTokenCookie,
  authCookies,
  refreshTokenCookie,
  userCookie,
} from '@/services/core/cookies.service';
import type { AuthUser } from '@/types/auth.types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (code: string) => Promise<'ok' | 'invalid' | 'forbidden' | 'error'>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restauration de session au démarrage (côté client)
  useEffect(() => {
    const stored = userCookie.get<AuthUser>();
    const access = accessTokenCookie.get();
    const refresh = refreshTokenCookie.get();

    if (stored && access && refresh) {
      setUser(stored);
    } else {
      authCookies.clearAll();
    }
    setLoading(false);
  }, []);

  // Callback global : session expirée
  useEffect(() => {
    setSessionExpiredCallback(() => {
      setUser(null);
    });
  }, []);

  const login = useCallback(
    async (code: string): Promise<'ok' | 'invalid' | 'forbidden' | 'error'> => {
      try {
        const res = await authService.login(code);

        // 🚫 Seuls les ADMIN peuvent accéder au dashboard
        if (res.user.role !== 'ADMIN') {
          return 'forbidden';
        }

        accessTokenCookie.set(res.accessToken);
        refreshTokenCookie.set(res.refreshToken);
        userCookie.set(res.user);

        setUser(res.user);
        return 'ok';
      } catch (err: any) {
        if (err?.response?.status === 401) return 'invalid';
        return 'error';
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    authCookies.clearAll();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
      login,
      logout,
    }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
}