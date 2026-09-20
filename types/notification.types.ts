// types/notification.types.ts
export type NotificationType =
  | 'PROGRAMME'
  | 'EVENEMENT'
  | 'INFO'
  | 'PRIERE'
  | 'RAPPEL'
  | 'GENERIC';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  linkTo: string | null;
  sourceId: string | null;
  read: boolean;
  pushed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  linkTo?: string | null;
  sourceId?: string | null;
}

export interface ListNotificationsParams {
  type?: NotificationType;
  read?: boolean;
  page?: number;
  pageSize?: number;
}