// services/evenements/evenements.service.ts
import { EVENEMENTS_ENDPOINTS } from '@/endpoints/evenements.endpoints';
import { httpClient } from '@/services/core/http.service';
import type {
  CreateEvenementPayload,
  Evenement,
  ListEvenementsParams,
  UpdateEvenementPayload,
} from '@/types/evenement.types';
import type { PaginatedResponse } from '@/types/user.types';

export const evenementsService = {
  async list(
    params: ListEvenementsParams = {},
  ): Promise<PaginatedResponse<Evenement>> {
    const { data } = await httpClient.get<PaginatedResponse<Evenement>>(
      EVENEMENTS_ENDPOINTS.list,
      { params },
    );
    return data;
  },

  async detail(id: string): Promise<Evenement> {
    const { data } = await httpClient.get<Evenement>(
      EVENEMENTS_ENDPOINTS.detail(id),
    );
    return data;
  },

  async create(payload: CreateEvenementPayload): Promise<Evenement> {
    const { data } = await httpClient.post<Evenement>(
      EVENEMENTS_ENDPOINTS.list,
      payload,
    );
    return data;
  },

  async update(
    id: string,
    payload: UpdateEvenementPayload,
  ): Promise<Evenement> {
    const { data } = await httpClient.patch<Evenement>(
      EVENEMENTS_ENDPOINTS.detail(id),
      payload,
    );
    return data;
  },

  /**
   * Soft delete → l'événement passe en corbeille.
   */
  async remove(id: string): Promise<{ success: boolean }> {
    const { data } = await httpClient.delete<{ success: boolean }>(
      EVENEMENTS_ENDPOINTS.remove(id),
    );
    return data;
  },

  /**
   * Restaure un événement précédemment soft-deleted.
   */
  async restore(id: string): Promise<Evenement> {
    const { data } = await httpClient.patch<Evenement>(
      EVENEMENTS_ENDPOINTS.restore(id),
    );
    return data;
  },

  /**
   * ⚠️ SUPPRESSION DÉFINITIVE — irréversible.
   */
  async hardDelete(id: string): Promise<{ success: boolean }> {
    const { data } = await httpClient.delete<{ success: boolean }>(
      EVENEMENTS_ENDPOINTS.hardDelete(id),
    );
    return data;
  },
};