"use client";

import {
  buildPaginationItems,
  PAGE_SIZE_OPTIONS,
  type PageSizeOption,
} from "./link-pagination-utils";

type LinkPaginationProps = {
  total: number;
  offset: number;
  pageSize: PageSizeOption;
  loading?: boolean;
  onPageSizeChange: (pageSize: PageSizeOption) => void;
  onPageChange: (page: number) => void;
};

const PAGE_BUTTON_CLASS =
  "shrink-0 rounded border border-zinc-300 px-2 py-1 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50";

export function LinkPagination({
  total,
  offset,
  pageSize,
  loading = false,
  onPageSizeChange,
  onPageChange,
}: LinkPaginationProps) {
  const totalPages =
    total === 0 ? 0 : Math.max(1, Math.ceil(total / pageSize));
  const currentPage =
    totalPages === 0 ? 0 : Math.floor(offset / pageSize) + 1;
  const pageItems =
    totalPages === 0 ? [] : buildPaginationItems(currentPage, totalPages);

  function goToPage(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    onPageChange(page);
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
      <label className="flex shrink-0 items-center gap-1 whitespace-nowrap text-zinc-600">
        每页
        <select
          className="h-7 rounded border border-zinc-300 bg-white px-1.5 text-zinc-900 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          value={pageSize}
          disabled={loading}
          onChange={(event) =>
            onPageSizeChange(Number(event.target.value) as PageSizeOption)
          }
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        条
      </label>

      <button
        type="button"
        className={PAGE_BUTTON_CLASS}
        onClick={() => goToPage(1)}
        disabled={loading || totalPages === 0 || currentPage <= 1}
      >
        首页
      </button>
      <button
        type="button"
        className={PAGE_BUTTON_CLASS}
        onClick={() => goToPage(currentPage - 1)}
        disabled={loading || totalPages === 0 || currentPage <= 1}
      >
        上一页
      </button>

      {pageItems.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-1 text-zinc-400"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={`min-w-[28px] shrink-0 rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50 ${
              item === currentPage
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
            }`}
            onClick={() => goToPage(item)}
            disabled={loading}
            aria-current={item === currentPage ? "page" : undefined}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className={PAGE_BUTTON_CLASS}
        onClick={() => goToPage(currentPage + 1)}
        disabled={loading || totalPages === 0 || currentPage >= totalPages}
      >
        下一页
      </button>
      <button
        type="button"
        className={PAGE_BUTTON_CLASS}
        onClick={() => goToPage(totalPages)}
        disabled={loading || totalPages === 0 || currentPage >= totalPages}
      >
        末页
      </button>
    </div>
  );
}
