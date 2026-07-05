import type { ResourceCategory } from "@/shared/types/resource-link";

export type CoverageMatrixInputRow = {
  title: string;
  grade: string | null;
  resourceCategory: ResourceCategory | null;
  subject: string | null;
  textbookEdition: string | null;
};

export type CoverageMatrixColumn = {
  key: string;
  subject: string;
  textbookEdition: string;
  label: string;
};

export type CoverageMatrixCell = {
  gradeCoverage: string;
  count: number;
};

export type CoverageMatrixRow = {
  bookTitle: string;
  resourceCategory: ResourceCategory | null;
  categoryLabel: string;
  cells: Record<string, CoverageMatrixCell>;
};

export type CoverageMatrixResult = {
  columns: CoverageMatrixColumn[];
  rows: CoverageMatrixRow[];
  totalRecords: number;
  matchedRecords: number;
  skippedRecords: number;
};

export const CATEGORY_ORDER: Array<ResourceCategory | null> = [
  "practice",
  "paper",
  "special",
  null,
];

export const CATEGORY_LABELS: Record<string, string> = {
  practice: "练习",
  paper: "试卷",
  special: "专项",
  "": "未分类",
};
