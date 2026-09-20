// endpoints/prieres.endpoints.ts
export const PRIERES_ENDPOINTS = {
  list: '/prieres',
  detail: (id: string) => `/prieres/${id}`,
} as const;