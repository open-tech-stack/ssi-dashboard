// endpoints/programmes.endpoints.ts
export const PROGRAMMES_ENDPOINTS = {
  list: '/programmes',
  detail: (id: string) => `/programmes/${id}`,
} as const;