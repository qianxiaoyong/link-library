import type { CreateResourceLinkBody } from "@/server/validation/resource-link-schemas";
import type { CreateResourceLinkInput } from "@/shared/types/resource-link";

export function toCreateResourceLinkInput(
  body: CreateResourceLinkBody,
): CreateResourceLinkInput {
  return {
    platform: body.platform,
    title: body.title,
    rawUrl: body.rawUrl,
    url: body.url,
    accessCode: body.accessCode ?? null,
    resourceCategory: body.resourceCategory ?? null,
    description: body.description ?? null,
    schoolStage: body.schoolStage ?? null,
    grade: body.grade ?? null,
    semester: body.semester ?? null,
    subject: body.subject ?? null,
    resourceYear: body.resourceYear ?? null,
    status: body.status ?? "normal",
    favorite: body.favorite ?? false,
    sourceText: body.sourceText ?? null,
  };
}
