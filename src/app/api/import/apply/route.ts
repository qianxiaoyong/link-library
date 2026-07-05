import { NextRequest } from "next/server";
import { jsonFailure, jsonSuccess, jsonValidationError } from "@/server/api/route-utils";
import { createManyResourceLinksSkipDuplicates } from "@/server/repositories/resource-link-repository";
import { importApplySchema } from "@/server/validation/resource-link-schemas";
import type { CreateResourceLinkInput } from "@/shared/types/resource-link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonFailure("VALIDATION_ERROR", "请求体必须是合法 JSON", 400);
  }

  const parsed = importApplySchema.safeParse(body);

  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  const defaults = parsed.data.defaults ?? {};
  const inputs: CreateResourceLinkInput[] = parsed.data.items.map((item) => ({
    platform: item.platform,
    title: item.title,
    rawUrl: item.rawUrl,
    url: item.url,
    accessCode: item.accessCode,
    sourceText: item.sourceText,
    resourceCategory: defaults.resourceCategory ?? null,
    description: defaults.description ?? null,
    schoolStage: defaults.schoolStage ?? null,
    grade: defaults.grade ?? null,
    semester: defaults.semester ?? null,
    subject: defaults.subject ?? null,
    resourceYear: defaults.resourceYear ?? null,
    textbookEdition: defaults.textbookEdition ?? null,
    status: defaults.status ?? "normal",
    favorite: defaults.favorite ?? false,
  }));

  const result = createManyResourceLinksSkipDuplicates(inputs);

  return jsonSuccess({
    created: result.created,
    skippedDuplicates: result.skippedDuplicates,
    failures: result.failures,
    summary: {
      requested: parsed.data.items.length,
      created: result.created.length,
      skippedDuplicates: result.skippedDuplicates.length,
      failures: result.failures.length,
    },
  });
}
