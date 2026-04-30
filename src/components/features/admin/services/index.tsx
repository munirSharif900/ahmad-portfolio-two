"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import Pagination from "@/src/components/shared/Pagination";
import {
  getAllServices, createService, updateService, deleteService, ServiceAPI, ServicePayload,
} from "@/src/api/services/services";

function parseError(e: any, fallback: string) {
  const data = e?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  return Object.entries(data).map(([f, v]) => `${f}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ") || fallback;
}

const GRADIENTS = [
  { label: "Violet → Purple", value: "violet_purple", tw: "from-violet-500 to-purple-600" },
  { label: "Blue → Indigo",   value: "blue_indigo",   tw: "from-blue-500 to-indigo-600" },
  { label: "Pink → Rose",     value: "pink_rose",     tw: "from-pink-500 to-rose-600" },
  { label: "Emerald → Teal",  value: "emerald_teal",  tw: "from-emerald-500 to-teal-600" },
  { label: "Amber → Orange",  value: "amber_orange",  tw: "from-amber-500 to-orange-600" },
  { label: "Cyan → Sky",      value: "cyan_sky",      tw: "from-cyan-500 to-sky-600" },
];
const gradientTw: Record<string, string> = Object.fromEntries(GRADIENTS.map(g => [g.value, g.tw]));
const emptyForm: ServicePayload = { title: "", description: "", features: "", color_gradient: "violet_purple", visible: true };
type Modal = { type: "add" } | { type: "edit"; service: ServiceAPI } | { type: "delete"; service: ServiceAPI } | null;
function parseFeatures(f: string): string[] { return f ? f.split(",").map(s => s.trim()).filter(Boolean) : []; }

const PAGE_SIZE = 10;

export default function ServicesView() {
  const [services, setServices]     = useState<ServiceAPI[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]         = useState("");
  const [modal, setModal]           = useState<Modal>(null);
  const [form, setForm]             = useState<ServicePayload>(emptyForm);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  function fetchServices(p: number) {
    setLoading(true);
    const params: any = { page: p, page_size: PAGE_SIZE };
    if (search) params.search = search;
    getAllServices(params)
      .then(data => {
        setServices(data.results ?? []);
        setTotalCount(data.pagination?.total_count ?? data.count ?? 0);
        setTotalPages((data.pagination?.total_pages) ?? (Math.ceil((data.pagination?.total_count ?? data.count ?? 0) / PAGE_SIZE) || 1));
      })
      .catch(() => toast.error("Failed to load services"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchServices(page); }, [page, search]);

  function openAdd() { setForm(emptyForm); setModal({ type: "add" }); }
  function openEdit(s: ServiceAPI) {
    setForm({ title: s.title, description: s.description, features: s.features, color_gradient: s.color_gradient, visible: s.visible });
    setModal({ type: "edit", service: s });
  }

  async function handleSave() {
    if (!form.title || !form.description) { toast.error("Title and description are required"); return; }
    try {
      setSaving(true);
      if (modal?.type === "add") { await createService(form); toast.success("Service created"); }
      else if (modal?.type === "edit") { await updateService(modal.service.id, form); toast.success("Service updated"); }
      setModal(null); fetchServices(page);
    } catch (e: any) { toast.error(parseError(e, "Failed to save service")); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (modal?.type !== "delete") return;
    try {
      setSaving(true);
      await deleteService(modal.service.id);
      toast.success("Service deleted");
      setModal(null); fetchServices(page);
    } catch (e: any) { toast.error(parseError(e, "Failed to delete")); }
    finally { setSaving(false); }
  }

  async function handleToggleVisible(s: ServiceAPI) {
    try {
      await updateService(s.id, { visible: !s.visible });
      fetchServices(page);
    } catch (e: any) { toast.error(parseError(e, "Failed to update")); }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search services..."
          className="flex-1 min-w-[200px] max-w-xs px-4 py-2 text-sm rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-violet-500" />
        <button onClick={openAdd} className="ml-auto flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Service
        </button>
      </div>

      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              {["SERVICE", "FEATURES", "GRADIENT", "VISIBLE", "ACTIONS"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {loading && <tr><td colSpan={5} className="py-16 text-center text-gray-400">Loading...</td></tr>}
            {!loading && services.length === 0 && <tr><td colSpan={5} className="py-16 text-center text-gray-400">No services found</td></tr>}
            {!loading && services.map(s => {
              const featureList = parseFeatures(s.features);
              return (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientTw[s.color_gradient] ?? "from-violet-500 to-purple-600"} flex-shrink-0`} />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{s.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">{s.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {featureList.slice(0, 2).map((f, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-violet-900/30 text-violet-300 border border-violet-800/50">{f}</span>
                      ))}
                      {featureList.length > 2 && <span className="text-xs px-2 py-0.5 rounded-md bg-gray-800 text-gray-400">+{featureList.length - 2}</span>}
                      {featureList.length === 0 && <span className="text-xs text-gray-500">—</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className={`w-16 h-5 rounded-full bg-gradient-to-r ${gradientTw[s.color_gradient] ?? "from-violet-500 to-purple-600"}`} />
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleToggleVisible(s)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${s.visible ? "bg-violet-600" : "bg-gray-600"}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${s.visible ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => openEdit(s)} title="Edit" className="text-gray-400 hover:text-blue-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => setModal({ type: "delete", service: s })} title="Delete" className="text-gray-400 hover:text-red-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} totalCount={totalCount} pageSize={PAGE_SIZE} loading={loading} onPageChange={setPage} label="services" />
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {(modal.type === "add" || modal.type === "edit") && (
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{modal.type === "add" ? "Add Service" : "Edit Service"}</h3>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Title</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500 resize-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Features <span className="text-gray-600">(comma separated)</span></label>
                  <input value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} placeholder="e.g. React, Next.js, TypeScript"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500" />
                  {form.features && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {parseFeatures(form.features).map((f, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-violet-900/30 text-violet-300 border border-violet-800/50">{f}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Color Gradient</label>
                  <div className="grid grid-cols-3 gap-2">
                    {GRADIENTS.map(g => (
                      <button key={g.value} type="button" onClick={() => setForm(f => ({ ...f, color_gradient: g.value }))}
                        className={`h-10 rounded-lg bg-gradient-to-r ${g.tw} border-2 transition-all ${form.color_gradient === g.value ? "border-white scale-105" : "border-transparent opacity-60"}`} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Show on Landing Page</p>
                    <p className="text-xs text-gray-500">Toggle visibility on public portfolio</p>
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, visible: !f.visible }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.visible ? "bg-violet-600" : "bg-gray-600"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.visible ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium transition-colors">
                    {saving ? "Saving..." : modal.type === "add" ? "Add Service" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
            {modal.type === "delete" && (
              <div className="p-6 space-y-4 text-center">
                <div className="w-14 h-14 rounded-full bg-red-900/30 flex items-center justify-center mx-auto">
                  <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Service</h3>
                  <p className="text-sm text-gray-500 mt-1">Are you sure you want to delete <span className="text-white font-medium">{modal.service.title}</span>? This cannot be undone.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                  <button onClick={handleDelete} disabled={saving} className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium transition-colors">
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
