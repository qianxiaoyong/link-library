"use client";

import { useCallback, useEffect, useState } from "react";
import {
  defaultMatrixFilterValues,
  MatrixFilters,
  type MatrixFilterValues,
} from "./MatrixFilters";
import { CoverageMatrixTable } from "./CoverageMatrixTable";
import {
  getStatsToastClassName,
  useStatsToast,
} from "../use-stats-toast";
import {
  downloadCoverageMatrixExcel,
  fetchCoverageMatrix,
  getCoverageMatrixErrorMessage,
  type CoverageMatrixResponse,
} from "@/shared/api/coverage-matrix-client";
import { LibraryShell } from "@/components/library-shell/LibraryShell";

function filtersToParams(
  filters: MatrixFilterValues,
): Parameters<typeof fetchCoverageMatrix>[0] {
  return {
    resourceYear: filters.resourceYear || undefined,
    semester: filters.semester || undefined,
    subject: filters.subject || undefined,
    textbookEdition: filters.textbookEdition || undefined,
    resourceCategory: filters.resourceCategory || undefined,
  };
}

export function CoverageMatrixPage() {
  const { toast, showToast } = useStatsToast();
  const [filters, setFilters] = useState<MatrixFilterValues>(
    defaultMatrixFilterValues,
  );
  const [appliedFilters, setAppliedFilters] = useState<MatrixFilterValues>(
    defaultMatrixFilterValues,
  );
  const [data, setData] = useState<CoverageMatrixResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadMatrix = useCallback(
    async (nextFilters: MatrixFilterValues) => {
      setLoading(true);

      try {
        const result = await fetchCoverageMatrix(filtersToParams(nextFilters));
        setData(result);
      } catch (error) {
        showToast(getCoverageMatrixErrorMessage(error), "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    void loadMatrix(appliedFilters);
  }, [appliedFilters, loadMatrix]);

  function handleSearch() {
    setAppliedFilters({ ...filters });
  }

  function handleReset() {
    setFilters(defaultMatrixFilterValues);
    setAppliedFilters(defaultMatrixFilterValues);
  }

  function handleExportExcel() {
    setExporting(true);
    try {
      downloadCoverageMatrixExcel(filtersToParams(appliedFilters));
      showToast("已开始导出覆盖矩阵 Excel。", "success");
    } catch (error) {
      showToast(getCoverageMatrixErrorMessage(error), "error");
    } finally {
      setExporting(false);
    }
  }

  return (
    <LibraryShell
      activeView="stats"
      subtitleOverride="按书名号 × 科目版本展示年级覆盖（仅统计正常资料）"
    >
      <main className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <MatrixFilters
            values={filters}
            onChange={setFilters}
            onSearch={handleSearch}
            onReset={handleReset}
          />
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting || loading}
            className="h-9 shrink-0 rounded border border-zinc-300 bg-white px-2.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
          >
            {exporting ? "导出中..." : "导出Excel"}
          </button>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600">
          <span>筛选结果：{data?.totalRecords ?? 0} 条</span>
          <span>参与统计：{data?.matchedRecords ?? 0} 条</span>
          <span>无书名号跳过：{data?.skippedRecords ?? 0} 条</span>
          <span>书名号行数：{data?.rows.length ?? 0} 行</span>
          <span>动态列数：{data?.columns.length ?? 0} 列</span>
        </div>

        <CoverageMatrixTable
          data={data}
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
