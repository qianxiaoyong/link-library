import { NextRequest } from "next/server";
import {
  jsonFailure,
  jsonSuccess,
  jsonValidationError,
} from "@/server/api/route-utils";
import {
  readLinkFiltersConfig,
  writeLinkFiltersConfig,
} from "@/server/filters/link-filters-store";
import { linkFiltersConfigSchema } from "@/server/validation/link-filters-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return jsonSuccess(readLinkFiltersConfig());
}

export async function PUT(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonFailure("VALIDATION_ERROR", "请求体必须是合法 JSON", 400);
  }

  const parsed = linkFiltersConfigSchema.safeParse(body);

  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  const saved = writeLinkFiltersConfig(parsed.data);
  return jsonSuccess(saved);
}
