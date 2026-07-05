import {
  extractFirstBookTitle,
  normalizeGradeForStats,
} from "./extract-book-title";

export type TitleBracketStatsInputRow = {
  title: string;
  grade: string | null;
};

export type GradeCount = {
  grade: string;
  count: number;
};

export type TitleBracketStatsItem = {
  bookTitle: string;
  grades: GradeCount[];
  gradeSummary: string;
  count: number;
};

function formatGradeSummary(grades: GradeCount[]): string {
  return grades.map((item) => `${item.grade}(${item.count})`).join("、");
}

function sortGradeCounts(grades: GradeCount[]): GradeCount[] {
  return [...grades].sort(
    (left, right) =>
      right.count - left.count ||
      left.grade.localeCompare(right.grade, "zh-CN"),
  );
}

/**
 * 按标题第一对《》内容分组，汇总各年级出现次数。
 */
export function aggregateByBookTitle(
  rows: TitleBracketStatsInputRow[],
): TitleBracketStatsItem[] {
  const groups = new Map<string, Map<string, number>>();

  for (const row of rows) {
    const bookTitle = extractFirstBookTitle(row.title);
    if (!bookTitle) {
      continue;
    }

    const grade = normalizeGradeForStats(row.grade);
    const gradeMap = groups.get(bookTitle) ?? new Map<string, number>();
    gradeMap.set(grade, (gradeMap.get(grade) ?? 0) + 1);
    groups.set(bookTitle, gradeMap);
  }

  const results: TitleBracketStatsItem[] = [];

  for (const [bookTitle, gradeMap] of groups) {
    const grades = sortGradeCounts(
      Array.from(gradeMap.entries()).map(([grade, count]) => ({
        grade,
        count,
      })),
    );
    const count = grades.reduce((sum, item) => sum + item.count, 0);

    results.push({
      bookTitle,
      grades,
      gradeSummary: formatGradeSummary(grades),
      count,
    });
  }

  return results.sort(
    (left, right) =>
      right.count - left.count ||
      left.bookTitle.localeCompare(right.bookTitle, "zh-CN"),
  );
}
