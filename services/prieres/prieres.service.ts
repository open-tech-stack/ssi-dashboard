// services/prieres/prieres.service.ts
import { PRIERES_ENDPOINTS } from '@/endpoints';
import { ListPrieresParams, PaginatedResponse, Priere, CreatePrierePayload, UpdatePrierePayload } from '@/types';
import { httpClient } from '../core/http.service';


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
      PRIERES_ENDPOINTS.remove(id),
    );
    return data;
  },

  async restore(id: string): Promise<Priere> {
    const { data } = await httpClient.patch<Priere>(
      PRIERES_ENDPOINTS.restore(id),
    );
    return data;
  },

  async hardDelete(id: string): Promise<{ success: boolean }> {
    const { data } = await httpClient.delete<{ success: boolean }>(
      PRIERES_ENDPOINTS.hardDelete(id),
    );
    return data;
  },
};