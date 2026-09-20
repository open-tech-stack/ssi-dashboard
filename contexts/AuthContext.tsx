// contexts/AuthContext.tsx
'use client';

import { useRouter } from 'next/navigation';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { authService } from '@/services/auth/auth.service';
import { userCookie } from '@/services/core/cookies.service';
import { setSessionExpiredCallback } from '@/services/core/http.service';
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
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------------------------------------------
  // Boot : on tente /auth/me pour valider la session (cookie httpOnly)
  // ------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // pour éviter un flash de "loading" si l'utilisateur est déjà connecté.
      const cached = userCookie.get<AuthUser>();
      if (cached && !cancelled) {
        setUser(cached);
      }

      try {
        // Vérification côté serveur : le cookie httpOnly est-il valide ?
        const me = await authService.me();
        if (!cancelled) {
          setUser(me);
          // Rafraîchit le cookie user (au cas où il aurait expiré)
          userCookie.set(me);
        }
      } catch {
        // Session invalide ou expirée : on nettoie
        if (!cancelled) {
          userCookie.clear();
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ------------------------------------------------------------------
  // Callback global : session expirée (déclenchée par http.service)
  // ------------------------------------------------------------------
  useEffect(() => {
    setSessionExpiredCallback(() => {
      setUser(null);
      userCookie.clear();
      router.replace('/login');
    });
  }, [router]);

  // ------------------------------------------------------------------
  // Login
  // ------------------------------------------------------------------
  const login = useCallback(
    async (code: string): Promise<'ok' | 'invalid' | 'forbidden' | 'error'> => {
      try {
        const res = await authService.login(code);

        if (res.user.role !== 'ADMIN') {
          return 'forbidden';
        }
        setUser(res.user);

        return 'ok';
      } catch (err: any) {
        if (err?.response?.status === 401) return 'invalid';
        if (err?.response?.status === 403) return 'forbidden';
        return 'error';
      }
    },
    [],
  );

  // ------------------------------------------------------------------
  // Logout
  // ------------------------------------------------------------------
  const logout = useCallback(async () => {
    try {
      await authService.logout(); // le backend efface les cookies
    } finally {
      userCookie.clear();
      setUser(null);
      router.replace('/login');
    }
  }, [router]);

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