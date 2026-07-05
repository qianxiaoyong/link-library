import { NextRequest, NextResponse } from "next/server";
import { buildExcelDownloadHeaders } from "@/server/export/download-headers";
import { buildLinksExcelBuffer } from "@/server/export/export-links-excel";
import { jsonValidationError } from "@/server/api/route-utils";
import { listResourceLinksForExport } from "@/server/repositories/resource-link-repository";
import { exportExcelQuerySchema } from "@/server/validation/resource-link-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = exportExcelQuerySchema.safeParse(params);

  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  const { scope, ...filters } = parsed.data;

  const items =
    scope === "all"
      ? listResourceLinksForExport({ status: "all" })
      : listResourceLinksForExport(filters);

  const { buffer, fileName } = await buildLinksExcelBuffer(items, scope);

  return new NextResponse(new Uint8Array(buffer), {
    headers: buildExcelDownloadHeaders(fileName),
  });
}
