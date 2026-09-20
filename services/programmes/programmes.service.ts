// services/programmes/programmes.service.ts
import { PROGRAMMES_ENDPOINTS } from '@/endpoints/programmes.endpoints';
import { httpClient } from '@/services/core/http.service';
import type {
  CreateProgrammePayload,
  ListProgrammesParams,
  Programme,
  UpdateProgrammePayload,
} from '@/types/programme.types';
import type { PaginatedResponse } from '@/types/user.types';

export const programmesService = {
  async list(
    params: ListProgrammesParams = {},
  ): Promise<PaginatedResponse<Programme>> {
    const { data } = await httpClient.get<PaginatedResponse<Programme>>(
      PROGRAMMES_ENDPOINTS.list,
      { params },
    );
    return data;
  },

  async detail(id: string): Promise<Programme> {
    const { data } = await httpClient.get<Programme>(
      PROGRAMMES_ENDPOINTS.detail(id),
    );
    return data;
  },

  async create(payload: CreateProgrammePayload): Promise<Programme> {
    const { data } = await httpClient.post<Programme>(
      PROGRAMMES_ENDPOINTS.list,
      payload,
    );
    return data;
  },

  async update(id: string, payload: UpdateProgrammePayload): Promise<Programme> {
    const { data } = await httpClient.patch<Programme>(
      PROGRAMMES_ENDPOINTS.detail(id),
      payload,
    );
    return data;
  },

  async remove(id: string): Promise<{ success: boolean }> {
    const { data } = await httpClient.delete<{ success: boolean }>(
      PROGRAMMES_ENDPOINTS.detail(id),
    );
    return data;
  },
};