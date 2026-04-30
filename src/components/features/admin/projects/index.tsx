"use client";

import { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import FormField from "@/src/components/shared/FormField";
import { getAllPortfolio, createPortfolioWithImage, updatePortfolio, deletePortfolio, PortfolioAPI, PortfolioPayload } from "@/src/api/services/portfolio";
import ImageDropZone from "@/src/components/shared/ImageDropZone";

function parseError(e: any, fallback: string) {
  const data = e?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  return Object.entries(data).map(([f, v]) => `${f}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ") || fallback;
}

const statusStyle: Record<string, string> = {
  "live":        "bg-emerald-900/40 text-emerald-400 border-emerald-800",
  "in progress": "bg-amber-900/40 text-amber-400 border-amber-800",
  "archived":    "bg-gray-800 text-gray-500 border-gray-700",
};

const rules = {
  title:       { required: "Title is required" },
  description: { required: "Description is required" },
  github_url:  { required: "GitHub URL is required", pattern: { value: /^https?:\/\/.+/, message: "Enter a valid URL" } },
  live_url:    { required: "Live URL is required" },
  tech_stack:  { required: "Tech stack is required" },
  year:        { required: "Year is required", pattern: { value: /^\d{4}$/, message: "4-digit year" } },
  category:    { required: "Category is required" },
  status:      { required: "Status is required" },
};

function ProjectForm({ defaultValues, onSave, onCancel, submitLabel, saving, imageUrl }: {
  defaultValues: PortfolioPayload;
  onSave: (data: PortfolioPayload, imageFile?: File) => void;
  onCancel: () => void;
  submitLabel: string;
  saving: boolean;
  imageUrl?: string;
}) {
  const { control, handleSubmit, formState: { errors, isValid } } = useForm<PortfolioPayload>({ defaultValues, mode: "onChange" });
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState<string>(imageUrl ?? "");

  return (
    <form onSubmit={handleSubmit(data => onSave(data, imageFile))} noValidate className="space-y-3">
      <Controller control={control} name="title" rules={rules.title}
        render={({ field }) => <FormField label="Title" value={field.value} onChange={field.onChange} error={errors.title?.message} />} />
      <Controller control={control} name="github_url" rules={rules.github_url}
        render={({ field }) => <FormField label="GitHub URL" value={field.value} onChange={field.onChange} error={errors.github_url?.message} />} />
      <Controller control={control} name="live_url" rules={rules.live_url}
        render={({ field }) => <FormField label="Live URL" value={field.value} onChange={field.onChange} error={errors.live_url?.message} />} />
      <Controller control={control} name="description" rules={rules.description}
        render={({ field }) => <FormField as="textarea" label="Description" rows={2} value={field.value} onChange={field.onChange} error={errors.description?.message} />} />
      <div className="grid grid-cols-2 gap-3">
        <Controller control={control} name="category" rules={rules.category}
          render={({ field }) => <FormField as="select" label="Category" value={field.value} onChange={field.onChange} error={errors.category?.message}
            options={["Full-Stack", "Frontend", "Backend"].map(c => ({ label: c, value: c }))} />} />
        <Controller control={control} name="status" rules={rules.status}
          render={({ field }) => <FormField as="select" label="Status" value={field.value} onChange={field.onChange} error={errors.status?.message}
            options={[{ label: "Live", value: "live" }, { label: "In Progress", value: "in progress" }, { label: "Archived", value: "archived" }]} />} />
      </div>
      <Controller control={control} name="tech_stack" rules={rules.tech_stack}
        render={({ field }) => <FormField label="Tech Stack (comma separated)" placeholder="NextJS, Django, PostgreSQL" value={field.value} onChange={field.onChange} error={errors.tech_stack?.message} />} />
      <Controller control={control} name="year" rules={rules.year}
        render={({ field }) => <FormField label="Year" placeholder="2024" value={field.value} onChange={field.onChange} error={errors.year?.message} />} />

      <ImageDropZone
        value={imagePreview}
        onChange={(base64, file) => { setImagePreview(base64); setImageFile(file); }}
        onClear={() => { setImagePreview(""); setImageFile(undefined); }}
      />

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={!isValid || saving}
          className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
          {saving ? "Saving..." : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
      </div>
    </form>
  );
}

const PAGE_SIZE = 10;

export default function AdminProjectsView() {
  const [projects, setProjects]       = useState<PortfolioAPI[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [modal, setModal]             = useState<"add" | "edit" | "view" | "delete" | null>(null);
  const [selected, setSelected]       = useState<PortfolioAPI | null>(null);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // reset page on filter change
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    setPage(1);
  }, [filterStatus]);

  // main fetch
  useEffect(() => {
    setLoading(true);
    const params: any = { page, page_size: PAGE_SIZE };
    if (filterStatus !== "All") params.status = filterStatus.toLowerCase();
    if (search) params.search = search;
    getAllPortfolio(params)
      .then(data => {
        setProjects(data.results ?? []);
        const count = data.pagination?.total_count ?? data.count ?? 0;
        setTotalCount(count);
        setTotalPages((data.pagination?.total_pages) ?? (Math.ceil(count / PAGE_SIZE) || 1));
      })
      .catch(() => toast.error("Failed to load projects"))
      .finally(() => setLoading(false));
  }, [page, filterStatus, search]);

  function refetch() {
    setLoading(true);
    const params: any = { page, page_size: PAGE_SIZE };
    if (filterStatus !== "All") params.status = filterStatus.toLowerCase();
    if (search) params.search = search;
    getAllPortfolio(params)
      .then(data => {
        setProjects(data.results ?? []);
        const count = data.pagination?.total_count ?? data.count ?? 0;
        setTotalCount(count);
        setTotalPages((data.pagination?.total_pages) ?? (Math.ceil(count / PAGE_SIZE) || 1));
      })
      .catch(() => toast.error("Failed to load projects"))
      .finally(() => setLoading(false));
  }

  const openAdd    = () => { setSelected(null); setModal("add"); };
  const openEdit   = (p: PortfolioAPI) => { setSelected(p); setModal("edit"); };
  const openView   = (p: PortfolioAPI) => { setSelected(p); setModal("view"); };
  const openDelete = (p: PortfolioAPI) => { setSelected(p); setModal("delete"); };

  async function handleSave(data: PortfolioPayload, imageFile?: File) {
    try {
      setSaving(true);
      if (modal === "add") { await createPortfolioWithImage(data, imageFile); toast.success("Project added"); }
      else if (modal === "edit" && selected) { await updatePortfolio(selected.id, data, imageFile); toast.success("Project updated"); }
      setModal(null);
      refetch();
    } catch (e: any) { toast.error(parseError(e, "Failed to save project")); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!selected) return;
    try {
      setSaving(true);
      await deletePortfolio(selected.id);
      toast.success("Project deleted");
      setModal(null);
      refetch();
    } catch (e: any) { toast.error(parseError(e, "Failed to delete project")); }
    finally { setSaving(false); }
  }

  const getDefaultValues = (p?: PortfolioAPI | null): PortfolioPayload => ({
    title: p?.title ?? "", github_url: p?.github_url ?? "", live_url: p?.live_url ?? "",
    description: p?.description ?? "", category: p?.category ?? "Full-Stack",
    status: p?.status ?? "live", tech_stack: p?.tech_stack ?? "", year: p?.year ?? new Date().getFullYear().toString(),
  });

  const getTechList = (ts: string) => ts ? ts.split(",").map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3 flex-1">
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search projects..."
            className="bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-violet-500 w-56" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-violet-500">
            <option>All</option>
            <option value="live">Live</option>
            <option value="in progress">In Progress</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Project
        </button>
      </div>

      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Project</th>
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-left px-5 py-3">Tech Stack</th>
                <th className="text-left px-5 py-3">Year</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {loading && <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>}
              {!loading && projects.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-gray-400">No projects found</td></tr>}
              {!loading && projects.map(p => {
                const tech = getTechList(p.tech_stack);
                return (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {p.image && <img src={p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-200 dark:border-gray-700" />}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{p.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{p.category}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {tech.slice(0, 2).map(t => (
                          <span key={t} className="text-xs bg-violet-950/60 text-violet-300 px-2 py-0.5 rounded border border-violet-800/50">{t}</span>
                        ))}
                        {tech.length > 2 && <span className="text-xs text-gray-400">+{tech.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{p.year}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${statusStyle[p.status] ?? statusStyle["archived"]}`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openView(p)} title="View" className="p-1.5 text-gray-400 hover:text-cyan-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button onClick={() => openEdit(p)} title="Edit" className="p-1.5 text-gray-400 hover:text-violet-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => openDelete(p)} title="Delete" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {totalCount > 0
              ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, totalCount)} of ${totalCount} projects`
              : "No projects"}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1 || loading}
              className="px-2.5 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-500 hover:text-violet-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)} disabled={loading}
                className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                  n === page
                    ? "bg-violet-600 border-violet-600 text-white"
                    : "border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-500 hover:text-violet-400"
                }`}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages || loading}
              className="px-2.5 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-500 hover:text-violet-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

            {modal === "view" && selected && (
              <div className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selected.title}</h2>
                  <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                {selected.image && <img src={selected.image} alt={selected.title} className="w-full h-40 object-cover rounded-xl mb-4" />}
                <div className="space-y-2 text-sm">
                  {[["Category", selected.category], ["Year", selected.year], ["Status", selected.status], ["Description", selected.description]].map(([l, v]) => (
                    <div key={l} className="flex gap-2"><span className="text-gray-500 w-24 flex-shrink-0">{l}:</span><span className="text-gray-700 dark:text-gray-200 capitalize">{v}</span></div>
                  ))}
                  <div className="flex gap-2 flex-wrap"><span className="text-gray-500 w-24 flex-shrink-0">Tech:</span>
                    {getTechList(selected.tech_stack).map(t => <span key={t} className="text-xs bg-violet-950/60 text-violet-300 px-2 py-0.5 rounded border border-violet-800/50">{t}</span>)}
                  </div>
                  <div className="flex gap-2"><span className="text-gray-500 w-24">GitHub:</span><a href={selected.github_url} className="text-violet-400 hover:underline truncate">{selected.github_url}</a></div>
                  <div className="flex gap-2"><span className="text-gray-500 w-24">Live:</span><a href={selected.live_url} className="text-violet-400 hover:underline">{selected.live_url}</a></div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => openEdit(selected)} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">Edit</button>
                  <button onClick={() => setModal(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm transition-colors">Close</button>
                </div>
              </div>
            )}

            {(modal === "add" || modal === "edit") && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{modal === "add" ? "Add Project" : "Edit Project"}</h2>
                  <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                <ProjectForm defaultValues={getDefaultValues(selected)} onSave={handleSave} onCancel={() => setModal(null)}
                  submitLabel={modal === "add" ? "Add Project" : "Save Changes"} saving={saving}
                  imageUrl={selected?.image ?? ""} />
              </div>
            )}

            {modal === "delete" && selected && (
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Project?</h2>
                <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete <span className="text-white font-medium">"{selected.title}"</span>? This cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={handleDelete} disabled={saving} className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">{saving ? "Deleting..." : "Delete"}</button>
                  <button onClick={() => setModal(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
