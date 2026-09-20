// services/core/http.service.ts
/**
 * Client HTTP axios pour le dashboard.
 *
 * - Ajoute automatiquement l'access token dans chaque requête.
 * - Intercepte les 401 pour tenter un refresh automatique.
 * - Si le refresh échoue → on vide la session et on redirige vers /login.
 *
 * Un système de "queue" empêche plusieurs refresh simultanés.
 */

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

import { ENV } from '@/config/env';
import {
  accessTokenCookie,
  authCookies,
  refreshTokenCookie,
} from '@/services/core/cookies.service';
import { AUTH_ENDPOINTS } from '@/endpoints/auth.endpoints';

// ------------------------------------------------------------------
// Instance principale
// ------------------------------------------------------------------
export const httpClient: AxiosInstance = axios.create({
  baseURL: ENV.API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ------------------------------------------------------------------
// Callback global : appelé quand la session est invalide
// ------------------------------------------------------------------
type SessionExpiredCallback = () => void;
let onSessionExpired: SessionExpiredCallback | null = null;
export function setSessionExpiredCallback(cb: SessionExpiredCallback) {
  onSessionExpired = cb;
}

// ------------------------------------------------------------------
// Interceptor requête : ajoute l'access token
// ------------------------------------------------------------------
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = accessTokenCookie.get();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ------------------------------------------------------------------
// Interceptor réponse : gère le 401 → refresh → retry
// ------------------------------------------------------------------
let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  pendingRequests.push(cb);
}

function onRefreshed(token: string | null) {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
}

const AUTH_ENDPOINTS_TO_SKIP = [
  AUTH_ENDPOINTS.login,
  AUTH_ENDPOINTS.refresh,
];

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response) return Promise.reject(error);

    const url = originalRequest.url ?? '';
    const isAuthRoute = AUTH_ENDPOINTS_TO_SKIP.some((p) => url.includes(p));

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (!newToken) return reject(error);
            if (originalRequest.headers) {
              (originalRequest.headers as Record<string, string>)[
                'Authorization'
              ] = `Bearer ${newToken}`;
            }
            resolve(httpClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = refreshTokenCookie.get();
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${ENV.API_URL}${AUTH_ENDPOINTS.refresh}`,
          { refreshToken },
          { timeout: 20000 },
        );

        const newAccessToken: string = data.accessToken;
        const newRefreshToken: string = data.refreshToken;

        accessTokenCookie.set(newAccessToken);
        refreshTokenCookie.set(newRefreshToken);

        isRefreshing = false;
        onRefreshed(newAccessToken);

        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>)['Authorization'] =
            `Bearer ${newAccessToken}`;
        }
        return httpClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        onRefreshed(null);
        authCookies.clearAll();
        onSessionExpired?.();

        // Redirige vers /login si on est côté navigateur
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);