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
}

/** Payload d'un élément (pas d'id : généré côté serveur à la création) */
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
  page?: number;
  pageSize?: number;
}