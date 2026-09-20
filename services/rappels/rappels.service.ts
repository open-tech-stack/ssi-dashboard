// services/rappels/rappels.service.ts
import { RAPPELS_ENDPOINTS } from '@/endpoints/rappels.endpoints';
import { httpClient } from '@/services/core/http.service';
import type {
  CreateRappelPayload,
  ListRappelsParams,
  Rappel,
  UpdateRappelPayload,
} from '@/types/rappel.types';
import type { PaginatedResponse } from '@/types/user.types';

export const rappelsService = {
  async list(
    params: ListRappelsParams = {},
  ): Promise<PaginatedResponse<Rappel>> {
    const { data } = await httpClient.get<PaginatedResponse<Rappel>>(
      RAPPELS_ENDPOINTS.list,
      { params },
    );
    return data;
  },

  async detail(id: string): Promise<Rappel> {
    const { data } = await httpClient.get<Rappel>(
      RAPPELS_ENDPOINTS.detail(id),
    );
    return data;
  },

  async create(payload: CreateRappelPayload): Promise<Rappel> {
    const { data } = await httpClient.post<Rappel>(
      RAPPELS_ENDPOINTS.list,
      payload,
    );
    return data;
  },

  async update(id: string, payload: UpdateRappelPayload): Promise<Rappel> {
    const { data } = await httpClient.patch<Rappel>(
      RAPPELS_ENDPOINTS.detail(id),
      payload,
    );
    return data;
  },

  async remove(id: string): Promise<{ success: boolean }> {
    const { data } = await httpClient.delete<{ success: boolean }>(
      RAPPELS_ENDPOINTS.detail(id),
    );
    return data;
  },
};