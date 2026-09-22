// endpoints/groups.endpoints.ts
export const GROUPS_ENDPOINTS = {
  list: '/groups',
  detail: (id: string) => `/groups/${id}`,
  remove: (id: string) => `/groups/${id}`,
  restore: (id: string) => `/groups/${id}/restore`,
  hardDelete: (id: string) => `/groups/${id}/permanent`,
} as const;