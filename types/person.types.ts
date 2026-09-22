// types/person.types.ts

import { DeletedFilter } from ".";

export interface Person {
  id: string;
  firstName: string;
  lastName: string | null;
  fullName: string;
  role: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;

  /** Date de soft delete (null si actif) */
  deletedAt: string | null;

  /** Raccourci UI : true si soft-deleted */
  isDeleted: boolean;
}

export interface CreatePersonPayload {
  firstName: string;
  lastName?: string | null;
  fullName?: string;
  role?: string | null;
  avatar?: string | null;
}

export interface UpdatePersonPayload {
  firstName?: string;
  lastName?: string | null;
  fullName?: string;
  role?: string | null;
  avatar?: string | null;
}

export interface ListPeopleParams {
  q?: string;
  deleted?: DeletedFilter;
  page?: number;
  pageSize?: number;
}