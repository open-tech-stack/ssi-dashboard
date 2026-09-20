// endpoints/notifications.endpoints.ts
export const NOTIFICATIONS_ENDPOINTS = {
  list: '/notifications',
  unreadCount: '/notifications/unread-count',
  detail: (id: string) => `/notifications/${id}`,
  markRead: (id: string) => `/notifications/${id}/read`,
  markAllRead: '/notifications/read-all',
  deleteRead: '/notifications/read',
} as const;