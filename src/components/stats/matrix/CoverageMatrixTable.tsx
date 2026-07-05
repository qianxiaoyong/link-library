"use client";

import type { ReactNode } from "react";
import type { CoverageMatrixResponse } from "@/shared/api/coverage-matrix-client";
import type { MatrixDrillDownFilters } from "@/shared/library/deep-link-filters";
import { buildMatrixCellNoteKey } from "@/shared/stats/coverage-matrix/cell-note-key";
import type { MatrixCellNoteIdentity } from "@/shared/stats/coverage-matrix/cell-note-key";
import { MatrixCell } from "./MatrixCell";

type CoverageMatrixTableProps = {
  data: CoverageMatrixResponse | null;
  loading: boolean;
  drillDownFilters: MatrixDrillDownFilters;
  notes: Record<string, string>;
  onOpenNote: (payload: {
    identity: MatrixCellNoteIdentity;
    anchorRect: DOMRect;
    columnLabel: string;
  }) => void;
};

const CELL_CLASS = "border border-zinc-200 px-2 py-1.5 text-center text-xs";
const STICKY_BOOK_TITLE_CLASS = `${CELL_CLASS} sticky left-0 z-10 bg-white text-left font-medium text-zinc-900 shadow-[inset_-1px_0_0_#e4e4e7]`;
const STICKY_HEADER_CLASS = `${CELL_CLASS} sticky left-0 z-30 min-w-[160px] bg-zinc-50 text-left font-medium text-zinc-700 shadow-[inset_-1px_0_0_#e4e4e7]`;

function renderBodyRows(
  data: CoverageMatrixResponse,
  drillDownFilters: MatrixDrillDownFilters,
  notes: Record<string, string>,
  onOpenNote: CoverageMatrixTableProps["onOpenNote"],
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
      <tr key={`${row.resourceCategory ?? "none"}-${row.bookTitle}`}>
        <td
          className={`${STICKY_BOOK_TITLE_CLASS} hover:bg-zinc-50`}
          title={row.bookTitle}
        >
          {row.bookTitle}
        </td>
        {data.columns.map((column) => {
          const noteKey = buildMatrixCellNoteKey({
            bookTitle: row.bookTitle,
            resourceCategory: row.resourceCategory,
            subject: column.subject,
            textbookEdition: column.textbookEdition,
          });
          const note = notes[noteKey];
          const hasNote = Boolean(note?.trim());
          const notePreview = hasNote ? note : undefined;

          return (
            <MatrixCell
              key={column.key}
              bookTitle={row.bookTitle}
              resourceCategory={row.resourceCategory}
              column={column}
              cell={row.cells[column.key]}
              hasNote={hasNote}
              notePreview={notePreview}
              drillDownFilters={drillDownFilters}
              onOpenNote={onOpenNote}
            />
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
  notes,
  onOpenNote,
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
      <table className="min-w-full border-separate border-spacing-0 text-left">
        <thead className="sticky top-0 z-20 bg-zinc-50">
          <tr>
            <th className={STICKY_HEADER_CLASS}>书名号</th>
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
        <tbody>
          {renderBodyRows(data, drillDownFilters, notes, onOpenNote)}
        </tbody>
      </table>
    </div>
  );
}
