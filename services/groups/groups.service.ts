// services/groups/groups.service.ts
import { GROUPS_ENDPOINTS } from '@/endpoints/groups.endpoints';
import { httpClient } from '@/services/core/http.service';
import { ListGroupsParams, PaginatedResponse, Group, CreateGroupPayload, UpdateGroupPayload } from '@/types';


export const groupsService = {
  async list(
    params: ListGroupsParams = {},
  ): Promise<PaginatedResponse<Group>> {
    const { data } = await httpClient.get<PaginatedResponse<Group>>(
      GROUPS_ENDPOINTS.list,
      { params },
    );
    return data;
  },

  async detail(id: string): Promise<Group> {
    const { data } = await httpClient.get<Group>(GROUPS_ENDPOINTS.detail(id));
    return data;
  },

  async create(payload: CreateGroupPayload): Promise<Group> {
    const { data } = await httpClient.post<Group>(
      GROUPS_ENDPOINTS.list,
      payload,
    );
    return data;
  },

  async update(id: string, payload: UpdateGroupPayload): Promise<Group> {
    const { data } = await httpClient.patch<Group>(
      GROUPS_ENDPOINTS.detail(id),
      payload,
    );
    return data;
  },

  async remove(id: string): Promise<{ success: boolean }> {
    const { data } = await httpClient.delete<{ success: boolean }>(
      GROUPS_ENDPOINTS.remove(id),
    );
    return data;
  },

  async restore(id: string): Promise<Group> {
    const { data } = await httpClient.patch<Group>(
      GROUPS_ENDPOINTS.restore(id),
    );
    return data;
  },

  async hardDelete(id: string): Promise<{ success: boolean }> {
    const { data } = await httpClient.delete<{ success: boolean }>(
      GROUPS_ENDPOINTS.hardDelete(id),
    );
    return data;
  },
};