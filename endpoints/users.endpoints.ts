// endpoints/users.endpoints.ts
export const USERS_ENDPOINTS = {
  list: '/users',
  detail: (id: string) => `/users/${id}`,
} as const;