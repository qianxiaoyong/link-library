import { NextRequest } from "next/server";
import { jsonFailure, jsonSuccess, jsonValidationError } from "@/server/api/route-utils";
import { parseLinkText } from "@/shared/parser";
import { importParseSchema } from "@/server/validation/resource-link-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonFailure("VALIDATION_ERROR", "请求体必须是合法 JSON", 400);
  }

  const parsed = importParseSchema.safeParse(body);

  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  const result = parseLinkText(parsed.data.text);

  return jsonSuccess(result);
}
