"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  defaultMatrixFilterValues,
  MatrixFilters,
  type MatrixFilterValues,
} from "./MatrixFilters";
import { CoverageMatrixTable } from "./CoverageMatrixTable";
import { MatrixCellContextMenu } from "./MatrixCellContextMenu";
import { MatrixCellLinksPopover } from "./MatrixCellLinksPopover";
import { MatrixCellNotePopover } from "./MatrixCellNotePopover";
import type { MatrixCellInteractionPayload } from "./MatrixCell";
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
  buildMatrixCellLinksListParams,
  type MatrixCellLinksListParams,
} from "@/shared/library/deep-link-filters";
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

type LinksPopoverState = {
  title: string;
  listParams: MatrixCellLinksListParams;
  anchorRect: DOMRect;
};

type ContextMenuState = {
  identity: MatrixCellNoteIdentity;
  anchorRect: DOMRect;
  columnLabel: string;
  x: number;
  y: number;
};

function filtersToParams(
  filters: MatrixFilterValues,
  appliedBookTitle: string,
): Parameters<typeof fetchCoverageMatrix>[0] {
  return {
    bookTitle: appliedBookTitle.trim() || undefined,
    platform: filters.platform || undefined,
    resourceYear: filters.resourceYear || undefined,
    semester: filters.semester || undefined,
    schoolStage: filters.schoolStage || undefined,
    subject: filters.subject || undefined,
    textbookEdition: filters.textbookEdition || undefined,
    resourceCategory: filters.resourceCategory || undefined,
  };
}

function toSavedFilters(
  filters: MatrixFilterValues,
): Parameters<typeof saveCoverageMatrixFilters>[0] {
  const { bookTitle: _bookTitle, ...saved } = filters;
  return saved;
}

export function CoverageMatrixPage() {
  const { toast, showToast } = useStatsToast();
  const [filters, setFilters] = useState<MatrixFilterValues>(
    defaultMatrixFilterValues,
  );
  const [appliedBookTitle, setAppliedBookTitle] = useState("");
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const skipNextPersistRef = useRef(false);
  const [data, setData] = useState<CoverageMatrixResponse | null>(null);
  const [filterOptions, setFilterOptions] = useState<CoverageMatrixFilterOptions>(
    defaultCoverageMatrixFilterOptions,
  );
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [notePopover, setNotePopover] = useState<NotePopoverState | null>(null);
  const [linksPopover, setLinksPopover] = useState<LinksPopoverState | null>(
    null,
  );
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
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
    async (nextFilters: MatrixFilterValues, nextAppliedBookTitle: string) => {
      setLoading(true);

      try {
        const result = await fetchCoverageMatrix(
          filtersToParams(nextFilters, nextAppliedBookTitle),
        );
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
        await saveCoverageMatrixFilters(toSavedFilters(nextFilters));
      } catch (error) {
        showToast(getCoverageMatrixErrorMessage(error), "error");
      }
    },
    [showToast],
  );

  const dropdownFilters = useMemo(
    () => toSavedFilters(filters),
    [
      filters.platform,
      filters.resourceYear,
      filters.semester,
      filters.schoolStage,
      filters.subject,
      filters.textbookEdition,
      filters.resourceCategory,
    ],
  );

  useEffect(() => {
    async function initializeFilters() {
      try {
        const saved = await fetchCoverageMatrixFilters();
        skipNextPersistRef.current = true;
        setFilters({ ...defaultMatrixFilterValues, ...saved });
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

    void loadMatrix(filters, appliedBookTitle);

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    void persistFilters(filters);
  }, [
    dropdownFilters,
    appliedBookTitle,
    filtersInitialized,
    loadMatrix,
    persistFilters,
  ]);

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
    setAppliedBookTitle(filters.bookTitle);
  }

  function handleReset() {
    setFilters(defaultMatrixFilterValues);
    setAppliedBookTitle("");
  }

  function handleExportExcel() {
    setExporting(true);
    try {
      downloadCoverageMatrixExcel(filtersToParams(filters, appliedBookTitle));
      showToast("已开始导出覆盖矩阵 Excel。", "success");
    } catch (error) {
      showToast(getCoverageMatrixErrorMessage(error), "error");
    } finally {
      setExporting(false);
    }
  }

  function handleOpenLinks(payload: MatrixCellInteractionPayload) {
    setContextMenu(null);
    setNotePopover(null);
    setLinksPopover({
      title: `${payload.identity.bookTitle} · ${payload.columnLabel}`,
      listParams: buildMatrixCellLinksListParams(
        filters,
        payload.identity.bookTitle,
        {
          subject: payload.identity.subject,
          textbookEdition: payload.identity.textbookEdition,
        },
        payload.identity.resourceCategory,
      ),
      anchorRect: payload.anchorRect,
    });
  }

  function handleOpenContextMenu(payload: MatrixCellInteractionPayload) {
    setLinksPopover(null);
    setNotePopover(null);
    setContextMenu({
      identity: payload.identity,
      anchorRect: payload.anchorRect,
      columnLabel: payload.columnLabel,
      x: payload.clientX,
      y: payload.clientY,
    });
  }

  function handleOpenNote(payload: NotePopoverState) {
    setLinksPopover(null);
    setContextMenu(null);
    setNotePopover(payload);
  }

  function handleCloseNote() {
    if (noteSaving) {
      return;
    }
    setNotePopover(null);
  }

  function handleEditNoteFromMenu() {
    if (!contextMenu) {
      return;
    }
    const next = {
      identity: contextMenu.identity,
      anchorRect: contextMenu.anchorRect,
      columnLabel: contextMenu.columnLabel,
    };
    setContextMenu(null);
    handleOpenNote(next);
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
      actions={
        <button
          type="button"
          onClick={handleExportExcel}
          disabled={exporting || loading || !filtersInitialized}
          className="whitespace-nowrap rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
        >
          {exporting ? "导出中..." : "导出Excel"}
        </button>
      }
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
          onOpenLinks={handleOpenLinks}
          onOpenContextMenu={handleOpenContextMenu}
        />

        <MatrixCellLinksPopover
          open={Boolean(linksPopover)}
          title={linksPopover?.title ?? ""}
          listParams={linksPopover?.listParams ?? null}
          anchorRect={linksPopover?.anchorRect ?? null}
          onShowToast={showToast}
          onClose={() => setLinksPopover(null)}
        />

        <MatrixCellContextMenu
          open={Boolean(contextMenu)}
          position={
            contextMenu ? { x: contextMenu.x, y: contextMenu.y } : null
          }
          onEditNote={handleEditNoteFromMenu}
          onClose={() => setContextMenu(null)}
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
