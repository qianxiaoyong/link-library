import type {
  CreateResourceLinkInput,
  LinkPlatform,
  LinkStatus,
  ResourceCategory,
  ResourceLink,
} from "@/shared/types/resource-link";

export type ResourceLinkRow = {
  id: string;
  platform: string;
  title: string;
  raw_url: string;
  url: string;
  access_code: string | null;
  resource_category: string | null;
  description: string | null;
  school_stage: string | null;
  grade: string | null;
  semester: string | null;
  subject: string | null;
  resource_year: string | null;
  textbook_edition: string | null;
  status: string;
  favorite: number;
  source_text: string | null;
  created_at: string;
  updated_at: string;
};

export function mapRowToResourceLink(row: ResourceLinkRow): ResourceLink {
  return {
    id: row.id,
    platform: row.platform as LinkPlatform,
    title: row.title,
    rawUrl: row.raw_url,
    url: row.url,
    accessCode: row.access_code,
    resourceCategory: row.resource_category as ResourceCategory | null,
    description: row.description,
    schoolStage: row.school_stage,
    grade: row.grade,
    semester: row.semester,
    subject: row.subject,
    resourceYear: row.resource_year,
    textbookEdition: row.textbook_edition,
    status: row.status as LinkStatus,
    favorite: row.favorite === 1,
    sourceText: row.source_text,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCreateInputToInsertValues(
  input: CreateResourceLinkInput,
  id: string,
): Record<string, string | number | null> {
  return {
    id,
    platform: input.platform,
    title: input.title,
    raw_url: input.rawUrl,
    url: input.url,
    access_code: input.accessCode ?? null,
    resource_category: input.resourceCategory ?? null,
    description: input.description ?? null,
    school_stage: input.schoolStage ?? null,
    grade: input.grade ?? null,
    semester: input.semester ?? null,
    subject: input.subject ?? null,
    resource_year: input.resourceYear ?? null,
    textbook_edition: input.textbookEdition ?? null,
    status: input.status ?? "normal",
    favorite: input.favorite ? 1 : 0,
    source_text: input.sourceText ?? null,
  };
}
