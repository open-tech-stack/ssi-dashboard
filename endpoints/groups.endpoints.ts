// endpoints/groups.endpoints.ts
export const GROUPS_ENDPOINTS = {
  list: '/groups',
  detail: (id: string) => `/groups/${id}`,
} as const;