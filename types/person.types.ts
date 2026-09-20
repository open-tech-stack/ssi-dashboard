// types/person.types.ts
export interface Person {
  id: string;
  firstName: string;
  lastName: string | null;
  fullName: string;
  role: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
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
  page?: number;
  pageSize?: number;
}