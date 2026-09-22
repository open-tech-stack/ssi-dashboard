import { DeletedFilter } from ".";

// types/notification.types.ts
export type NotificationType =
  | 'PROGRAMME'
  | 'EVENEMENT'
  | 'INFO'
  | 'PRIERE'
  | 'RAPPEL'
  | 'GENERIC';

/**
 * Filtre sur les entités supprimées (soft delete).
 */

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

  /** Date de soft delete (null si active) */
  deletedAt: string | null;

  /** Raccourci UI : true si soft-deleted */
  isDeleted: boolean;
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
  deleted?: DeletedFilter;
  page?: number;
  pageSize?: number;
}

export const ALL_NOTIFICATION_TYPES: NotificationType[] = [
  'PROGRAMME',
  'EVENEMENT',
  'INFO',
  'PRIERE',
  'RAPPEL',
  'GENERIC',
];

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
  PROGRAMME: 'Programme',
  EVENEMENT: 'Événement',
  INFO: 'Info',
  PRIERE: 'Prière',
  RAPPEL: 'Rappel',
  GENERIC: 'Générique',
};