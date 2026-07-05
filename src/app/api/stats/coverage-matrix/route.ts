import { NextRequest } from "next/server";
import {
  jsonSuccess,
  jsonValidationError,
} from "@/server/api/route-utils";
import { getCoverageMatrix } from "@/server/stats/coverage-matrix-service";
import { coverageMatrixQuerySchema } from "@/server/validation/coverage-matrix-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = coverageMatrixQuerySchema.safeParse(params);

  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  return jsonSuccess(getCoverageMatrix(parsed.data));
}
