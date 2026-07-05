import type { ResourceCategory } from "@/shared/types/resource-link";

export type LinksDeepLinkParams = {
  q?: string;
  resourceYear?: string;
  semester?: string;
  schoolStage?: string;
  subject?: string;
  textbookEdition?: string;
  resourceCategory?: ResourceCategory;
};

export type StatsDrillDownFilters = {
  resourceYear?: string;
  semester?: string;
  schoolStage?: string;
  subject?: string;
  textbookEdition?: string;
  resourceCategory?: ResourceCategory | "";
};

export type MatrixDrillDownFilters = StatsDrillDownFilters;

export type MatrixCellDrillDownTarget = {
  subject: string;
  textbookEdition: string;
};

const RESOURCE_CATEGORY_SET = new Set<ResourceCategory>([
  "practice",
  "paper",
  "special",
]);

function parseResourceCategory(
  value: string | null,
): ResourceCategory | undefined {
  if (!value) {
    return undefined;
  }
  return RESOURCE_CATEGORY_SET.has(value as ResourceCategory)
    ? (value as ResourceCategory)
    : undefined;
}

export function encodeLinksDeepLinkParams(
  params: LinksDeepLinkParams,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params.q?.trim()) {
    searchParams.set("q", params.q.trim());
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

  return searchParams;
}

export function decodeLinksDeepLinkParams(
  searchParams: Pick<URLSearchParams, "get">,
): LinksDeepLinkParams {
  return {
    q: searchParams.get("q")?.trim() || undefined,
    resourceYear: searchParams.get("resourceYear")?.trim() || undefined,
    semester: searchParams.get("semester")?.trim() || undefined,
    schoolStage: searchParams.get("schoolStage")?.trim() || undefined,
    subject: searchParams.get("subject")?.trim() || undefined,
    textbookEdition: searchParams.get("textbookEdition")?.trim() || undefined,
    resourceCategory: parseResourceCategory(
      searchParams.get("resourceCategory"),
    ),
  };
}

export function buildLinksPagePath(params: LinksDeepLinkParams = {}): string {
  const query = encodeLinksDeepLinkParams(params).toString();
  return query ? `/links?${query}` : "/links";
}

function normalizeDeepLinkField(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "未填") {
    return undefined;
  }
  return trimmed;
}

export function buildStatsBookTitleDeepLink(
  statsFilters: StatsDrillDownFilters,
  bookTitle: string,
): string {
  return buildLinksPagePath({
    q: bookTitle,
    resourceYear: normalizeDeepLinkField(statsFilters.resourceYear),
    semester: normalizeDeepLinkField(statsFilters.semester),
    schoolStage: normalizeDeepLinkField(statsFilters.schoolStage),
    subject: normalizeDeepLinkField(statsFilters.subject),
    textbookEdition: normalizeDeepLinkField(statsFilters.textbookEdition),
    resourceCategory: statsFilters.resourceCategory || undefined,
  });
}

export function buildMatrixCellDeepLink(
  filters: MatrixDrillDownFilters,
  bookTitle: string,
  column: MatrixCellDrillDownTarget,
  rowResourceCategory?: ResourceCategory | null,
): string {
  return buildLinksPagePath({
    q: bookTitle,
    resourceYear: normalizeDeepLinkField(filters.resourceYear),
    semester: normalizeDeepLinkField(filters.semester),
    schoolStage: normalizeDeepLinkField(filters.schoolStage),
    subject: normalizeDeepLinkField(column.subject),
    textbookEdition: normalizeDeepLinkField(column.textbookEdition),
    resourceCategory:
      filters.resourceCategory || rowResourceCategory || undefined,
  });
}
