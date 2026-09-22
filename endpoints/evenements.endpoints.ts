// endpoints/evenements.endpoints.ts
export const EVENEMENTS_ENDPOINTS = {
  list: '/evenements',
  detail: (id: string) => `/evenements/${id}`,
  /** Soft delete → corbeille */
  remove: (id: string) => `/evenements/${id}`,
  /** Restaure un événement soft-deleted */
  restore: (id: string) => `/evenements/${id}/restore`,
  /** Suppression DÉFINITIVE, irréversible */
  hardDelete: (id: string) => `/evenements/${id}/permanent`,
} as const;