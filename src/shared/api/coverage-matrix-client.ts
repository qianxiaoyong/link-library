import type { ApiEnvelope } from "@/shared/api/api-envelope";
import type { LinkPlatform, ResourceCategory } from "@/shared/types/resource-link";
import type { CoverageMatrixResult } from "@/shared/stats/coverage-matrix";

export type CoverageMatrixParams = {
  platform?: LinkPlatform;
  resourceYear?: string;
  semester?: string;
  schoolStage?: string;
  subject?: string;
  textbookEdition?: string;
  resourceCategory?: ResourceCategory;
};

export type CoverageMatrixFilterOptions = {
  resourceYears: string[];
  semesters: string[];
  schoolStages: string[];
  subjects: string[];
  textbookEditions: string[];
};

export type CoverageMatrixSavedFilters = {
  platform: LinkPlatform | "";
  resourceYear: string;
  semester: string;
  schoolStage: string;
  subject: string;
  textbookEdition: string;
  resourceCategory: ResourceCategory | "";
};

export const defaultCoverageMatrixFilterOptions: CoverageMatrixFilterOptions = {
  resourceYears: [],
  semesters: [],
  schoolStages: [],
  subjects: [],
  textbookEditions: [],
};

export type CoverageMatrixResponse = CoverageMatrixResult;

export class CoverageMatrixClientError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "CoverageMatrixClientError";
    this.code = code;
    this.details = details;
  }
}

async function requestCoverageMatrixApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, init);
  const raw = await response.text();

  if (!raw.trim()) {
    throw new CoverageMatrixClientError(
      "INTERNAL_ERROR",
      `服务器返回空响应（HTTP ${response.status}）`,
    );
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = JSON.parse(raw) as ApiEnvelope<T>;
  } catch {
    throw new CoverageMatrixClientError(
      "INTERNAL_ERROR",
      `服务器返回非 JSON 响应（HTTP ${response.status}）`,
    );
  }

  if (!envelope.ok) {
    throw new CoverageMatrixClientError(
      envelope.error.code,
      envelope.error.message,
      envelope.error.details,
    );
  }

  return envelope.data;
}

function buildCoverageMatrixQueryString(
  params: CoverageMatrixParams,
): string {
  const searchParams = new URLSearchParams();

  if (params.platform) {
    searchParams.set("platform", params.platform);
  }
  if (params.resourceYear?.trim()) {
    searchParams.set("resourceYear", params.resourceYear.trim());
  }
  if (params.semester?.trim()) {
    searchParams.set("semester", params.semester.trim());
  }
  if (params.schoolStage?.trim()) {
    searchParams.set("schoolStage", params.schoolStage.trim());
  }
  if (params.subject?.trim()) {
    searchParams.set("subject", params.subject.trim());
  }
  if (params.textbookEdition?.trim()) {
    searchParams.set("textbookEdition", params.textbookEdition.trim());
  }
  if (params.resourceCategory) {
    searchParams.set("resourceCategory", params.resourceCategory);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function buildCoverageMatrixExportUrl(
  params: CoverageMatrixParams = {},
): string {
  const query = buildCoverageMatrixQueryString(params);
  return `/api/export/coverage-matrix${query}`;
}

export function downloadCoverageMatrixExcel(
  params: CoverageMatrixParams = {},
): void {
  const url = buildCoverageMatrixExportUrl(params);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export function getCoverageMatrixErrorMessage(error: unknown): string {
  if (error instanceof CoverageMatrixClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "请求失败，请稍后重试";
}

export async function fetchCoverageMatrix(
  params: CoverageMatrixParams = {},
): Promise<CoverageMatrixResponse> {
  const query = buildCoverageMatrixQueryString(params);
  return requestCoverageMatrixApi<CoverageMatrixResponse>(
    `/api/stats/coverage-matrix${query}`,
  );
}

export async function fetchCoverageMatrixFilterOptions(): Promise<CoverageMatrixFilterOptions> {
  return requestCoverageMatrixApi<CoverageMatrixFilterOptions>(
    "/api/stats/coverage-matrix/filter-options",
  );
}

export async function fetchCoverageMatrixFilters(): Promise<CoverageMatrixSavedFilters> {
  return requestCoverageMatrixApi<CoverageMatrixSavedFilters>(
    "/api/stats/coverage-matrix/filters",
  );
}

export async function saveCoverageMatrixFilters(
  filters: CoverageMatrixSavedFilters,
): Promise<CoverageMatrixSavedFilters> {
  return requestCoverageMatrixApi<CoverageMatrixSavedFilters>(
    "/api/stats/coverage-matrix/filters",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filters),
    },
  );
}
