import type { ApiEnvelope } from "@/shared/api/api-envelope";
import type { ParseLinkTextResult, ParsedLinkItem } from "@/shared/parser/link-parser-types";
import type {
  CreateResourceLinkInput,
  LinkPlatform,
  LinkStatus,
  ResourceCategory,
  ResourceLink,
  UpdateResourceLinkInput,
} from "@/shared/types/resource-link";

export type ListLinksParams = {
  q?: string;
  platform?: LinkPlatform;
  status?: LinkStatus | "all";
  favorite?: boolean;
  resourceCategory?: ResourceCategory;
  schoolStage?: string;
  grade?: string;
  semester?: string;
  subject?: string;
  resourceYear?: string;
  textbookEdition?: string;
  limit?: number;
  offset?: number;
};

export type ExportExcelParams = Omit<ListLinksParams, "limit" | "offset"> & {
  scope: "filtered" | "all";
};

export type BackupDatabaseResponse = {
  backupPath: string;
  fileName: string;
  createdAt: string;
};

export type ListLinksResponse = {
  items: ResourceLink[];
  total: number;
  limit: number;
  offset: number;
};

export type ImportDefaultsInput = {
  resourceCategory?: ResourceCategory | null;
  description?: string | null;
  schoolStage?: string | null;
  grade?: string | null;
  semester?: string | null;
  subject?: string | null;
  resourceYear?: string | null;
  textbookEdition?: string | null;
  status?: LinkStatus;
  favorite?: boolean;
};

export type ImportDefaultsConfig = {
  title: string;
  resourceCategory: ResourceCategory | "";
  description: string;
  schoolStage: string;
  grade: string;
  semester: string;
  subject: string;
  resourceYear: string;
  textbookEdition: string;
  status: LinkStatus;
  favorite: boolean;
};

export type ApplyImportResponse = {
  created: ResourceLink[];
  skippedDuplicates: Array<{
    platform: LinkPlatform;
    url: string;
    title: string;
  }>;
  failures: Array<{
    title?: string;
    reason: string;
  }>;
  summary: {
    requested: number;
    created: number;
    skippedDuplicates: number;
    failures: number;
  };
};

export class LinksClientError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "LinksClientError";
    this.code = code;
    this.details = details;
  }
}

async function requestApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const raw = await response.text();

  if (!raw.trim()) {
    throw new LinksClientError(
      "INTERNAL_ERROR",
      `服务器返回空响应（HTTP ${response.status}）`,
    );
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = JSON.parse(raw) as ApiEnvelope<T>;
  } catch {
    throw new LinksClientError(
      "INTERNAL_ERROR",
      `服务器返回非 JSON 响应（HTTP ${response.status}）`,
    );
  }

  if (!envelope.ok) {
    throw new LinksClientError(
      envelope.error.code,
      envelope.error.message,
      envelope.error.details,
    );
  }

  return envelope.data;
}

function buildFilterQueryString(
  params: Omit<ListLinksParams, "limit" | "offset">,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params.q?.trim()) searchParams.set("q", params.q.trim());
  if (params.platform) searchParams.set("platform", params.platform);
  if (params.status) searchParams.set("status", params.status);
  if (params.favorite !== undefined) {
    searchParams.set("favorite", String(params.favorite));
  }
  if (params.resourceCategory) {
    searchParams.set("resourceCategory", params.resourceCategory);
  }
  if (params.schoolStage?.trim()) {
    searchParams.set("schoolStage", params.schoolStage.trim());
  }
  if (params.grade?.trim()) searchParams.set("grade", params.grade.trim());
  if (params.semester?.trim()) {
    searchParams.set("semester", params.semester.trim());
  }
  if (params.subject?.trim()) searchParams.set("subject", params.subject.trim());
  if (params.resourceYear?.trim()) {
    searchParams.set("resourceYear", params.resourceYear.trim());
  }
  if (params.textbookEdition?.trim()) {
    searchParams.set("textbookEdition", params.textbookEdition.trim());
  }

  return searchParams;
}

