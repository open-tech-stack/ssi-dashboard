// endpoints/people.endpoints.ts
export const PEOPLE_ENDPOINTS = {
  list: '/people',
  public: '/people/public',
  detail: (id: string) => `/people/${id}`,
  remove: (id: string) => `/people/${id}`,
  restore: (id: string) => `/people/${id}/restore`,
  hardDelete: (id: string) => `/people/${id}/permanent`,
} as const;