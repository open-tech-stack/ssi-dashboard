// types/info.types.ts
export type InfoPriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

export interface Info {
  id: string;
  title: string;
  summary: string;
  detail: string | null;
  priority: InfoPriority;
  notification: boolean;
  createdAt: string;
  updatedAt: string;
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
  page?: number;
  pageSize?: number;
}