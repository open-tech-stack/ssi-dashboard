// endpoints/people.endpoints.ts
export const PEOPLE_ENDPOINTS = {
  list: '/people',
  public: '/people/public',
  detail: (id: string) => `/people/${id}`,
} as const;