// endpoints/rappels.endpoints.ts
export const RAPPELS_ENDPOINTS = {
  list: '/rappels',
  detail: (id: string) => `/rappels/${id}`,
} as const;