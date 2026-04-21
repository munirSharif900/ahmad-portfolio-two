"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  revokeUser,
  RoleUserAPI,
} from "@/src/api/services/roles";

// Parse Django REST field-level errors like {email: ["..."], name: ["..."]}
function parseError(e: any, fallback: string): string {
  const data = e?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  // field-level errors
  const messages = Object.entries(data)
    .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(", ") : errs}`)
    .join(" | ");
  return messages || fallback;
}

// Exact enum values from backend Swagger docs (Array[3])
const ROLES = [
  { label: "Content Creator", value: "content_creator" },
  { label: "Support Staff",   value: "support_staff" },
  { label: "Editor",          value: "editor" },
];

const roleBadge: Record<string, string> = {
  content_creator: "bg-purple-900/50 text-purple-300 border border-purple-700",
  support_staff:   "bg-blue-900/50 text-blue-300 border border-blue-700",
  editor:          "bg-emerald-900/50 text-emerald-300 border border-emerald-700",
  super_admin:     "bg-violet-900/50 text-violet-300 border border-violet-700",
};

const roleLabel: Record<string, string> = {
  content_creator: "Content Creator",
  support_staff:   "Support Staff",
  editor:          "Editor",
  super_admin:     "Super Admin",
};

type Modal =
  | { type: "view";   user: RoleUserAPI }
  | { type: "edit";   user: RoleUserAPI }
  | { type: "delete"; user: RoleUserAPI }
  | { type: "status"; user: RoleUserAPI }
  | { type: "add" }
  | null;

const emptyForm = { name: "", email: "", role: "support_staff" };

export default function RolesView() {
  const [users, setUsers]       = useState<RoleUserAPI[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [modal, setModal]       = useState<Modal>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch]     = useState("");
  const [roleFilter, setRoleFilter]     = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : data.results ?? []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "All Roles" || u.role === roleFilter;
    const matchStatus = statusFilter === "All Status" ||
      (statusFilter === "Active" ? u.is_active : !u.is_active);
    return matchSearch && matchRole && matchStatus;
  });

  function openEdit(user: RoleUserAPI) {
    setForm({ name: user.name, email: user.email, role: user.role });
    setModal({ type: "edit", user });
  }

  async function handleAdd() {
    if (!form.name || !form.email) {
      toast.error("Name and email are required");
      return;
    }
    try {
      setSaving(true);
      await createUser({ name: form.name, email: form.email, role: form.role });
      toast.success("User created successfully");
      setModal(null);
      fetchUsers();
    } catch (e: any) {
      toast.error(parseError(e, "Failed to create user"));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit() {
    if (modal?.type !== "edit") return;
    try {
      setSaving(true);
      await updateUser(modal.user.id, { name: form.name, email: form.email, role: form.role });
      toast.success("User updated successfully");
      setModal(null);
      fetchUsers();
    } catch (e: any) {
      toast.error(parseError(e, "Failed to update user"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (modal?.type !== "delete") return;
    try {
      setSaving(true);
      await deleteUser(modal.user.id);
      toast.success("User deleted");
      setModal(null);
      fetchUsers();
    } catch (e: any) {
      toast.error(parseError(e, "Failed to delete user"));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus() {
    if (modal?.type !== "status") return;
    try {
      setSaving(true);
      await revokeUser(modal.user.id);
      toast.success(`User ${modal.user.is_active ? "revoked" : "activated"}`);
      setModal(null);
      fetchUsers();
    } catch (e: any) {
      toast.error(parseError(e, "Failed to update status"));
    } finally {
      setSaving(false);
    }
  }

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 min-w-[200px] max-w-xs px-4 py-2 text-sm rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-violet-500">
          <option value="All Roles">All Roles</option>
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-violet-500">
          <option>All Status</option>
          <option>Active</option>
          <option>Revoked</option>
        </select>
        <button onClick={() => { setForm(emptyForm); setModal({ type: "add" }); }}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              {["NAME", "EMAIL", "ROLE", "STATUS", "ADDED", "ACTIONS"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {loading && (
              <tr><td colSpan={6} className="py-16 text-center text-gray-400 text-sm">Loading...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="py-16 text-center text-gray-400 text-sm">No users found</td></tr>
            )}
            {!loading && filtered.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{u.name}</td>
                <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                <td className="px-5 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleBadge[u.role] ?? "bg-gray-800 text-gray-300 border border-gray-700"}`}>
                    {roleLabel[u.role] ?? u.role}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.is_active ? "bg-emerald-900/40 text-emerald-400 border border-emerald-700" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>
                    {u.is_active ? "Active" : "Revoked"}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{formatDate(u.created_at)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setModal({ type: "view", user: u })} title="View"
                      className="text-gray-400 hover:text-violet-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button onClick={() => openEdit(u)} title="Edit"
                      className="text-gray-400 hover:text-blue-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => setModal({ type: "status", user: u })} title="Toggle Status"
                      className="text-gray-400 hover:text-emerald-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button onClick={() => setModal({ type: "delete", user: u })} title="Delete"
                      className="text-gray-400 hover:text-red-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setModal(null)}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}>

            {/* VIEW */}
            {modal.type === "view" && (
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Details</h3>
                <div className="space-y-3">
                  {[{ label: "Name", value: modal.user.name }, { label: "Email", value: modal.user.email }, { label: "Added", value: formatDate(modal.user.created_at) }].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-gray-900 dark:text-white font-medium">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-400">Role</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleBadge[modal.user.role] ?? "bg-gray-800 text-gray-300 border border-gray-700"}`}>
                      {roleLabel[modal.user.role] ?? modal.user.role}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-400">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${modal.user.is_active ? "bg-emerald-900/40 text-emerald-400 border border-emerald-700" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>
                      {modal.user.is_active ? "Active" : "Revoked"}
                    </span>
                  </div>
                </div>
                <button onClick={() => setModal(null)}
                  className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  Close
                </button>
              </div>
            )}

            {/* ADD */}
            {modal.type === "add" && (
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New User</h3>
                <FormFields form={form} setForm={setForm} />
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setModal(null)}
                    className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleAdd} disabled={saving}
                    className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium transition-colors">
                    {saving ? "Adding..." : "Add User"}
                  </button>
                </div>
              </div>
            )}

            {/* EDIT */}
            {modal.type === "edit" && (
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit User</h3>
                <FormFields form={form} setForm={setForm} />
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setModal(null)}
                    className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSaveEdit} disabled={saving}
                    className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium transition-colors">
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* STATUS TOGGLE */}
            {modal.type === "status" && (
              <div className="p-6 space-y-4 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-900/30 flex items-center justify-center mx-auto">
                  <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Toggle Status</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Change <span className="text-white font-medium">{modal.user.name}</span>'s status from{" "}
                    <span className={`font-medium ${modal.user.is_active ? "text-emerald-400" : "text-gray-400"}`}>
                      {modal.user.is_active ? "Active" : "Revoked"}
                    </span>{" "}to{" "}
                    <span className={`font-medium ${modal.user.is_active ? "text-gray-400" : "text-emerald-400"}`}>
                      {modal.user.is_active ? "Revoked" : "Active"}
                    </span>?
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setModal(null)}
                    className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleToggleStatus} disabled={saving}
                    className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium transition-colors">
                    {saving ? "Updating..." : "Confirm"}
                  </button>
                </div>
              </div>
            )}

            {/* DELETE */}
            {modal.type === "delete" && (
              <div className="p-6 space-y-4 text-center">
                <div className="w-14 h-14 rounded-full bg-red-900/30 flex items-center justify-center mx-auto">
                  <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete User</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Are you sure you want to delete <span className="text-white font-medium">{modal.user.name}</span>? This cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setModal(null)}
                    className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleDelete} disabled={saving}
                    className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium transition-colors">
                    {saving ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FormFields({
  form, setForm,
}: {
  form: { name: string; email: string; role: string };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
}) {
  return (
    <div className="space-y-3">
      {(["name", "email"] as const).map((field) => (
        <div key={field}>
          <label className="block text-xs text-gray-400 mb-1 capitalize">{field}</label>
          <input value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500" />
        </div>
      ))}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Role</label>
        <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500">
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
