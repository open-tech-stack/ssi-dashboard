// endpoints/rappels.endpoints.ts
export const RAPPELS_ENDPOINTS = {
  list: '/rappels',
  detail: (id: string) => `/rappels/${id}`,
  remove: (id: string) => `/rappels/${id}`,
  restore: (id: string) => `/rappels/${id}/restore`,
  hardDelete: (id: string) => `/rappels/${id}/permanent`,
} as const;