export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
  },
  CONTACT:{
    SEND:'/contact-queries/',
    RECEIVE:'/contact-queries/',
    GET_ALL:'/contact-queries/',
    MARK_READ: (id: number) => `/contact-queries/${id}/mark-read/`,
    MARK_ALLREAD: '/contact-queries/mark-all-read/',
    DELETE: (id: number) => `/contact-queries/${id}/`,
  },
  NOTIFICATIONS: {
    GET_ALL: '/notifications/',
    MARK_READ: (id: number) => `/notifications/${id}/mark-read/`,
    MARK_ALLREAD: '/notifications/mark-all-read/',
    GET_UNREAD_COUNT: '/notifications/unread-count/',
  },
  PORTFOLIO: {
    GET_ALL: '/portfolio/',
    CREATE: '/portfolio/',
    UPDATE: (id: number) => `/portfolio/${id}/`,
    DELETE: (id: number) => `/portfolio/${id}/`,
  },
  TESTIMONIAL: {
    GET_ALL: '/testimonial/',
    CREATE: '/testimonial/',
    UPDATE: (id: number) => `/testimonial/${id}/`,
    DELETE: (id: number) => `/testimonial/${id}/`,
  },
  ROLES: {
    GET_ALL: '/auth/users/',
    CREATE: '/auth/users/',
    UPDATE: (id: number) => `/auth/users/${id}/`,
    DELETE: (id: number) => `/auth/users/${id}/`,
    REVOKE: (id: number) => `/auth/users/${id}/revoke/`,
  },
  SERVICES: {
    GET_ALL: '/services/',
    CREATE: '/services/',
    UPDATE: (id: number) => `/services/${id}/`,
    DELETE: (id: number) => `/services/${id}/`,
  },
}