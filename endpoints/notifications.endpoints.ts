// endpoints/notifications.endpoints.ts
export const NOTIFICATIONS_ENDPOINTS = {
  list: '/notifications',
  unreadCount: '/notifications/unread-count',
  detail: (id: string) => `/notifications/${id}`,
  markRead: (id: string) => `/notifications/${id}/read`,
  markAllRead: '/notifications/read-all',
  remove: (id: string) => `/notifications/${id}`,
  restore: (id: string) => `/notifications/${id}/restore`,
  hardDelete: (id: string) => `/notifications/${id}/permanent`,
} as const;