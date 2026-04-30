import { create } from "zustand";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotificationApi,
} from "@/src/api/services/notifications";

export type NotificationType =
  | "testimonial_created"
  | "testimonial_updated"
  | "project_created"
  | "project_updated"
  | "service_created"
  | "service_updated"
  | "query_submitted";

export type Notification = {
  id: number;
  title: string;
  body: string;
  type: NotificationType;
  is_read: boolean;
  data: Record<string, unknown>;
  created_at: string;
};

type NotificationStore = {
  notifications: Notification[];
  unreadCount: number;
  activeFilter: string;
  loading: boolean;
  setActiveFilter: (v: string) => void;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  activeFilter: "All",
  loading: false,

  setActiveFilter: (v) => set({ activeFilter: v }),

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const raw = await getNotifications();
      // Handle all possible response shapes
      let list: Notification[] = [];
      if (Array.isArray(raw)) {
        list = raw;
      } else if (raw && Array.isArray(raw.results)) {
        list = raw.results;
      }
      set({ notifications: list, unreadCount: list.filter((n: Notification) => !n.is_read).length });
    } finally {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const data = await getUnreadCount();
      set({ unreadCount: data.count ?? data.unread_count ?? 0 });
    } catch {}
  },

  markRead: async (id) => {
    await markNotificationRead(id);
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await markAllNotificationsRead();
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));
  },

  deleteNotification: async (id) => {
    await deleteNotificationApi(id);
    const wasUnread = get().notifications.find((n) => n.id === id)?.is_read === false;
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
      unreadCount: wasUnread ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
    }));
  },
}));
