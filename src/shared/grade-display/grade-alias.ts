const CHINESE_DIGIT_TO_NUMBER: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};

const GRADE_SORT_KEY_ALIASES: Record<string, number> = {
  一年级: 1,
  二年级: 2,
  三年级: 3,
  四年级: 4,
  五年级: 5,
  六年级: 6,
  七年级: 7,
  八年级: 8,
  九年级: 9,
  初一: 7,
  初二: 8,
  初三: 9,
  新初一: 7,
  预初: 7,
  新初二: 8,
  预二: 8,
  新初三: 9,
  高一: 10,
  高二: 11,
  高三: 12,
};

export const EMPTY_GRADE_LABEL = "未填";

export type ParsedGrade = {
  raw: string;
  displayLabel: string;
  sortKey: number | null;
  isEmpty: boolean;
};

function parseChineseNumber(value: string): number | null {
  if (/^\d+$/.test(value)) {
    const number = Number.parseInt(value, 10);
    return Number.isFinite(number) ? number : null;
  }

  if (value.length === 1 && value in CHINESE_DIGIT_TO_NUMBER) {
    return CHINESE_DIGIT_TO_NUMBER[value];
  }

  return null;
}

function parseGradeYearSuffix(label: string): number | null {
  const match = /^([一二三四五六七八九]|\d+)年级$/.exec(label);
  if (!match) {
    return null;
  }

  const number = parseChineseNumber(match[1] ?? "");
  if (number === null || number < 1 || number > 9) {
    return null;
  }

  return number;
}

/**
 * 将年级文本解析为排序键；无法识别时返回 null（不参与连续段合并）。
 */
export function parseGradeSortKey(grade: string): number | null {
  const label = grade.trim();
  if (!label || label === EMPTY_GRADE_LABEL) {
    return null;
  }

  const aliasSortKey = GRADE_SORT_KEY_ALIASES[label];
  if (aliasSortKey !== undefined) {
    return aliasSortKey;
  }

  if (/^\d+$/.test(label)) {
    const number = Number.parseInt(label, 10);
    if (number >= 1 && number <= 12) {
      return number;
    }
    return null;
  }

  return parseGradeYearSuffix(label);
}

export function parseGrade(raw: string | null | undefined): ParsedGrade {
  const displayLabel = raw?.trim() ?? "";
  const isEmpty = displayLabel.length === 0 || displayLabel === EMPTY_GRADE_LABEL;

  if (isEmpty) {
    return {
      raw: displayLabel,
      displayLabel: EMPTY_GRADE_LABEL,
      sortKey: null,
      isEmpty: true,
    };
  }

  return {
    raw: displayLabel,
    displayLabel,
    sortKey: parseGradeSortKey(displayLabel),
    isEmpty: false,
  };
}

export function isConsecutiveSortKey(left: number, right: number): boolean {
  return right - left === 1;
}
