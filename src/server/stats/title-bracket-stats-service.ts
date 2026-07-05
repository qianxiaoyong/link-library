import { listTitleBracketStatsRows } from "@/server/stats/title-bracket-stats-repository";
import type { TitleBracketStatsQuery } from "@/server/validation/title-bracket-stats-schemas";
import {
  aggregateByBookTitle,
  type TitleBracketStatsItem,
} from "@/shared/stats";

export type TitleBracketStatsResult = {
  items: TitleBracketStatsItem[];
  totalRecords: number;
  matchedRecords: number;
  skippedRecords: number;
};

export function getTitleBracketStats(
  filters: TitleBracketStatsQuery,
): TitleBracketStatsResult {
  const rows = listTitleBracketStatsRows(filters);
  const items = aggregateByBookTitle(rows);
  const matchedRecords = items.reduce((sum, item) => sum + item.count, 0);

  return {
    items,
    totalRecords: rows.length,
    matchedRecords,
    skippedRecords: rows.length - matchedRecords,
  };
}
