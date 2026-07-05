import { NextRequest, NextResponse } from "next/server";
import { jsonValidationError } from "@/server/api/route-utils";
import { buildExcelDownloadHeaders } from "@/server/export/download-headers";
import { buildCoverageMatrixExcelBuffer } from "@/server/export/export-coverage-matrix-excel";
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

  const matrix = getCoverageMatrix(parsed.data);
  const { buffer, fileName } = await buildCoverageMatrixExcelBuffer(
    matrix,
    parsed.data,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: buildExcelDownloadHeaders(fileName),
  });
}
