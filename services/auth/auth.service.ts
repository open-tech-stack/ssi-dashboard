// services/auth/auth.service.ts
import { AUTH_ENDPOINTS } from '@/endpoints/auth.endpoints';
import { httpClient } from '@/services/core/http.service';
import type {
  LoginResponse,
  MeResponse,
} from '@/types/auth.types';

export const authService = {
  /**
   * Login web.
   *
   * Le backend :
   *  - valide le code
   *  - pose les cookies httpOnly (accessToken, refreshToken, user)
   *  - renvoie uniquement `{ user }`
   *
   * Le front ne voit JAMAIS les tokens.
   */
  async login(code: string): Promise<LoginResponse> {
    const { data } = await httpClient.post<LoginResponse>(
      AUTH_ENDPOINTS.login,
      { code },
    );
    return data;
  },

  /**
   * Profil de l'utilisateur connecté.
   * Sert aussi à vérifier qu'une session cookie est valide.
   */
  async me(): Promise<MeResponse> {
    const { data } = await httpClient.get<MeResponse>(AUTH_ENDPOINTS.me);
    return data;
  },

  /**
   * Logout.
   * Le backend efface tous les cookies d'auth.
   * Le front n'a rien à nettoyer côté tokens.
   */
  async logout(): Promise<void> {
    try {
      await httpClient.post(AUTH_ENDPOINTS.logout);
    } catch {
    }
  },
};