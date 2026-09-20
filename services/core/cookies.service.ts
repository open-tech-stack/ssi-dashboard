// services/core/cookies.service.ts
/**
 * Gestion du cookie "user" côté front.
 */

import Cookies from 'js-cookie';

const USER_KEY = 'ssi.user';

const isProd = process.env.NODE_ENV === 'production';

export const userCookie = {
  get: <T = unknown>(): T | null => {
    const raw = Cookies.get(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  /**
    * Utilisé au login côté front, en complément du set côté backend.
   */
  set: (user: unknown) => {
    Cookies.set(USER_KEY, JSON.stringify(user), {
      expires: 7,
      sameSite: 'Lax',
      secure: isProd, // ✅ HTTP en dev, HTTPS en prod
    });
  },

  /**
   * Utilisé au logout côté front, en complément du clear côté backend.
   */
  clear: () => {
    Cookies.remove(USER_KEY, { path: '/' });
  },
};