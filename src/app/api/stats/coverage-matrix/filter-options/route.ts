import { jsonSuccess } from "@/server/api/route-utils";
import { getCoverageMatrixFilterOptions } from "@/server/stats/coverage-matrix-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return jsonSuccess(getCoverageMatrixFilterOptions());
}
