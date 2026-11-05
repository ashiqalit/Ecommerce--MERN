interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const buttonClass =
    "rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <button
        className={buttonClass}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </button>
      <span className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </span>
      <button
        className={buttonClass}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
