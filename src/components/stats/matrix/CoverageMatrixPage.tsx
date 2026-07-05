"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  defaultMatrixFilterValues,
  MatrixFilters,
  type MatrixFilterValues,
} from "./MatrixFilters";
import { CoverageMatrixTable } from "./CoverageMatrixTable";
import { MatrixCellNotePopover } from "./MatrixCellNotePopover";
import {
  getStatsToastClassName,
  useStatsToast,
} from "../use-stats-toast";
import {
  defaultCoverageMatrixFilterOptions,
  downloadCoverageMatrixExcel,
  fetchCoverageMatrix,
  fetchCoverageMatrixFilterOptions,
  fetchCoverageMatrixFilters,
  getCoverageMatrixErrorMessage,
  saveCoverageMatrixFilters,
  type CoverageMatrixFilterOptions,
  type CoverageMatrixResponse,
} from "@/shared/api/coverage-matrix-client";
import {
  fetchCoverageMatrixNotes,
  getCoverageMatrixNotesErrorMessage,
  upsertCoverageMatrixNote,
} from "@/shared/api/coverage-matrix-notes-client";
import {
  buildMatrixCellNoteKey,
  type MatrixCellNoteIdentity,
} from "@/shared/stats/coverage-matrix/cell-note-key";
import { LibraryShell } from "@/components/library-shell/LibraryShell";

type NotePopoverState = {
  identity: MatrixCellNoteIdentity;
  anchorRect: DOMRect;
  columnLabel: string;
};

function filtersToParams(
  filters: MatrixFilterValues,
): Parameters<typeof fetchCoverageMatrix>[0] {
  return {
    platform: filters.platform || undefined,
    resourceYear: filters.resourceYear || undefined,
    semester: filters.semester || undefined,
    schoolStage: filters.schoolStage || undefined,
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
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const skipNextPersistRef = useRef(false);
  const [data, setData] = useState<CoverageMatrixResponse | null>(null);
  const [filterOptions, setFilterOptions] = useState<CoverageMatrixFilterOptions>(
    defaultCoverageMatrixFilterOptions,
  );
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [notePopover, setNotePopover] = useState<NotePopoverState | null>(null);
  const [noteSaving, setNoteSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadFilterOptions = useCallback(async () => {
    try {
      const result = await fetchCoverageMatrixFilterOptions();
      setFilterOptions(result);
    } catch (error) {
      showToast(getCoverageMatrixErrorMessage(error), "error");
    }
  }, [showToast]);

  const loadNotes = useCallback(async () => {
    try {
      const result = await fetchCoverageMatrixNotes();
      setNotes(result.notes);
    } catch (error) {
      showToast(getCoverageMatrixNotesErrorMessage(error), "error");
    }
  }, [showToast]);

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

  const persistFilters = useCallback(
    async (nextFilters: MatrixFilterValues) => {
      try {
        await saveCoverageMatrixFilters(nextFilters);
      } catch (error) {
        showToast(getCoverageMatrixErrorMessage(error), "error");
      }
    },
    [showToast],
  );

  useEffect(() => {
    async function initializeFilters() {
      try {
        const saved = await fetchCoverageMatrixFilters();
        skipNextPersistRef.current = true;
        setFilters(saved);
      } catch (error) {
        showToast(getCoverageMatrixErrorMessage(error), "error");
      } finally {
        setFiltersInitialized(true);
      }
    }

    void initializeFilters();
  }, [showToast]);

  useEffect(() => {
    if (!filtersInitialized) {
      return;
    }

    void loadMatrix(filters);

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    void persistFilters(filters);
  }, [filters, filtersInitialized, loadMatrix, persistFilters]);

  useEffect(() => {
    void loadFilterOptions();
  }, [loadFilterOptions]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  function handleFiltersChange(nextFilters: MatrixFilterValues) {
    setFilters(nextFilters);
  }

  function handleSearch() {
    void loadMatrix(filters);
  }

  function handleReset() {
    setFilters(defaultMatrixFilterValues);
  }

  function handleExportExcel() {
    setExporting(true);
    try {
      downloadCoverageMatrixExcel(filtersToParams(filters));
      showToast("已开始导出覆盖矩阵 Excel。", "success");
    } catch (error) {
      showToast(getCoverageMatrixErrorMessage(error), "error");
    } finally {
      setExporting(false);
    }
  }

  function handleOpenNote(payload: NotePopoverState) {
    setNotePopover(payload);
  }

  function handleCloseNote() {
    if (noteSaving) {
      return;
    }
    setNotePopover(null);
  }

  async function persistNote(note: string) {
    if (!notePopover) {
      return;
    }

    setNoteSaving(true);
    try {
      const result = await upsertCoverageMatrixNote(
        notePopover.identity,
        note,
      );
      setNotes((previous) => {
        const next = { ...previous };
        if (result.deleted || !result.note.trim()) {
          delete next[result.key];
        } else {
          next[result.key] = result.note;
        }
        return next;
      });
      setNotePopover(null);
      showToast(result.deleted ? "备注已清除。" : "备注已保存。", "success");
    } catch (error) {
      showToast(getCoverageMatrixNotesErrorMessage(error), "error");
    } finally {
      setNoteSaving(false);
    }
  }

  const activeNoteKey = notePopover
    ? buildMatrixCellNoteKey(notePopover.identity)
    : "";
  const activeNote = activeNoteKey ? (notes[activeNoteKey] ?? "") : "";

  return (
    <LibraryShell
      activeView="stats"
      subtitleOverride="按书名号 × 科目版本展示年级覆盖（仅统计正常资料）"
    >
      <main className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <MatrixFilters
            values={filters}
            options={filterOptions}
            onChange={handleFiltersChange}
            onSearch={handleSearch}
            onReset={handleReset}
          />
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting || loading || !filtersInitialized}
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
          <span>备注格数：{Object.keys(notes).length} 格</span>
        </div>

        <CoverageMatrixTable
          data={data}
          loading={loading || !filtersInitialized}
          drillDownFilters={filters}
          notes={notes}
          onOpenNote={handleOpenNote}
        />

        <MatrixCellNotePopover
          open={Boolean(notePopover)}
          title={
            notePopover
              ? `${notePopover.identity.bookTitle} · ${notePopover.columnLabel}`
              : ""
          }
          initialNote={activeNote}
          saving={noteSaving}
          anchorRect={notePopover?.anchorRect ?? null}
          onSave={(note) => void persistNote(note)}
          onClear={() => void persistNote("")}
          onClose={handleCloseNote}
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
