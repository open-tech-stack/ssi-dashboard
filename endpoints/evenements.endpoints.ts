// endpoints/evenements.endpoints.ts
export const EVENEMENTS_ENDPOINTS = {
  list: '/evenements',
  detail: (id: string) => `/evenements/${id}`,
} as const;