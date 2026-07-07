"use client";

import Link from "next/link";
import type { CoverageMatrixCell } from "@/shared/stats/coverage-matrix/types";
import type { MatrixCellNoteIdentity } from "@/shared/stats/coverage-matrix/cell-note-key";
import type { MatrixDrillDownFilters } from "@/shared/library/deep-link-filters";
import { buildMatrixCellDeepLink } from "@/shared/library/deep-link-filters";
import type { ResourceCategory } from "@/shared/types/resource-link";

type MatrixColumn = {
  key: string;
  subject: string;
  textbookEdition: string;
  label: string;
};

type MatrixCellProps = {
  bookTitle: string;
  resourceCategory: ResourceCategory | null;
  column: MatrixColumn;
  cell: CoverageMatrixCell | undefined;
  hasNote: boolean;
  notePreview: string | undefined;
  isRowSelected?: boolean;
  drillDownFilters: MatrixDrillDownFilters;
  onOpenNote: (payload: {
    identity: MatrixCellNoteIdentity;
    anchorRect: DOMRect;
    columnLabel: string;
  }) => void;
};

const CELL_CLASS = "border border-zinc-200 px-2 py-1.5 text-center text-xs";

function openNoteFromCell(
  event: React.MouseEvent<HTMLTableCellElement>,
  payload: Omit<MatrixCellProps, "hasNote" | "notePreview" | "onOpenNote">,
  onOpenNote: MatrixCellProps["onOpenNote"],
): void {
  if ((event.target as HTMLElement).closest("a")) {
    return;
  }

  event.preventDefault();
  onOpenNote({
    identity: {
      bookTitle: payload.bookTitle,
      resourceCategory: payload.resourceCategory,
      subject: payload.column.subject,
      textbookEdition: payload.column.textbookEdition,
    },
    anchorRect: event.currentTarget.getBoundingClientRect(),
    columnLabel: payload.column.label,
  });
}

export function MatrixCell({
  bookTitle,
  resourceCategory,
  column,
  cell,
  hasNote,
  notePreview,
  isRowSelected = false,
  drillDownFilters,
  onOpenNote,
}: MatrixCellProps) {
  const noteClassName = isRowSelected
    ? "relative bg-blue-50 hover:bg-blue-100"
    : hasNote
      ? "relative bg-amber-50/80 hover:bg-amber-100/80"
      : "hover:bg-zinc-50";

  function handleClick(event: React.MouseEvent<HTMLTableCellElement>) {
    openNoteFromCell(event, {
      bookTitle,
      resourceCategory,
      column,
      cell,
      drillDownFilters,
    }, onOpenNote);
  }

  function handleContextMenu(event: React.MouseEvent<HTMLTableCellElement>) {
    event.preventDefault();
    onOpenNote({
      identity: {
        bookTitle,
        resourceCategory,
        subject: column.subject,
        textbookEdition: column.textbookEdition,
      },
      anchorRect: event.currentTarget.getBoundingClientRect(),
      columnLabel: column.label,
    });
  }

  if (!cell) {
    return (
      <td
        className={`${CELL_CLASS} relative cursor-pointer text-zinc-300 ${noteClassName}`}
        title={notePreview}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {hasNote ? (
          <span className="text-zinc-500">—</span>
        ) : (
          "—"
        )}
        {hasNote ? (
          <span
            aria-hidden
            className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500"
          />
        ) : null}
      </td>
    );
  }

  const href = buildMatrixCellDeepLink(
    drillDownFilters,
    bookTitle,
    {
      subject: column.subject,
      textbookEdition: column.textbookEdition,
    },
    resourceCategory,
  );

  return (
    <td
      className={`${CELL_CLASS} relative cursor-default ${noteClassName}`}
      title={notePreview}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <Link
        href={href}
        className="text-blue-600 hover:text-blue-800 hover:underline"
        title={`查看 ${bookTitle} · ${column.label}`}
      >
        {cell.gradeCoverage}
      </Link>
      {hasNote ? (
        <span
          aria-hidden
          className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500"
        />
      ) : null}
    </td>
  );
}
