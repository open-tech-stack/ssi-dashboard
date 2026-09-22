// endpoints/programmes.endpoints.ts
export const PROGRAMMES_ENDPOINTS = {
  list: '/programmes',
  detail: (id: string) => `/programmes/${id}`,
  /** Soft delete → corbeille */
  remove: (id: string) => `/programmes/${id}`,
  /** Restaure un programme soft-deleted */
  restore: (id: string) => `/programmes/${id}/restore`,
  /** Suppression DÉFINITIVE, irréversible */
  hardDelete: (id: string) => `/programmes/${id}/permanent`,
} as const;