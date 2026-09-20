// services/auth/auth.service.ts
import { AUTH_ENDPOINTS } from '@/endpoints/auth.endpoints';
import { httpClient } from '@/services/core/http.service';
import type {
  AuthTokensResponse,
  LoginRequest,
  MeResponse,
  RefreshRequest,
} from '@/types/auth.types';

export const authService = {
  async login(code: string): Promise<AuthTokensResponse> {
    const { data } = await httpClient.post<AuthTokensResponse>(
      AUTH_ENDPOINTS.login,
      { code } satisfies LoginRequest,
    );
    return data;
  },

  async refresh(refreshToken: string): Promise<AuthTokensResponse> {
    const { data } = await httpClient.post<AuthTokensResponse>(
      AUTH_ENDPOINTS.refresh,
      { refreshToken } satisfies RefreshRequest,
    );
    return data;
  },

  async me(): Promise<MeResponse> {
    const { data } = await httpClient.get<MeResponse>(AUTH_ENDPOINTS.me);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await httpClient.post(AUTH_ENDPOINTS.logout);
    } catch {
      // silencieux
    }
  },
};