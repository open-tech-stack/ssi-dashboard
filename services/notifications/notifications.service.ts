// services/notifications/notifications.service.ts
import { NOTIFICATIONS_ENDPOINTS } from '@/endpoints/notifications.endpoints';
import { httpClient } from '@/services/core/http.service';
import { ListNotificationsParams, PaginatedResponse, CreateNotificationPayload } from '@/types';


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

  /**
   * Soft delete (GLOBAL, admin uniquement).
   * La notification disparaît pour tous les utilisateurs.
   */
  async remove(id: string): Promise<{ success: boolean }> {
    const { data } = await httpClient.delete<{ success: boolean }>(
      NOTIFICATIONS_ENDPOINTS.remove(id),
    );
    return data;
  },

  /** Restaure une notification soft-deleted (admin). */
  async restore(id: string): Promise<Notification> {
    const { data } = await httpClient.patch<Notification>(
      NOTIFICATIONS_ENDPOINTS.restore(id),
    );
    return data;
  },

  /** Suppression définitive, irréversible (admin). */
  async hardDelete(id: string): Promise<{ success: boolean }> {
    const { data } = await httpClient.delete<{ success: boolean }>(
      NOTIFICATIONS_ENDPOINTS.hardDelete(id),
    );
    return data;
  },
};