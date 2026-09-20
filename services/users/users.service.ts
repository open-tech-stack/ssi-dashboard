// services/users/users.service.ts
import { USERS_ENDPOINTS } from '@/endpoints/users.endpoints';
import { httpClient } from '@/services/core/http.service';
import type {
  CreateUserPayload,
  ListUsersParams,
  PaginatedResponse,
  UpdateUserPayload,
  User,
} from '@/types/user.types';

export const usersService = {
  async list(params: ListUsersParams = {}): Promise<PaginatedResponse<User>> {
    const { data } = await httpClient.get<PaginatedResponse<User>>(
      USERS_ENDPOINTS.list,
      { params },
    );
    return data;
  },

  async detail(id: string): Promise<User> {
    const { data } = await httpClient.get<User>(USERS_ENDPOINTS.detail(id));
    return data;
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await httpClient.post<User>(USERS_ENDPOINTS.list, payload);
    return data;
  },

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const { data } = await httpClient.patch<User>(
      USERS_ENDPOINTS.detail(id),
      payload,
    );
    return data;
  },

  async remove(id: string): Promise<{ success: boolean }> {
    const { data } = await httpClient.delete<{ success: boolean }>(
      USERS_ENDPOINTS.detail(id),
    );
    return data;
  },
};