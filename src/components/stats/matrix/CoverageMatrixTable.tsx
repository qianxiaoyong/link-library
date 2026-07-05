import Link from "next/link";
import type { ReactNode } from "react";
import type { CoverageMatrixResponse } from "@/shared/api/coverage-matrix-client";
import type { MatrixDrillDownFilters } from "@/shared/library/deep-link-filters";
import { buildMatrixCellDeepLink } from "@/shared/library/deep-link-filters";

type CoverageMatrixTableProps = {
  data: CoverageMatrixResponse | null;
  loading: boolean;
  drillDownFilters: MatrixDrillDownFilters;
};

const CELL_CLASS = "border border-zinc-200 px-2 py-1.5 text-center text-xs";

function renderBodyRows(
  data: CoverageMatrixResponse,
  drillDownFilters: MatrixDrillDownFilters,
) {
  const elements: ReactNode[] = [];
  let previousCategoryLabel: string | null = null;

  for (const row of data.rows) {
    if (row.categoryLabel !== previousCategoryLabel) {
      previousCategoryLabel = row.categoryLabel;
      elements.push(
        <tr key={`category-${row.categoryLabel}`} className="bg-zinc-100">
          <td
            colSpan={data.columns.length + 1}
            className="border border-zinc-200 px-2 py-1.5 text-xs font-semibold text-zinc-700"
          >
            {row.categoryLabel}
          </td>
        </tr>,
      );
    }

    elements.push(
      <tr key={`${row.resourceCategory ?? "none"}-${row.bookTitle}`} className="hover:bg-zinc-50">
        <td
          className={`${CELL_CLASS} sticky left-0 z-10 bg-white text-left font-medium text-zinc-900`}
          title={row.bookTitle}
        >
          {row.bookTitle}
        </td>
        {data.columns.map((column) => {
          const cell = row.cells[column.key];
          if (!cell) {
            return (
              <td
                key={column.key}
                className={`${CELL_CLASS} text-zinc-300`}
              >
                —
              </td>
            );
          }

          const href = buildMatrixCellDeepLink(
            drillDownFilters,
            row.bookTitle,
            {
              subject: column.subject,
              textbookEdition: column.textbookEdition,
            },
            row.resourceCategory,
          );

          return (
            <td key={column.key} className={CELL_CLASS}>
              <Link
                href={href}
                className="text-blue-600 hover:text-blue-800 hover:underline"
                title={`查看 ${row.bookTitle} · ${column.label}`}
              >
                {cell.gradeCoverage}
              </Link>
            </td>
          );
        })}
      </tr>,
    );
  }

  return elements;
}

export function CoverageMatrixTable({
  data,
  loading,
  drillDownFilters,
}: CoverageMatrixTableProps) {
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm text-zinc-500">
        加载中...
      </div>
    );
  }

  if (!data || data.rows.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm text-zinc-500">
        暂无矩阵数据
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-zinc-200 bg-white">
      <table className="min-w-full border-collapse text-left">
        <thead className="sticky top-0 z-20 bg-zinc-50">
          <tr>
            <th
              className={`${CELL_CLASS} sticky left-0 z-30 min-w-[160px] bg-zinc-50 text-left font-medium text-zinc-700`}
            >
              书名号
            </th>
            {data.columns.map((column) => (
              <th
                key={column.key}
                className={`${CELL_CLASS} min-w-[88px] font-medium text-zinc-700`}
                title={column.label}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderBodyRows(data, drillDownFilters)}</tbody>
      </table>
    </div>
  );
}
