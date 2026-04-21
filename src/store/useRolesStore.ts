import { create } from "zustand";

export type Role = "Super Admin" | "Content Creator" | "Support Staff" | "Editor";
export type Status = "Active" | "Revoked";

export interface RoleUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
  added: string;
}

interface RolesStore {
  users: RoleUser[];
  addUser: (u: Omit<RoleUser, "id">) => void;
  updateUser: (id: number, data: Partial<Omit<RoleUser, "id">>) => void;
  toggleStatus: (id: number) => void;
  deleteUser: (id: number) => void;
}

const initial: RoleUser[] = [
  { id: 1, name: "Ali", email: "ali@portfolio.com", role: "Support Staff", status: "Revoked", added: "09 April 2026" },
  { id: 2, name: "Ahmad", email: "ahmad@portfolio.com", role: "Content Creator", status: "Revoked", added: "09 April 2026" },
];

export const useRolesStore = create<RolesStore>((set) => ({
  users: initial,
  addUser: (u) =>
    set((s) => ({
      users: [...s.users, { ...u, id: Date.now() }],
    })),
  updateUser: (id, data) =>
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
    })),
  toggleStatus: (id) =>
    set((s) => ({
      users: s.users.map((u) =>
        u.id === id ? { ...u, status: u.status === "Active" ? "Revoked" : "Active" } : u
      ),
    })),
  deleteUser: (id) =>
    set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
}));
