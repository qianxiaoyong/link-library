import { formatGradeCoverage } from "@/shared/grade-display";
import { extractFirstBookTitle } from "@/shared/stats/extract-book-title";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type CoverageMatrixCell,
  type CoverageMatrixColumn,
  type CoverageMatrixInputRow,
  type CoverageMatrixResult,
  type CoverageMatrixRow,
} from "./types";
import type { ResourceCategory } from "@/shared/types/resource-link";

const FIELD_SEPARATOR = "\u001f";

function normalizeField(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "未填";
}

function formatColumnLabel(subject: string, textbookEdition: string): string {
  if (textbookEdition === "未填") {
    return subject;
  }
  return `${subject}·${textbookEdition}`;
}

function buildColumnKey(subject: string, textbookEdition: string): string {
  return `${subject}${FIELD_SEPARATOR}${textbookEdition}`;
}

function buildRowKey(
  resourceCategory: ResourceCategory | null,
  bookTitle: string,
): string {
  return `${resourceCategory ?? ""}${FIELD_SEPARATOR}${bookTitle}`;
}

function buildCellKey(rowKey: string, columnKey: string): string {
  return `${rowKey}${FIELD_SEPARATOR}${columnKey}`;
}

function compareColumns(
  left: CoverageMatrixColumn,
  right: CoverageMatrixColumn,
): number {
  return (
    left.subject.localeCompare(right.subject, "zh-CN") ||
    left.textbookEdition.localeCompare(right.textbookEdition, "zh-CN")
  );
}

function getCategorySortIndex(resourceCategory: ResourceCategory | null): number {
  const index = CATEGORY_ORDER.indexOf(resourceCategory);
  return index === -1 ? CATEGORY_ORDER.length : index;
}

function compareRows(left: CoverageMatrixRow, right: CoverageMatrixRow): number {
  const categoryDiff =
    getCategorySortIndex(left.resourceCategory) -
    getCategorySortIndex(right.resourceCategory);
  if (categoryDiff !== 0) {
    return categoryDiff;
  }
  return left.bookTitle.localeCompare(right.bookTitle, "zh-CN");
}

export function buildCoverageMatrix(
  rows: CoverageMatrixInputRow[],
): CoverageMatrixResult {
  const columnMap = new Map<string, CoverageMatrixColumn>();
  const rowMeta = new Map<
    string,
    {
      bookTitle: string;
      resourceCategory: ResourceCategory | null;
      categoryLabel: string;
    }
  >();
  const cellGrades = new Map<string, string[]>();

  let matchedRecords = 0;
  let skippedRecords = 0;

  for (const row of rows) {
    const bookTitle = extractFirstBookTitle(row.title);
    if (!bookTitle) {
      skippedRecords += 1;
      continue;
    }

    matchedRecords += 1;

    const subject = normalizeField(row.subject);
    const textbookEdition = normalizeField(row.textbookEdition);
    const columnKey = buildColumnKey(subject, textbookEdition);

    if (!columnMap.has(columnKey)) {
      columnMap.set(columnKey, {
        key: columnKey,
        subject,
        textbookEdition,
        label: formatColumnLabel(subject, textbookEdition),
      });
    }

    const rowKey = buildRowKey(row.resourceCategory, bookTitle);
    if (!rowMeta.has(rowKey)) {
      rowMeta.set(rowKey, {
        bookTitle,
        resourceCategory: row.resourceCategory,
        categoryLabel:
          CATEGORY_LABELS[row.resourceCategory ?? ""] ?? "未分类",
      });
    }

    const cellKey = buildCellKey(rowKey, columnKey);
    const grades = cellGrades.get(cellKey) ?? [];
    grades.push(row.grade ?? "");
    cellGrades.set(cellKey, grades);
  }

  const columns = Array.from(columnMap.values()).sort(compareColumns);
  const matrixRows: CoverageMatrixRow[] = [];

  for (const [rowKey, meta] of rowMeta) {
    const cells: Record<string, CoverageMatrixCell> = {};

    for (const column of columns) {
      const cellKey = buildCellKey(rowKey, column.key);
      const grades = cellGrades.get(cellKey);
      if (!grades || grades.length === 0) {
        continue;
      }

      cells[column.key] = {
        gradeCoverage: formatGradeCoverage(grades),
        count: grades.length,
      };
    }

    matrixRows.push({
      bookTitle: meta.bookTitle,
      resourceCategory: meta.resourceCategory,
      categoryLabel: meta.categoryLabel,
      cells,
    });
  }

  matrixRows.sort(compareRows);

  return {
    columns,
    rows: matrixRows,
    totalRecords: rows.length,
    matchedRecords,
    skippedRecords,
  };
}
