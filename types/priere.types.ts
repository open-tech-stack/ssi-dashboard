import { DeletedFilter } from ".";

// types/priere.types.ts
export type PrierePriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

/**
 * Filtre sur les entités supprimées (soft delete).
 */

export interface Priere {
  id: string;
  title: string;
  date: string | null;
  location: string | null;
  detail: string | null;
  priority: PrierePriority;
  notification: boolean;
  createdAt: string;
  updatedAt: string;

  /** Date de soft delete (null si actif) */
  deletedAt: string | null;

  /** Raccourci UI : true si soft-deleted */
  isDeleted: boolean;
}

export interface CreatePrierePayload {
  title: string;
  date?: string | null;
  location?: string | null;
  detail?: string | null;
  priority?: PrierePriority;
  notification?: boolean;
}

export type UpdatePrierePayload = Partial<CreatePrierePayload>;

export interface ListPrieresParams {
  q?: string;
  priority?: PrierePriority;
  deleted?: DeletedFilter;
  page?: number;
  pageSize?: number;
}


export const PRIERE_PRIORITY_LABEL: Record<PrierePriority, string> = {
  NORMAL: 'Normale',
  IMPORTANT: 'Importante',
  URGENT: 'Urgente',
};