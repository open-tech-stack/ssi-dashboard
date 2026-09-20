// types/priere.types.ts
export type PrierePriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

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
  page?: number;
  pageSize?: number;
}