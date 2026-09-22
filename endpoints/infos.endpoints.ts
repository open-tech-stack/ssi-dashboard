// endpoints/infos.endpoints.ts
export const INFOS_ENDPOINTS = {
  list: '/infos',
  detail: (id: string) => `/infos/${id}`,
  remove: (id: string) => `/infos/${id}`,
  restore: (id: string) => `/infos/${id}/restore`,
  hardDelete: (id: string) => `/infos/${id}/permanent`,
} as const;