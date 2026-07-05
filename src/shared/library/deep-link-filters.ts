import type { ResourceCategory } from "@/shared/types/resource-link";

export type LinksDeepLinkParams = {
  q?: string;
  resourceYear?: string;
  subject?: string;
  textbookEdition?: string;
  resourceCategory?: ResourceCategory;
};

export type StatsDrillDownFilters = {
  resourceYear?: string;
  subject?: string;
  textbookEdition?: string;
  resourceCategory?: ResourceCategory | "";
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

export function buildStatsBookTitleDeepLink(
  statsFilters: StatsDrillDownFilters,
  bookTitle: string,
): string {
  return buildLinksPagePath({
    q: bookTitle,
    resourceYear: statsFilters.resourceYear?.trim() || undefined,
    subject: statsFilters.subject?.trim() || undefined,
    textbookEdition: statsFilters.textbookEdition?.trim() || undefined,
    resourceCategory: statsFilters.resourceCategory || undefined,
  });
}
