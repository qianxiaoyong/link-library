import { NextRequest } from "next/server";
import {
  jsonFailure,
  jsonSuccess,
  jsonValidationError,
} from "@/server/api/route-utils";
import {
  readImportDefaultsConfig,
  writeImportDefaultsConfig,
} from "@/server/import-defaults/import-defaults-store";
import { importDefaultsConfigSchema } from "@/server/validation/resource-link-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return jsonSuccess(readImportDefaultsConfig());
}

export async function PUT(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonFailure("VALIDATION_ERROR", "请求体必须是合法 JSON", 400);
  }

  const parsed = importDefaultsConfigSchema.safeParse(body);

  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  const saved = writeImportDefaultsConfig(parsed.data);
  return jsonSuccess(saved);
}
