import {
  EMPTY_GRADE_LABEL,
  isConsecutiveSortKey,
  parseGrade,
  type ParsedGrade,
} from "./grade-alias";

/** 至少 4 个连续年级才合并为区间。 */
export const MIN_CONSECUTIVE_FOR_RANGE = 4;

type OrderedGrade = {
  sortKey: number;
  displayLabel: string;
};

type UnorderedGrade = {
  displayLabel: string;
};

function dedupeOrderedGrades(parsedGrades: ParsedGrade[]): OrderedGrade[] {
  const bySortKey = new Map<number, string>();

  for (const grade of parsedGrades) {
    if (grade.isEmpty || grade.sortKey === null) {
      continue;
    }

    if (!bySortKey.has(grade.sortKey)) {
      bySortKey.set(grade.sortKey, grade.displayLabel);
    }
  }

  return Array.from(bySortKey.entries())
    .sort(([left], [right]) => left - right)
    .map(([sortKey, displayLabel]) => ({ sortKey, displayLabel }));
}

function dedupeUnorderedGrades(parsedGrades: ParsedGrade[]): UnorderedGrade[] {
  const labels = new Set<string>();

  for (const grade of parsedGrades) {
    if (grade.isEmpty || grade.sortKey !== null) {
      continue;
    }
    labels.add(grade.displayLabel);
  }

  return Array.from(labels)
    .sort((left, right) => left.localeCompare(right, "zh-CN"))
    .map((displayLabel) => ({ displayLabel }));
}

function formatOrderedSegment(items: OrderedGrade[]): string {
  if (items.length >= MIN_CONSECUTIVE_FOR_RANGE) {
    const first = items[0];
    const last = items[items.length - 1];
    return `${first.displayLabel}-${last.displayLabel}`;
  }

  return items.map((item) => item.displayLabel).join(",");
}

function splitOrderedRuns(items: OrderedGrade[]): OrderedGrade[][] {
  if (items.length === 0) {
    return [];
  }

  const runs: OrderedGrade[][] = [[items[0]]];

  for (let index = 1; index < items.length; index += 1) {
    const current = items[index];
    const previous = items[index - 1];
    const activeRun = runs[runs.length - 1];

    if (isConsecutiveSortKey(previous.sortKey, current.sortKey)) {
      activeRun.push(current);
      continue;
    }

    runs.push([current]);
  }

  return runs;
}

function countEmptyGrades(parsedGrades: ParsedGrade[]): number {
  return parsedGrades.filter((grade) => grade.isEmpty).length;
}

/**
 * 将多条年级记录格式化为覆盖展示文本。
 *
 * 规则：
 * - 可识别排序键的年级按序排列；
 * - 同一排序键去重；
 * - 连续段长度 >= 4 时合并为「首-尾」；
 * - 否则以逗号分隔；
 * - 无法识别排序键的年级单独列出；
 * - 空值计为「未填」，附在末尾。
 */
export function formatGradeCoverage(
  grades: Array<string | null | undefined>,
): string {
  const parsedGrades = grades.map((grade) => parseGrade(grade));
  const emptyCount = countEmptyGrades(parsedGrades);
  const orderedGrades = dedupeOrderedGrades(parsedGrades);
  const unorderedGrades = dedupeUnorderedGrades(parsedGrades);

  const segments: string[] = [];

  for (const run of splitOrderedRuns(orderedGrades)) {
    segments.push(formatOrderedSegment(run));
  }

  for (const grade of unorderedGrades) {
    segments.push(grade.displayLabel);
  }

  if (emptyCount > 0) {
    segments.push(`${EMPTY_GRADE_LABEL}(${emptyCount})`);
  }

  return segments.join(",");
}
