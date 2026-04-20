import { create } from "zustand";

export type NotificationType = "message" | "project" | "testimonial" | "system";

export type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  desc: string;
  time: string;
  read: boolean;
};

type NotificationStore = {
  notifications: Notification[];
  activeFilter: string;
  setActiveFilter: (v: string) => void;
  markRead: (id: number) => void;
  markAllRead: () => void;
  deleteNotification: (id: number) => void;
  unreadCount: () => number;
};

const initialNotifications: Notification[] = [
  { id: 1,  type: "message",     title: "New contact query",       desc: "Sarah Johnson sent a project inquiry about an e-commerce platform.",          time: "2 minutes ago", read: false },
  { id: 2,  type: "project",     title: "Project updated",         desc: "E-Commerce Platform has been marked as Live.",                                 time: "1 hour ago",    read: false },
  { id: 3,  type: "testimonial", title: "New testimonial",         desc: "Ali Hassan left a 5-star review. Awaiting your approval.",                    time: "3 hours ago",   read: false },
  { id: 4,  type: "message",     title: "New contact query",       desc: "Emily Clarke asked about your availability for a React project.",             time: "1 day ago",     read: true  },
  { id: 5,  type: "project",     title: "Project archived",        desc: "Blog Platform has been moved to Archived status.",                            time: "2 days ago",    read: true  },
  { id: 6,  type: "system",      title: "Portfolio site deployed", desc: "Your portfolio was successfully deployed to production.",                     time: "3 days ago",    read: true  },
  { id: 7,  type: "testimonial", title: "Testimonial hidden",      desc: "David Chen's testimonial has been set to Hidden.",                            time: "4 days ago",    read: true  },
  { id: 8,  type: "message",     title: "New contact query",       desc: "James Carter from BuildFast wants to discuss a full-stack project.",          time: "5 days ago",    read: true  },
  { id: 9,  type: "system",      title: "Admin login detected",    desc: "New login from Chrome on Windows. If this wasn't you, change your password.", time: "6 days ago",    read: true  },
  { id: 10, type: "project",     title: "New project added",       desc: "AI Chat Dashboard has been added to your projects list.",                     time: "1 week ago",    read: true  },
];

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: initialNotifications,
  activeFilter: "All",
  setActiveFilter: (v) => set({ activeFilter: v }),
  markRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  deleteNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
