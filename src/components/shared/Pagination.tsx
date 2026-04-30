interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (p: number) => void;
  label?: string;
}

export default function Pagination({ page, totalPages, totalCount, pageSize, loading, onPageChange, label = "items" }: PaginationProps) {
  return (
    <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
      <span className="text-xs text-gray-400">
        {totalCount > 0
          ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalCount)} of ${totalCount} ${label}`
          : `No ${label}`}
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1 || loading}
          className="px-2.5 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-500 hover:text-violet-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          ← Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => onPageChange(n)} disabled={loading}
            className={`px-2.5 py-1 text-xs rounded border transition-colors ${
              n === page
                ? "bg-violet-600 border-violet-600 text-white"
                : "border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-500 hover:text-violet-400"
            }`}>
            {n}
          </button>
        ))}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages || loading}
          className="px-2.5 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-violet-500 hover:text-violet-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Next →
        </button>
      </div>
    </div>
  );
}
