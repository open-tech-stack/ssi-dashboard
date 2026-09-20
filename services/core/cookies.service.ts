// services/core/cookies.service.ts
/**
 * Gestion centralisée des cookies d'authentification.
 * Les tokens sont stockés dans des cookies pour être accessibles
 * côté serveur (middleware, SSR).
 *
 * ⚠️ Pour un MVP admin interne. En production, préférer des cookies
 * httpOnly posés par le backend.
 */

import Cookies from 'js-cookie';

const KEYS = {
  accessToken: 'ssi.accessToken',
  refreshToken: 'ssi.refreshToken',
  user: 'ssi.user',
} as const;

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  expires: 7, // jours
  sameSite: 'Lax',
  // secure: true, // à activer en production HTTPS
};

export const accessTokenCookie = {
  get: () => Cookies.get(KEYS.accessToken) ?? null,
  set: (v: string) => Cookies.set(KEYS.accessToken, v, COOKIE_OPTIONS),
  clear: () => Cookies.remove(KEYS.accessToken),
};

export const refreshTokenCookie = {
  get: () => Cookies.get(KEYS.refreshToken) ?? null,
  set: (v: string) => Cookies.set(KEYS.refreshToken, v, COOKIE_OPTIONS),
  clear: () => Cookies.remove(KEYS.refreshToken),
};

export const userCookie = {
  get: <T = unknown>(): T | null => {
    const raw = Cookies.get(KEYS.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  set: (user: unknown) => Cookies.set(KEYS.user, JSON.stringify(user), COOKIE_OPTIONS),
  clear: () => Cookies.remove(KEYS.user),
};

export const authCookies = {
  clearAll: () => {
    accessTokenCookie.clear();
    refreshTokenCookie.clear();
    userCookie.clear();
  },
};