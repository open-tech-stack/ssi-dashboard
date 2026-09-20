// types/user.types.ts
import type { UserRole } from './auth.types';

export interface User {
  id: string;
  code: string;
  role: UserRole;
  personId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  role: UserRole;
  personId?: string | null;
}

export interface UpdateUserPayload {
  role?: UserRole;
  personId?: string | null;
}

export interface ListUsersParams {
  role?: UserRole;
  code?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}