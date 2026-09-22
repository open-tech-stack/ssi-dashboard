// endpoints/prieres.endpoints.ts
export const PRIERES_ENDPOINTS = {
  list: '/prieres',
  detail: (id: string) => `/prieres/${id}`,
  remove: (id: string) => `/prieres/${id}`,
  restore: (id: string) => `/prieres/${id}/restore`,
  hardDelete: (id: string) => `/prieres/${id}/permanent`,
} as const;