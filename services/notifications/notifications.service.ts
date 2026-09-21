// services/notifications/notifications.service.ts
import { NOTIFICATIONS_ENDPOINTS } from '@/endpoints/notifications.endpoints';
import { httpClient } from '@/services/core/http.service';
import type {
  CreateNotificationPayload,
  ListNotificationsParams,
  Notification,
} from '@/types/notification.types';
import type { PaginatedResponse } from '@/types/user.types';

export const notificationsService = {
  async list(
    params: ListNotificationsParams = {},
  ): Promise<PaginatedResponse<Notification>> {
    const { data } = await httpClient.get<PaginatedResponse<Notification>>(
      NOTIFICATIONS_ENDPOINTS.list,
      { params },
    );
    return data;
  },

  async detail(id: string): Promise<Notification> {
    const { data } = await httpClient.get<Notification>(
      NOTIFICATIONS_ENDPOINTS.detail(id),
    );
    return data;
  },

  async unreadCount(): Promise<{ count: number }> {
    const { data } = await httpClient.get<{ count: number }>(
      NOTIFICATIONS_ENDPOINTS.unreadCount,
    );
    return data;
  },

  async markRead(id: string): Promise<{ success: boolean }> {
    const { data } = await httpClient.patch<{ success: boolean }>(
      NOTIFICATIONS_ENDPOINTS.markRead(id),
    );
    return data;
  },

  async markAllRead(): Promise<{ success: boolean; count: number }> {
    const { data } = await httpClient.patch<{ success: boolean; count: number }>(
      NOTIFICATIONS_ENDPOINTS.markAllRead,
    );
    return data;
  },

  async create(payload: CreateNotificationPayload): Promise<Notification> {
    const { data } = await httpClient.post<Notification>(
      NOTIFICATIONS_ENDPOINTS.list,
      payload,
    );
    return data;
  },

  async remove(id: string): Promise<{ success: boolean }> {
    const { data } = await httpClient.delete<{ success: boolean }>(
      NOTIFICATIONS_ENDPOINTS.detail(id),
    );
    return data;
  },

  async removeAllRead(): Promise<{ success: boolean; count: number }> {
    const { data } = await httpClient.delete<{ success: boolean; count: number }>(
      NOTIFICATIONS_ENDPOINTS.deleteRead,
    );
    return data;
  },
};