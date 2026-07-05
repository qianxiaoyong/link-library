import { listCoverageMatrixRows } from "@/server/stats/coverage-matrix-repository";
import type { CoverageMatrixQuery } from "@/server/validation/coverage-matrix-schemas";
import {
  buildCoverageMatrix,
  type CoverageMatrixResult,
} from "@/shared/stats/coverage-matrix";

export function getCoverageMatrix(
  filters: CoverageMatrixQuery,
): CoverageMatrixResult {
  const rows = listCoverageMatrixRows(filters);
  return buildCoverageMatrix(rows);
}
