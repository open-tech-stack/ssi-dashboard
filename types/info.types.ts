import { DeletedFilter } from "./evenement.types";

// types/info.types.ts
export type InfoPriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

/**
 * Filtre sur les entités supprimées (soft delete).
 */

export interface Info {
  id: string;
  title: string;
  summary: string;
  detail: string | null;
  priority: InfoPriority;
  notification: boolean;
  createdAt: string;
  updatedAt: string;

  /** Date de soft delete (null si actif) */
  deletedAt: string | null;

  /** Raccourci UI : true si soft-deleted */
  isDeleted: boolean;
}

export interface CreateInfoPayload {
  title: string;
  summary: string;
  detail?: string | null;
  priority?: InfoPriority;
  notification?: boolean;
}

export type UpdateInfoPayload = Partial<CreateInfoPayload>;

export interface ListInfosParams {
  q?: string;
  priority?: InfoPriority;
  deleted?: DeletedFilter;
  page?: number;
  pageSize?: number;
}

export const ALL_PRIORITIES: InfoPriority[] = [
  'NORMAL',
  'IMPORTANT',
  'URGENT',
];

export const INFO_PRIORITY_LABEL: Record<InfoPriority, string> = {
  NORMAL: 'Normale',
  IMPORTANT: 'Importante',
  URGENT: 'Urgente',
};