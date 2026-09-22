import { DeletedFilter } from ".";

// types/rappel.types.ts
export type RappelPriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';


export interface RappelElement {
  id: string;
  text: string;
  order: number;
}

export interface Rappel {
  id: string;
  title: string;
  detail: string | null;
  priority: RappelPriority;
  notification: boolean;
  elements: RappelElement[];
  createdAt: string;
  updatedAt: string;

  /** Date de soft delete (null si actif) */
  deletedAt: string | null;

  /** Raccourci UI : true si soft-deleted */
  isDeleted: boolean;
}

export interface RappelElementPayload {
  text: string;
  order: number;
}

export interface CreateRappelPayload {
  title: string;
  detail?: string | null;
  priority?: RappelPriority;
  notification?: boolean;
  elements?: RappelElementPayload[];
}

export type UpdateRappelPayload = Partial<CreateRappelPayload>;

export interface ListRappelsParams {
  q?: string;
  priority?: RappelPriority;
  deleted?: DeletedFilter;
  page?: number;
  pageSize?: number;
}


export const RAPPEL_PRIORITY_LABEL: Record<RappelPriority, string> = {
  NORMAL: 'Normal',
  IMPORTANT: 'Important',
  URGENT: 'Urgent',
};