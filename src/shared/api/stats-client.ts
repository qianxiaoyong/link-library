import type { ApiEnvelope } from "@/shared/api/api-envelope";
import type { ResourceCategory } from "@/shared/types/resource-link";
import type {
  GradeCount,
  TitleBracketStatsItem,
} from "@/shared/stats";

export type TitleBracketStatsParams = {
  resourceYear?: string;
  subject?: string;
  textbookEdition?: string;
  resourceCategory?: ResourceCategory;
};

export type TitleBracketStatsResponse = {
  items: TitleBracketStatsItem[];
  totalRecords: number;
  matchedRecords: number;
  skippedRecords: number;
};

export type { GradeCount, TitleBracketStatsItem };

export class StatsClientError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "StatsClientError";
    this.code = code;
    this.details = details;
  }
}

async function requestStatsApi<T>(
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
    throw new StatsClientError(
      "INTERNAL_ERROR",
      `服务器返回空响应（HTTP ${response.status}）`,
    );
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = JSON.parse(raw) as ApiEnvelope<T>;
  } catch {
    throw new StatsClientError(
      "INTERNAL_ERROR",
      `服务器返回非 JSON 响应（HTTP ${response.status}）`,
    );
  }

  if (!envelope.ok) {
    throw new StatsClientError(
      envelope.error.code,
      envelope.error.message,
      envelope.error.details,
    );
  }

  return envelope.data;
}

function buildStatsQueryString(params: TitleBracketStatsParams): string {
  const searchParams = new URLSearchParams();

  if (params.resourceYear?.trim()) {
    searchParams.set("resourceYear", params.resourceYear.trim());
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

export function getStatsErrorMessage(error: unknown): string {
  if (error instanceof StatsClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "请求失败，请稍后重试";
}

export async function fetchTitleBracketStats(
  params: TitleBracketStatsParams = {},
): Promise<TitleBracketStatsResponse> {
  const query = buildStatsQueryString(params);
  return requestStatsApi<TitleBracketStatsResponse>(
    `/api/stats/title-brackets${query}`,
  );
}
