import ExcelJS from "exceljs";
import type { CoverageMatrixQuery } from "@/server/validation/coverage-matrix-schemas";
import type { CoverageMatrixResult } from "@/shared/stats/coverage-matrix";
import type { ResourceCategory } from "@/shared/types/resource-link";

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF2F6B3A" },
};

const CATEGORY_FILLS: Record<string, ExcelJS.Fill> = {
  练习: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFCE8E8" },
  },
  试卷: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFCE8E8" },
  },
  专项: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE8F5E9" },
  },
  未分类: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  },
};

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFD0D7DE" } },
  left: { style: "thin", color: { argb: "FFD0D7DE" } },
  bottom: { style: "thin", color: { argb: "FFD0D7DE" } },
  right: { style: "thin", color: { argb: "FFD0D7DE" } },
};

function formatTimestamp(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

function toCategoryFill(categoryLabel: string): ExcelJS.Fill {
  return CATEGORY_FILLS[categoryLabel] ?? CATEGORY_FILLS["未分类"];
}

export function buildCoverageMatrixExportTitle(
  filters: CoverageMatrixQuery,
): string {
  const parts: string[] = [];

  if (filters.resourceYear?.trim()) {
    parts.push(filters.resourceYear.trim());
  }
  if (filters.semester?.trim()) {
    parts.push(filters.semester.trim());
  }

  if (parts.length === 0) {
    return "年级覆盖矩阵";
  }

  return `${parts.join("")}年级覆盖矩阵`;
}

export function buildCoverageMatrixExportFileName(
  filters: CoverageMatrixQuery,
  date = new Date(),
): string {
  const titleParts = [
    filters.resourceYear?.trim(),
    filters.semester?.trim(),
    "覆盖矩阵",
    formatTimestamp(date),
  ].filter(Boolean);

  return `${titleParts.join("-")}.xlsx`;
}

function applyBorderToRow(row: ExcelJS.Row, columnCount: number): void {
  for (let index = 1; index <= columnCount; index += 1) {
    row.getCell(index).border = THIN_BORDER;
  }
}

function styleHeaderRow(row: ExcelJS.Row, columnCount: number): void {
  row.height = 22;
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.alignment = { vertical: "middle", horizontal: "center", wrapText: true };

  for (let index = 1; index <= columnCount; index += 1) {
    const cell = row.getCell(index);
    cell.fill = HEADER_FILL;
    cell.border = THIN_BORDER;
  }
}

function styleCategoryRow(
  row: ExcelJS.Row,
  columnCount: number,
  categoryLabel: string,
): void {
  row.height = 20;
  row.font = { bold: true };
  row.alignment = { vertical: "middle", horizontal: "left" };

  const fill = toCategoryFill(categoryLabel);
  for (let index = 1; index <= columnCount; index += 1) {
    const cell = row.getCell(index);
    cell.fill = fill;
    cell.border = THIN_BORDER;
  }
}

function styleDataRow(row: ExcelJS.Row, columnCount: number): void {
  row.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  row.getCell(1).alignment = {
    vertical: "middle",
    horizontal: "left",
    wrapText: true,
  };
  applyBorderToRow(row, columnCount);
}

export async function buildCoverageMatrixExcelBuffer(
  matrix: CoverageMatrixResult,
  filters: CoverageMatrixQuery,
): Promise<{ buffer: Buffer; fileName: string }> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "学习资料链接库";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("覆盖矩阵");
  const columnCount = matrix.columns.length + 1;
  const title = buildCoverageMatrixExportTitle(filters);

  sheet.mergeCells(1, 1, 1, Math.max(columnCount, 1));
  const titleRow = sheet.getRow(1);
  titleRow.getCell(1).value = title;
  titleRow.height = 28;
  titleRow.font = { bold: true, size: 14 };
  titleRow.alignment = { vertical: "middle", horizontal: "center" };

  const headerRow = sheet.addRow([
    "书名号",
    ...matrix.columns.map((column) => column.label),
  ]);
  styleHeaderRow(headerRow, columnCount);

  let previousCategoryLabel: string | null = null;

  for (const row of matrix.rows) {
    if (row.categoryLabel !== previousCategoryLabel) {
      previousCategoryLabel = row.categoryLabel;
      const categoryRow = sheet.addRow([row.categoryLabel]);
      sheet.mergeCells(categoryRow.number, 1, categoryRow.number, columnCount);
      styleCategoryRow(categoryRow, columnCount, row.categoryLabel);
    }

    const values = [
      row.bookTitle,
      ...matrix.columns.map((column) => row.cells[column.key]?.gradeCoverage ?? ""),
    ];
    const dataRow = sheet.addRow(values);
    styleDataRow(dataRow, columnCount);
  }

  sheet.getColumn(1).width = 24;
  for (let index = 2; index <= columnCount; index += 1) {
    sheet.getColumn(index).width = 14;
  }

  sheet.views = [{ state: "frozen", ySplit: 2, xSplit: 1 }];

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const fileName = buildCoverageMatrixExportFileName(filters);

  return { buffer, fileName };
}

export type { ResourceCategory };
