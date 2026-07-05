import {
  LINK_PLATFORM_LABELS,
  LINK_STATUS_LABELS,
  RESOURCE_CATEGORY_LABELS,
} from "@/shared/constants/link-taxonomy";
import type { LinkStatus, ResourceCategory, ResourceLink } from "@/shared/types/resource-link";

export function displayValue(value: string | null | undefined): string {
  if (value === null || value === undefined || value.trim() === "") {
    return "—";
  }
  return value;
}

export function formatResourceInfo(item: ResourceLink): string {
  const parts = [
    item.schoolStage?.trim(),
    item.grade?.trim(),
    item.semester?.trim(),
    item.subject?.trim(),
    item.resourceYear?.trim(),
    item.resourceCategory
      ? RESOURCE_CATEGORY_LABELS[item.resourceCategory]
      : null,
  ].filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(" / ") : "—";
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN");
}

export function getPlatformLabel(platform: keyof typeof LINK_PLATFORM_LABELS): string {
  return LINK_PLATFORM_LABELS[platform];
}

export function getStatusLabel(status: LinkStatus): string {
  return LINK_STATUS_LABELS[status];
}

export function getCategoryLabel(
  category: ResourceCategory | null | undefined,
): string {
  if (!category) return "—";
  return RESOURCE_CATEGORY_LABELS[category];
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
