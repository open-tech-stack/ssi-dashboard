// types/group.types.ts
export interface Group {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
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
  page?: number;
  pageSize?: number;
}