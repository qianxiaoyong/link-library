"use client";

import { useCallback, useEffect, useState } from "react";
import {
  defaultStatsFilterValues,
  StatsFilters,
  type StatsFilterValues,
} from "./StatsFilters";
import { StatsTable } from "./StatsTable";
import {
  getStatsToastClassName,
  useStatsToast,
} from "./use-stats-toast";
import {
  fetchTitleBracketStats,
  getStatsErrorMessage,
  type TitleBracketStatsItem,
} from "@/shared/api/stats-client";
import { LibraryShell } from "@/components/library-shell/LibraryShell";

function filtersToParams(
  filters: StatsFilterValues,
): Parameters<typeof fetchTitleBracketStats>[0] {
  return {
    resourceYear: filters.resourceYear || undefined,
    subject: filters.subject || undefined,
    textbookEdition: filters.textbookEdition || undefined,
    resourceCategory: filters.resourceCategory || undefined,
  };
}

export function StatsPage() {
  const { toast, showToast } = useStatsToast();
  const [filters, setFilters] = useState<StatsFilterValues>(
    defaultStatsFilterValues,
  );
  const [appliedFilters, setAppliedFilters] = useState<StatsFilterValues>(
    defaultStatsFilterValues,
  );
  const [items, setItems] = useState<TitleBracketStatsItem[]>([]);
  const [summary, setSummary] = useState({
    totalRecords: 0,
    matchedRecords: 0,
    skippedRecords: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(
    async (nextFilters: StatsFilterValues) => {
      setLoading(true);

      try {
        const result = await fetchTitleBracketStats(filtersToParams(nextFilters));
        setItems(result.items);
        setSummary({
          totalRecords: result.totalRecords,
          matchedRecords: result.matchedRecords,
          skippedRecords: result.skippedRecords,
        });
      } catch (error) {
        showToast(getStatsErrorMessage(error), "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    void loadStats(appliedFilters);
  }, [appliedFilters, loadStats]);

  function handleSearch() {
    setAppliedFilters({ ...filters });
  }

  function handleReset() {
    setFilters(defaultStatsFilterValues);
    setAppliedFilters(defaultStatsFilterValues);
  }

  return (
    <LibraryShell activeView="stats">
      <main className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        <StatsFilters
          values={filters}
          onChange={setFilters}
          onSearch={handleSearch}
          onReset={handleReset}
        />

        <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600">
          <span>筛选结果：{summary.totalRecords} 条</span>
          <span>参与统计：{summary.matchedRecords} 条</span>
          <span>无书名号跳过：{summary.skippedRecords} 条</span>
          <span>统计组数：{items.length} 组</span>
        </div>

        <StatsTable
          items={items}
          loading={loading}
          drillDownFilters={appliedFilters}
        />

        {toast ? (
          <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
            <div
              className={`max-w-[360px] truncate rounded px-2 py-0.5 text-xs ${getStatsToastClassName(toast.variant)}`}
            >
              {toast.message}
            </div>
          </div>
        ) : null}
      </main>
    </LibraryShell>
  );
}
