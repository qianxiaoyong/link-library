import { parseGradeSortKey } from "@/shared/grade-display";
import type { ResourceLink } from "@/shared/types/resource-link";

const MULTI_OR_UNKNOWN_GRADE_RANK = 1000;

function platformRank(platform: ResourceLink["platform"]): number {
  if (platform === "baidu") return 0;
  if (platform === "quark") return 1;
  return 2;
}

function gradeRank(grade: string | null | undefined): number {
  const sortKey = parseGradeSortKey(grade?.trim() ?? "");
  // 单一年级（1、2、一年级…）按数值升序；1-6 / 3,4 等无法识别的排在后面
  return sortKey === null ? MULTI_OR_UNKNOWN_GRADE_RANK : sortKey;
}

export function compareMatrixCellLinkItems(
  left: ResourceLink,
  right: ResourceLink,
): number {
  const platformDiff =
    platformRank(left.platform) - platformRank(right.platform);
  if (platformDiff !== 0) {
    return platformDiff;
  }

  const gradeDiff = gradeRank(left.grade) - gradeRank(right.grade);
  if (gradeDiff !== 0) {
    return gradeDiff;
  }

  const gradeLabelDiff = (left.grade ?? "").localeCompare(
    right.grade ?? "",
    "zh-CN",
  );
  if (gradeLabelDiff !== 0) {
    return gradeLabelDiff;
  }

  return left.title.localeCompare(right.title, "zh-CN");
}

export function sortMatrixCellLinkItems(
  items: ResourceLink[],
): ResourceLink[] {
  return [...items].sort(compareMatrixCellLinkItems);
}
