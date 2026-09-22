// services/infos/infos.service.ts
import { INFOS_ENDPOINTS } from '@/endpoints/infos.endpoints';
import { httpClient } from '@/services/core/http.service';
import type {
  CreateInfoPayload,
  Info,
  ListInfosParams,
  UpdateInfoPayload,
} from '@/types/info.types';
import type { PaginatedResponse } from '@/types/user.types';

export const infosService = {
  async list(params: ListInfosParams = {}): Promise<PaginatedResponse<Info>> {
    const { data } = await httpClient.get<PaginatedResponse<Info>>(
      INFOS_ENDPOINTS.list,
      { params },
    );
    return data;
  },

  async detail(id: string): Promise<Info> {
    const { data } = await httpClient.get<Info>(INFOS_ENDPOINTS.detail(id));
    return data;
  },

  async create(payload: CreateInfoPayload): Promise<Info> {
    const { data } = await httpClient.post<Info>(
      INFOS_ENDPOINTS.list,
      payload,
    );
    return data;
  },

  async update(id: string, payload: UpdateInfoPayload): Promise<Info> {
    const { data } = await httpClient.patch<Info>(
      INFOS_ENDPOINTS.detail(id),
      payload,
    );
    return data;
  },

  async remove(id: string): Promise<{ success: boolean }> {
    const { data } = await httpClient.delete<{ success: boolean }>(
      INFOS_ENDPOINTS.remove(id),
    );
    return data;
  },

  async restore(id: string): Promise<Info> {
    const { data } = await httpClient.patch<Info>(
      INFOS_ENDPOINTS.restore(id),
    );
    return data;
  },

  async hardDelete(id: string): Promise<{ success: boolean }> {
    const { data } = await httpClient.delete<{ success: boolean }>(
      INFOS_ENDPOINTS.hardDelete(id),
    );
    return data;
  },
};