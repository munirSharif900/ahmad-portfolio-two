import { create } from "zustand";
import {
  receiveContactQueries,
  markContactRead,
  markAllContactRead,
  deleteContactQuery,
} from "@/src/api/services/contect";

export type ContactQuery = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

type ContactQueryStore = {
  queries: ContactQuery[];
  search: string;
  filterRead: string;
  loading: boolean;
  error: string | null;
  setSearch: (v: string) => void;
  setFilterRead: (v: string) => void;
  fetchQueries: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteQuery: (id: number) => Promise<void>;
};

export const useContactQueryStore = create<ContactQueryStore>((set, get) => ({
  queries: [],
  search: "",
  filterRead: "All",
  loading: false,
  error: null,

  setSearch: (v) => set({ search: v }),
  setFilterRead: (v) => set({ filterRead: v }),

  fetchQueries: async () => {
    set({ loading: true, error: null });
    try {
      const data = await receiveContactQueries();
      set({ queries: data.results ?? data });
    } catch {
      set({ error: "Failed to load queries." });
    } finally {
      set({ loading: false });
    }
  },

  markRead: async (id) => {
    await markContactRead(id);
    set((s) => ({
      queries: s.queries.map((q) => (q.id === id ? { ...q, is_read: true } : q)),
    }));
  },

  markAllRead: async () => {
    await markAllContactRead();
    set((s) => ({
      queries: s.queries.map((q) => ({ ...q, is_read: true })),
    }));
  },

  deleteQuery: async (id) => {
    try {
      await deleteContactQuery(id);
      set((s) => ({ queries: s.queries.filter((q) => q.id !== id) }));
    } catch (error: any) {
      throw error;
    }
  },
}));
