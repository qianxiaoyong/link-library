import {
  listCoverageMatrixFilterOptions,
  listCoverageMatrixRows,
  type CoverageMatrixFilterOptions,
} from "@/server/stats/coverage-matrix-repository";
import type { CoverageMatrixQuery } from "@/server/validation/coverage-matrix-schemas";
import {
  buildCoverageMatrix,
  type CoverageMatrixResult,
} from "@/shared/stats/coverage-matrix";
import { extractFirstBookTitle } from "@/shared/stats/extract-book-title";

function filterRowsByBookTitle(
  rows: ReturnType<typeof listCoverageMatrixRows>,
  bookTitle?: string,
) {
  const keyword = bookTitle?.trim();
  if (!keyword) {
    return rows;
  }

  return rows.filter((row) => {
    const extracted = extractFirstBookTitle(row.title);
    return extracted?.includes(keyword) ?? false;
  });
}

export function getCoverageMatrix(
  filters: CoverageMatrixQuery,
): CoverageMatrixResult {
  const rows = filterRowsByBookTitle(
    listCoverageMatrixRows(filters),
    filters.bookTitle,
  );
  return buildCoverageMatrix(rows);
}

export function getCoverageMatrixFilterOptions(): CoverageMatrixFilterOptions {
  return listCoverageMatrixFilterOptions();
}
