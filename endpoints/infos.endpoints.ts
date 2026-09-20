// endpoints/infos.endpoints.ts
export const INFOS_ENDPOINTS = {
  list: '/infos',
  detail: (id: string) => `/infos/${id}`,
} as const;