import { create } from "zustand";

export type ContactQuery = {
  id: number;
  name: string;
  email: string;
  message: string;
  date: string;
  read: boolean;
};

type ContactQueryStore = {
  queries: ContactQuery[];
  search: string;
  filterRead: string;
  setSearch: (v: string) => void;
  setFilterRead: (v: string) => void;
  markRead: (id: number) => void;
  toggleRead: (id: number) => void;
  markAllRead: () => void;
  deleteQuery: (id: number) => void;
};

const initialQueries: ContactQuery[] = [
  { id: 1, name: "John Smith", email: "john@example.com", message: "Hi, I need a full-stack web app for my startup. Can we schedule a call to discuss the requirements?", date: "2024-12-01 09:14", read: false },
  { id: 2, name: "Priya Sharma", email: "priya@techco.io", message: "We're looking for a developer to build a React dashboard for our analytics platform. What's your availability?", date: "2024-11-30 14:32", read: false },
  { id: 3, name: "Carlos Mendez", email: "carlos@brandstudio.com", message: "I saw your portfolio and I'm impressed. We need a landing page redesign for our SaaS product.", date: "2024-11-29 11:05", read: true },
  { id: 4, name: "Lena Fischer", email: "lena@designhaus.de", message: "Hello! I'm a designer looking for a developer partner for client projects. Would love to collaborate.", date: "2024-11-28 16:48", read: true },
  { id: 5, name: "Omar Abdullah", email: "omar@ecomstore.pk", message: "We need to migrate our existing WooCommerce store to a custom NextJS + Django solution. Can you help?", date: "2024-11-27 10:20", read: false },
  { id: 6, name: "Sophie Turner", email: "sophie@edtech.co.uk", message: "We're building an LMS and need a skilled full-stack developer. Your portfolio looks perfect for what we need.", date: "2024-11-26 13:55", read: true },
  { id: 7, name: "Ravi Patel", email: "ravi@fintech.in", message: "Looking for a developer to build a financial dashboard with real-time data. Budget is flexible for the right person.", date: "2024-11-25 09:30", read: false },
  { id: 8, name: "Amelia Brooks", email: "amelia@realestate.com", message: "We need updates to our existing real estate platform — new filters, map integration, and a revamped agent portal.", date: "2024-11-24 15:10", read: true },
  { id: 9, name: "Tariq Hussain", email: "tariq@mediagroup.ae", message: "Interested in a long-term contract for frontend development. We have multiple projects lined up.", date: "2024-11-23 11:45", read: false },
  { id: 10, name: "Nina Kowalski", email: "nina@startup.pl", message: "Can you build a custom CRM for our sales team? We need it integrated with our existing Django backend.", date: "2024-11-22 08:55", read: true },
  { id: 11, name: "Daniel Park", email: "daniel@agency.kr", message: "We're a digital agency looking for a reliable developer for overflow work. Are you open to agency partnerships?", date: "2024-11-21 17:20", read: true },
  { id: 12, name: "Yasmin Al-Rashid", email: "yasmin@nonprofit.org", message: "We're a non-profit and need a donation platform built. Do you offer any discounts for non-profits?", date: "2024-11-20 12:00", read: false },
];

export const useContactQueryStore = create<ContactQueryStore>((set) => ({
  queries: initialQueries,
  search: "",
  filterRead: "All",
  setSearch: (v) => set({ search: v }),
  setFilterRead: (v) => set({ filterRead: v }),
  markRead: (id) =>
    set((s) => ({ queries: s.queries.map((q) => (q.id === id ? { ...q, read: true } : q)) })),
  toggleRead: (id) =>
    set((s) => ({ queries: s.queries.map((q) => (q.id === id ? { ...q, read: !q.read } : q)) })),
  markAllRead: () =>
    set((s) => ({ queries: s.queries.map((q) => ({ ...q, read: true })) })),
  deleteQuery: (id) =>
    set((s) => ({ queries: s.queries.filter((q) => q.id !== id) })),
}));
