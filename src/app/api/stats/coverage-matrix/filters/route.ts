import { NextRequest } from "next/server";
import {
  jsonFailure,
  jsonSuccess,
  jsonValidationError,
} from "@/server/api/route-utils";
import {
  readCoverageMatrixFiltersConfig,
  writeCoverageMatrixFiltersConfig,
} from "@/server/stats/coverage-matrix-filters-store";
import { coverageMatrixFiltersConfigSchema } from "@/server/validation/coverage-matrix-filters-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return jsonSuccess(readCoverageMatrixFiltersConfig());
}

export async function PUT(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonFailure("VALIDATION_ERROR", "请求体必须是合法 JSON", 400);
  }

  const parsed = coverageMatrixFiltersConfigSchema.safeParse(body);

  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  const saved = writeCoverageMatrixFiltersConfig(parsed.data);
  return jsonSuccess(saved);
}
