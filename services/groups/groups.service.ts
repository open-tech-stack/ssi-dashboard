// services/groups/groups.service.ts
import { GROUPS_ENDPOINTS } from '@/endpoints/groups.endpoints';
import { httpClient } from '@/services/core/http.service';
import type {
  CreateGroupPayload,
  Group,
  ListGroupsParams,
  UpdateGroupPayload,
} from '@/types/group.types';
import type { PaginatedResponse } from '@/types/user.types';

export const groupsService = {
  async list(params: ListGroupsParams = {}): Promise<PaginatedResponse<Group>> {
    const { data } = await httpClient.get<PaginatedResponse<Group>>(
      GROUPS_ENDPOINTS.list,
      { params },
    );
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
      GROUPS_ENDPOINTS.detail(id),
    );
    return data;
  },
};