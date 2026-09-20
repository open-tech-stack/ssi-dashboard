// services/prieres/prieres.service.ts
import { PRIERES_ENDPOINTS } from '@/endpoints/prieres.endpoints';
import { httpClient } from '@/services/core/http.service';
import type {
  CreatePrierePayload,
  ListPrieresParams,
  Priere,
  UpdatePrierePayload,
} from '@/types/priere.types';
import type { PaginatedResponse } from '@/types/user.types';

export const prieresService = {
  async list(
    params: ListPrieresParams = {},
  ): Promise<PaginatedResponse<Priere>> {
    const { data } = await httpClient.get<PaginatedResponse<Priere>>(
      PRIERES_ENDPOINTS.list,
      { params },
    );
    return data;
  },

  async detail(id: string): Promise<Priere> {
    const { data } = await httpClient.get<Priere>(
      PRIERES_ENDPOINTS.detail(id),
    );
    return data;
  },

  async create(payload: CreatePrierePayload): Promise<Priere> {
    const { data } = await httpClient.post<Priere>(
      PRIERES_ENDPOINTS.list,
      payload,
    );
    return data;
  },

  async update(id: string, payload: UpdatePrierePayload): Promise<Priere> {
    const { data } = await httpClient.patch<Priere>(
      PRIERES_ENDPOINTS.detail(id),
      payload,
    );
    return data;
  },

  async remove(id: string): Promise<{ success: boolean }> {
    const { data } = await httpClient.delete<{ success: boolean }>(
      PRIERES_ENDPOINTS.detail(id),
    );
    return data;
  },
};