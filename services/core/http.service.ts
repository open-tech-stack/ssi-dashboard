// services/core/http.service.ts
/**
 * Client HTTP axios pour le dashboard.
 *
 * - Envoie automatiquement les cookies httpOnly (withCredentials).
 * - Ajoute le header `X-Client: web` sur chaque requête pour que le
 *   backend sache qu'il doit poser des cookies (et pas renvoyer les
 *   tokens dans le body).
 * - Intercepte les 401 pour tenter un refresh silencieux.
 * - Si le refresh échoue → on notifie la session expirée (AuthContext)
 *   qui redirige vers /login.
 *
 * ⚠️ Plus de gestion manuelle des tokens : ils sont httpOnly.
 *    Le navigateur les transporte, on n'y touche jamais.
 */

import axios, { AxiosError, AxiosInstance } from 'axios';

import { ENV } from '@/config/env';
import { AUTH_ENDPOINTS } from '@/endpoints/auth.endpoints';

// ------------------------------------------------------------------
// Instance principale
// ------------------------------------------------------------------
export const httpClient: AxiosInstance = axios.create({
  baseURL: ENV.API_URL,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ------------------------------------------------------------------
// Interceptor requête : ajoute le header X-Client: web
// ------------------------------------------------------------------
httpClient.interceptors.request.use((config) => {
  config.headers.set('X-Client', 'web');
  return config;
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
// Interceptor réponse : gère le 401 → refresh → retry
// ------------------------------------------------------------------
let isRefreshing = false;
let pendingRequests: Array<(ok: boolean) => void> = [];

function subscribe(cb: (ok: boolean) => void) {
  pendingRequests.push(cb);
}
function flush(ok: boolean) {
  pendingRequests.forEach((cb) => cb(ok));
  pendingRequests = [];
}

const AUTH_ENDPOINTS_TO_SKIP = [
  AUTH_ENDPOINTS.login,
  AUTH_ENDPOINTS.refresh,
];

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Pas de réponse serveur (réseau, timeout, etc.)
    if (!error.response) return Promise.reject(error);

    const url = originalRequest?.url ?? '';
    const isAuthRoute = AUTH_ENDPOINTS_TO_SKIP.some((p) => url.includes(p));

    // 401 sur une route protégée → tentative de refresh
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      // Un refresh est déjà en cours → on met en file d'attente
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribe((ok) => {
            if (!ok) return reject(error);
            resolve(httpClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // ⚠️ Pas de body : le refreshToken est dans le cookie httpOnly
        //    limité à Path=/api/auth → il part tout seul.
        await axios.post(
          `${ENV.API_URL}${AUTH_ENDPOINTS.refresh}`,
          {},
          {
            withCredentials: true,
            headers: { 'X-Client': 'web' },
            timeout: 20000,
          },
        );

        isRefreshing = false;
        flush(true);

        // Rejoue la requête originale (les nouveaux cookies sont en place)
        return httpClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        flush(false);

        // Notifie le contexte (qui videra l'UI + redirigera)
        onSessionExpired?.();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);