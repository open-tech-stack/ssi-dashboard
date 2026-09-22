// types/group.types.ts

import { DeletedFilter } from ".";

export interface Group {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;

  /** Date de soft delete (null si actif) */
  deletedAt: string | null;

  /** Raccourci UI : true si soft-deleted */
  isDeleted: boolean;
}

export interface CreateGroupPayload {
  name: string;
  description?: string | null;
}

export interface UpdateGroupPayload {
  name?: string;
  description?: string | null;
}

export interface ListGroupsParams {
  q?: string;
  deleted?: DeletedFilter;
  page?: number;
  pageSize?: number;
}