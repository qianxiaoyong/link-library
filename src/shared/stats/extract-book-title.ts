/**
 * 从标题中提取第一对《》内的文字；无有效书名号时返回 null。
 */
export function extractFirstBookTitle(title: string): string | null {
  const start = title.indexOf("《");
  if (start === -1) {
    return null;
  }

  const end = title.indexOf("》", start + 1);
  if (end === -1) {
    return null;
  }

  const content = title.slice(start + 1, end).trim();
  return content.length > 0 ? content : null;
}

/**
 * 统计用年级展示：空值统一为「未填」。
 */
export function normalizeGradeForStats(
  grade: string | null | undefined,
): string {
  const trimmed = grade?.trim();
  return trimmed ? trimmed : "未填";
}
