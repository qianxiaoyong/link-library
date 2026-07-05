import type { LinkFilterValues } from "./LinkFilters";
import type { ResourceLink } from "@/shared/types/resource-link";

function fieldContains(
  value: string | null | undefined,
  keyword: string,
): boolean {
  return (value ?? "").toLowerCase().includes(keyword);
}

export function itemMatchesFilters(
  item: ResourceLink,
  filters: LinkFilterValues,
): boolean {
  if (filters.status !== "all" && item.status !== filters.status) {
    return false;
  }

  if (filters.platform && item.platform !== filters.platform) {
    return false;
  }

  if (filters.favorite !== undefined && item.favorite !== filters.favorite) {
    return false;
  }

  if (
    filters.resourceCategory &&
    item.resourceCategory !== filters.resourceCategory
  ) {
    return false;
  }

  if (
    filters.schoolStage &&
    (item.schoolStage ?? "") !== filters.schoolStage
  ) {
    return false;
  }

  if (filters.grade && (item.grade ?? "") !== filters.grade) {
    return false;
  }

  if (filters.semester && (item.semester ?? "") !== filters.semester) {
    return false;
  }

  if (filters.subject && (item.subject ?? "") !== filters.subject) {
    return false;
  }

  if (
    filters.resourceYear &&
    (item.resourceYear ?? "") !== filters.resourceYear
  ) {
    return false;
  }

  if (
    filters.textbookEdition &&
    (item.textbookEdition ?? "") !== filters.textbookEdition
  ) {
    return false;
  }

  const keyword = filters.q.trim().toLowerCase();
  if (keyword) {
    const matched = [
      item.title,
      item.description,
      item.subject,
      item.grade,
      item.resourceYear,
      item.textbookEdition,
      item.url,
    ].some((value) => fieldContains(value, keyword));

    if (!matched) {
      return false;
    }
  }

  return true;
}