function buildQueryString(params: ListLinksParams): string {
  const searchParams = buildFilterQueryString(params);

  if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
  if (params.offset !== undefined) {
    searchParams.set("offset", String(params.offset));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function buildExportExcelUrl(params: ExportExcelParams): string {
  const searchParams = buildFilterQueryString(params);
  searchParams.set("scope", params.scope);

  if (params.scope === "all") {
    for (const key of [
      "q",
      "platform",
      "status",
      "favorite",
      "resourceCategory",
      "schoolStage",
      "grade",
      "semester",
      "subject",
      "resourceYear",
      "textbookEdition",
    ]) {
      searchParams.delete(key);
    }
  }

  return `/api/export/excel?${searchParams.toString()}`;
}

export function downloadExportExcel(params: ExportExcelParams): void {
  const url = buildExportExcelUrl(params);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export async function listLinks(
  params: ListLinksParams = {},
): Promise<ListLinksResponse> {
  const query = buildQueryString({
    status: "normal",
    limit: 50,
    offset: 0,
    ...params,
  });

  return requestApi<ListLinksResponse>(`/api/links${query}`);
}

export async function getLink(id: string): Promise<ResourceLink> {
  const data = await requestApi<{ item: ResourceLink }>(`/api/links/${id}`);
  return data.item;
}

export async function createLink(
  input: CreateResourceLinkInput,
): Promise<ResourceLink> {
  const data = await requestApi<{ item: ResourceLink }>("/api/links", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.item;
}

export async function updateLink(
  id: string,
  input: UpdateResourceLinkInput,
): Promise<ResourceLink> {
  const data = await requestApi<{ item: ResourceLink }>(`/api/links/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data.item;
}

export type BatchUpdateFailure = {
  id: string;
  reason: string;
};

export type BatchUpdateLinksResult = {
  successCount: number;
  failureCount: number;
  failures: BatchUpdateFailure[];
  updated: ResourceLink[];
};

export async function batchUpdateLinks(
  ids: string[],
  patch: UpdateResourceLinkInput,
): Promise<BatchUpdateLinksResult> {
  const failures: BatchUpdateFailure[] = [];
  const updated: ResourceLink[] = [];
  let successCount = 0;

  for (const id of ids) {
    try {
      const item = await updateLink(id, patch);
      updated.push(item);
      successCount += 1;
    } catch (error) {
      failures.push({
        id,
        reason: getErrorMessage(error),
      });
    }
  }

  return {
    successCount,
    failureCount: failures.length,
    failures,
    updated,
  };
}

export async function deleteLink(id: string): Promise<void> {
  await requestApi<{ deleted: boolean }>(`/api/links/${id}`, {
    method: "DELETE",
  });
}

export async function parseImportText(text: string): Promise<ParseLinkTextResult> {
  return requestApi<ParseLinkTextResult>("/api/import/parse", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function applyImportItems(input: {
  items: ParsedLinkItem[];
  defaults?: ImportDefaultsInput;
}): Promise<ApplyImportResponse> {
  return requestApi<ApplyImportResponse>("/api/import/apply", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function loadImportDefaultsConfig(): Promise<ImportDefaultsConfig> {
  return requestApi<ImportDefaultsConfig>("/api/import/defaults");
}

export async function saveImportDefaultsConfig(
  config: ImportDefaultsConfig,
): Promise<ImportDefaultsConfig> {
  return requestApi<ImportDefaultsConfig>("/api/import/defaults", {
    method: "PUT",
    body: JSON.stringify(config),
  });
}

export async function backupDatabase(): Promise<BackupDatabaseResponse> {
  return requestApi<BackupDatabaseResponse>("/api/backup", {
    method: "POST",
  });
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof LinksClientError) {
    if (error.code === "DUPLICATE_LINK") return "该链接已存在";
    if (error.code === "VALIDATION_ERROR") return "输入数据不合法";
    if (error.code === "BACKUP_FAILED") return "数据库备份失败";
    return error.message || "操作失败";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "操作失败";
}
