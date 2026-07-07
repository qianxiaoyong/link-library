"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  backupDatabase,
  batchUpdateLinks,
  createLink,
  defaultLinkFilterOptions,
  deleteLink,
  downloadExportExcel,
  fetchLinkFilterOptions,
  fetchLinkFilters,
  getErrorMessage,
  getLink,
  listLinks,
  saveLinkFilters,
  updateLink,
  type LinkFilterOptions,
  type LinkSavedFilters,
} from "@/shared/api/links-client";
import type {
  CreateResourceLinkInput,
  ResourceLink,
  UpdateResourceLinkInput,
} from "@/shared/types/resource-link";
import {
  LinkBatchEditDialog,
  type BatchEditResult,
} from "./LinkBatchEditDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import {
  defaultLinkFilterValues,
  LinkFilters,
  type LinkFilterValues,
} from "./LinkFilters";
import { LinkDetailPanel } from "./LinkDetailPanel";
import { LinkFormDialog, type LinkFormMode } from "./LinkFormDialog";
import { LinkImportDialog } from "./LinkImportDialog";
import { LinkTable } from "./LinkTable";
import {
  DEFAULT_PAGE_SIZE,
  getDisplayRange,
  type PageSizeOption,
} from "./link-pagination-utils";
import { LinkPagination } from "./LinkPagination";
import { itemMatchesFilters } from "./link-filter-utils";
import { copyToClipboard } from "./link-ui-utils";
import { getToastClassName, usePageToast } from "./use-page-toast";
import { LibraryShell } from "@/components/library-shell/LibraryShell";
import {
  getWorkspaceErrorMessage,
  openBackupDirectory,
} from "@/shared/api/workspace-client";

const PAGE_SIZE = DEFAULT_PAGE_SIZE;

function toSavedFilters(filters: LinkFilterValues): LinkSavedFilters {
  return {
    platform: filters.platform,
    status: filters.status,
    favorite: filters.favorite,
    resourceCategory: filters.resourceCategory,
    schoolStage: filters.schoolStage,
    grade: filters.grade,
    semester: filters.semester,
    subject: filters.subject,
    resourceYear: filters.resourceYear,
    textbookEdition: filters.textbookEdition,
  };
}

function fromSavedFilters(saved: LinkSavedFilters): LinkFilterValues {
  return {
    ...defaultLinkFilterValues,
    ...saved,
    q: "",
  };
}

function hasDeepLinkFilters(filters: LinkFilterValues): boolean {
  const defaults = defaultLinkFilterValues;

  return (
    filters.q !== defaults.q ||
    filters.platform !== defaults.platform ||
    filters.status !== defaults.status ||
    filters.favorite !== defaults.favorite ||
    filters.resourceCategory !== defaults.resourceCategory ||
    filters.schoolStage !== defaults.schoolStage ||
    filters.grade !== defaults.grade ||
    filters.semester !== defaults.semester ||
    filters.subject !== defaults.subject ||
    filters.resourceYear !== defaults.resourceYear ||
    filters.textbookEdition !== defaults.textbookEdition
  );
}

function filtersToParams(
  filters: LinkFilterValues,
  pageOffset: number,
  pageSize: number = PAGE_SIZE,
): Parameters<typeof listLinks>[0] {
  return {
    q: filters.q || undefined,
    platform: filters.platform,
    status: filters.status,
    favorite: filters.favorite,
    resourceCategory: filters.resourceCategory,
    schoolStage: filters.schoolStage || undefined,
    grade: filters.grade || undefined,
    semester: filters.semester || undefined,
    subject: filters.subject || undefined,
    resourceYear: filters.resourceYear || undefined,
    textbookEdition: filters.textbookEdition || undefined,
    limit: pageSize,
    offset: pageOffset,
  };
}

function filtersToExportParams(
  filters: LinkFilterValues,
): Omit<Parameters<typeof downloadExportExcel>[0], "scope"> {
  return {
    q: filters.q || undefined,
    platform: filters.platform,
    status: filters.status,
    favorite: filters.favorite,
    resourceCategory: filters.resourceCategory,
    schoolStage: filters.schoolStage || undefined,
    grade: filters.grade || undefined,
    semester: filters.semester || undefined,
    subject: filters.subject || undefined,
    resourceYear: filters.resourceYear || undefined,
    textbookEdition: filters.textbookEdition || undefined,
  };
}

export type LinkLibraryPageProps = {
  initialFilters?: LinkFilterValues;
};

export function LinkLibraryPage({
  initialFilters = defaultLinkFilterValues,
}: LinkLibraryPageProps) {
  const { toast, showToast } = usePageToast();
  const [filters, setFilters] = useState<LinkFilterValues>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<LinkFilterValues>(initialFilters);
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const skipNextPersistRef = useRef(false);
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState<PageSizeOption>(DEFAULT_PAGE_SIZE);
  const [items, setItems] = useState<ResourceLink[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ResourceLink | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<LinkFormMode>("create");
  const [editingItem, setEditingItem] = useState<ResourceLink | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [openingBackupDir, setOpeningBackupDir] = useState(false);
  const [batchEditOpen, setBatchEditOpen] = useState(false);
  const [batchEditSaving, setBatchEditSaving] = useState(false);
  const [batchEditSelectedCount, setBatchEditSelectedCount] = useState(0);
  const [batchEditSession, setBatchEditSession] = useState(0);
  const [batchEditResult, setBatchEditResult] = useState<BatchEditResult | null>(
    null,
  );
  const [deleteConfirmItem, setDeleteConfirmItem] =
    useState<ResourceLink | null>(null);
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [filterOptions, setFilterOptions] = useState<LinkFilterOptions>(
    defaultLinkFilterOptions,
  );

  const loadFilterOptions = useCallback(async () => {
    try {
      const result = await fetchLinkFilterOptions();
      setFilterOptions(result);
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  }, [showToast]);

  const persistFilters = useCallback(
    async (nextFilters: LinkFilterValues) => {
      try {
        await saveLinkFilters(toSavedFilters(nextFilters));
      } catch (error) {
        showToast(getErrorMessage(error), "error");
      }
    },
    [showToast],
  );

  const displayRange = useMemo(
    () => getDisplayRange(total, offset, pageSize),
    [total, offset, pageSize],
  );

  const refreshList = useCallback(
    async (
      nextFilters: LinkFilterValues,
      nextOffset: number,
      keepSelection = true,
      nextPageSize = pageSize,
    ) => {
      setLoading(true);

      try {
        const result = await listLinks(
          filtersToParams(nextFilters, nextOffset, nextPageSize),
        );
        setItems(result.items);
        setTotal(result.total);
        setSelectedItem((current) => {
          if (!keepSelection || !current) return current;
          return result.items.find((item) => item.id === current.id) ?? null;
        });
        setSelectedRowIds((current) => {
          const next = new Set<string>();
          for (const id of current) {
            if (result.items.some((item) => item.id === id)) {
              next.add(id);
            }
          }
          return next;
        });
      } catch (error) {
        showToast(getErrorMessage(error), "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast, pageSize],
  );

  const applyLocalItemUpdate = useCallback(
    (updated: ResourceLink) => {
      const matches = itemMatchesFilters(updated, appliedFilters);

      setItems((current) => {
        const index = current.findIndex((item) => item.id === updated.id);
        if (!matches) {
          if (index === -1) return current;
          return current.filter((item) => item.id !== updated.id);
        }
        if (index === -1) return current;
        const next = [...current];
        next[index] = updated;
        return next;
      });

      if (!matches) {
        setTotal((current) => Math.max(0, current - 1));
        setSelectedRowIds((current) => {
          if (!current.has(updated.id)) return current;
          const next = new Set(current);
          next.delete(updated.id);
          return next;
        });
        setSelectedItem((current) =>
          current?.id === updated.id ? null : current,
        );
        return;
      }

      setSelectedItem((current) =>
        current?.id === updated.id ? updated : current,
      );
    },
    [appliedFilters],
  );

  useEffect(() => {
    void loadFilterOptions();
  }, [loadFilterOptions]);

  useEffect(() => {
    async function initializeFilters() {
      try {
        skipNextPersistRef.current = true;

        if (hasDeepLinkFilters(initialFilters)) {
          setFilters(initialFilters);
          setAppliedFilters(initialFilters);
          setOffset(0);
          setFiltersInitialized(true);
          return;
        }

        const saved = await fetchLinkFilters();
        const restored = fromSavedFilters(saved);
        setFilters(restored);
        setAppliedFilters(restored);
        setOffset(0);
      } catch (error) {
        showToast(getErrorMessage(error), "error");
      } finally {
        setFiltersInitialized(true);
      }
    }

    void initializeFilters();
  }, [initialFilters, showToast]);

  useEffect(() => {
    if (!filtersInitialized) {
      return;
    }

    let active = true;

    async function loadInitial() {
      setLoading(true);

      try {
        const result = await listLinks(
          filtersToParams(appliedFilters, offset, pageSize),
        );
        if (!active) return;
        setItems(result.items);
        setTotal(result.total);
        setSelectedRowIds(new Set());
      } catch (error) {
        if (!active) return;
        showToast(getErrorMessage(error), "error");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadInitial();

    return () => {
      active = false;
    };
  }, [appliedFilters, offset, pageSize, showToast, filtersInitialized]);

  useEffect(() => {
    if (!filtersInitialized) {
      return;
    }

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    void persistFilters(appliedFilters);
  }, [appliedFilters, filtersInitialized, persistFilters]);

  function applyFilters(nextFilters: LinkFilterValues, resetOffset = true) {
    if (resetOffset) setOffset(0);
    setAppliedFilters(nextFilters);
    setSelectedRowIds(new Set());
  }

  function handleSearch() {
    applyFilters(filters);
  }

  function handleDropdownApply(nextFilters: LinkFilterValues) {
    setFilters(nextFilters);
    applyFilters(nextFilters);
  }

  function handleResetFilters() {
    setFilters(defaultLinkFilterValues);
    applyFilters(defaultLinkFilterValues);
  }

  function handleToggleRow(id: string, checked: boolean) {
    setSelectedRowIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleToggleAll(checked: boolean) {
    if (!checked) {
      setSelectedRowIds(new Set());
      return;
    }
    setSelectedRowIds(new Set(items.map((item) => item.id)));
  }

  function openCreateForm() {
    setFormMode("create");
    setEditingItem(null);
    setFormError("");
    setFormOpen(true);
  }

  function openEditForm(item: ResourceLink) {
    setFormMode("edit");
    setEditingItem(item);
    setFormError("");
    setFormOpen(true);
  }

  async function handleFormSubmit(
    payload: CreateResourceLinkInput | UpdateResourceLinkInput,
  ) {
    setFormSaving(true);
    setFormError("");

    try {
      if (formMode === "create") {
        const created = await createLink(payload as CreateResourceLinkInput);
        setFormOpen(false);
        await refreshList(appliedFilters, offset);
        setSelectedItem(created);
        showToast("新增资料成功。", "success");
        return;
      }

      if (!editingItem) return;

      const updated = await updateLink(
        editingItem.id,
        payload as UpdateResourceLinkInput,
      );
      setFormOpen(false);
      applyLocalItemUpdate(updated);
      setSelectedItem(updated);
      showToast("编辑资料成功。", "success");
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setFormSaving(false);
    }
  }

  function requestDelete(item: ResourceLink) {
    setDeleteConfirmItem(item);
  }

  async function confirmDelete() {
    if (!deleteConfirmItem) return;

    setDeleteConfirming(true);
    const item = deleteConfirmItem;

    try {
      await deleteLink(item.id);
      const index = items.findIndex((entry) => entry.id === item.id);
      const nextItems = items.filter((entry) => entry.id !== item.id);
      setItems(nextItems);
      setTotal((current) => Math.max(0, current - 1));
      setSelectedItem((current) => {
        if (current?.id !== item.id) return current;
        return nextItems[index] ?? nextItems[index - 1] ?? null;
      });
      setSelectedRowIds((current) => {
        const next = new Set(current);
        next.delete(item.id);
        return next;
      });
      setDeleteConfirmItem(null);
      showToast("删除资料成功。", "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setDeleteConfirming(false);
    }
  }

  async function handleToggleFavorite(item: ResourceLink) {
    try {
      const updated = await updateLink(item.id, {
        favorite: !item.favorite,
      });
      applyLocalItemUpdate(updated);
      showToast(updated.favorite ? "已收藏。" : "已取消收藏。", "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  }

  async function handleToggleStatus(item: ResourceLink) {
    try {
      const updated = await updateLink(item.id, {
        status: item.status === "normal" ? "invalid" : "normal",
      });
      applyLocalItemUpdate(updated);
      showToast(
        updated.status === "invalid" ? "已标记为已失效。" : "已标记为正常。",
        "success",
      );
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  }

  const handleDetailFieldUpdate = useCallback(
    async (id: string, patch: UpdateResourceLinkInput) => {
      try {
        const updated = await updateLink(id, patch);
        applyLocalItemUpdate(updated);
      } catch (error) {
        showToast(getErrorMessage(error), "error");
        throw error;
      }
    },
    [applyLocalItemUpdate, showToast],
  );

  async function handleCopyInfo(item: ResourceLink) {
    if (!item.sourceText?.trim()) {
      showToast("当前资料没有原始输入内容。", "warning");
      return;
    }

    try {
      await copyToClipboard(item.sourceText);
      showToast("已复制原始输入信息。", "success");
    } catch {
      showToast("复制失败，请手动复制。", "error");
    }
  }

  async function handleBatchCopySourceText() {
    const ids = Array.from(selectedRowIds);
    if (ids.length === 0) {
      return;
    }

    const itemById = new Map(items.map((item) => [item.id, item]));
    const sourceTexts: string[] = [];

    for (const id of ids) {
      let item = itemById.get(id);
      if (!item) {
        try {
          item = await getLink(id);
        } catch {
          continue;
        }
      }

      const text = item.sourceText?.trim();
      if (text) {
        sourceTexts.push(text);
      }
    }

    if (sourceTexts.length === 0) {
      showToast("所选资料均没有原始输入内容。", "warning");
      return;
    }

    try {
      await copyToClipboard(sourceTexts.join("\n\n"));
      const skippedCount = ids.length - sourceTexts.length;
      if (skippedCount > 0) {
        showToast(
          `已复制 ${sourceTexts.length} 条原始输入，${skippedCount} 条无内容已跳过。`,
          "success",
        );
      } else {
        showToast(`已复制 ${sourceTexts.length} 条原始输入。`, "success");
      }
    } catch {
      showToast("复制失败，请手动复制。", "error");
    }
  }

  function handlePageChange(page: number) {
    setOffset((page - 1) * pageSize);
  }

  function handlePageSizeChange(nextPageSize: PageSizeOption) {
    setPageSize(nextPageSize);
    setOffset(0);
  }

  function handleExportExcel() {
    try {
      downloadExportExcel({
        scope: "filtered",
        ...filtersToExportParams(appliedFilters),
      });
      showToast("已开始导出 Excel。", "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  }

  async function handleBackupDatabase() {
    setBackingUp(true);

    try {
      const result = await backupDatabase();
      showToast(
        `备份成功：${result.backupPath}`,
        "success",
      );
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setBackingUp(false);
    }
  }

  async function handleOpenBackupDirectory() {
    setOpeningBackupDir(true);

    try {
      const result = await openBackupDirectory();
      showToast(`已打开备份目录：${result.backupDirectory}`, "success");
    } catch (error) {
      showToast(getWorkspaceErrorMessage(error), "error");
    } finally {
      setOpeningBackupDir(false);
    }
  }

  function openBatchEditDialog() {
    setBatchEditSelectedCount(selectedRowIds.size);
    setBatchEditResult(null);
    setBatchEditSession((current) => current + 1);
    setBatchEditOpen(true);
  }

  function closeBatchEditDialog() {
    setBatchEditOpen(false);
    setBatchEditResult(null);
  }

  async function handleBatchEditSubmit(patch: UpdateResourceLinkInput) {
    const ids = Array.from(selectedRowIds);
    if (ids.length === 0) return;

    setBatchEditSaving(true);

    const titleById = new Map(items.map((item) => [item.id, item.title]));

    try {
      const result = await batchUpdateLinks(ids, patch);
      const failuresWithTitle = result.failures.map((failure) => ({
        ...failure,
        title: titleById.get(failure.id),
      }));
      const fullResult: BatchEditResult = {
        successCount: result.successCount,
        failureCount: result.failureCount,
        failures: failuresWithTitle,
      };

      showToast(
        `批量编辑完成：成功 ${result.successCount} 条，失败 ${result.failureCount} 条。`,
        result.failureCount > 0 ? "warning" : "success",
      );
      setSelectedRowIds(new Set());
      for (const updated of result.updated) {
        applyLocalItemUpdate(updated);
      }

      if (result.failureCount === 0) {
        closeBatchEditDialog();
      } else {
        setBatchEditResult(fullResult);
      }
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setBatchEditSaving(false);
    }
  }

  return (
    <LibraryShell
      activeView="links"
      actions={
        <>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="whitespace-nowrap rounded bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            批量导入
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            className="whitespace-nowrap rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
          >
            新增资料
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="whitespace-nowrap rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
          >
            导出Excel
          </button>
          <button
            type="button"
            onClick={() => void handleBackupDatabase()}
            disabled={backingUp}
            className="whitespace-nowrap rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
          >
            {backingUp ? "备份中..." : "备份数据库"}
          </button>
          <button
            type="button"
            onClick={() => void handleOpenBackupDirectory()}
            disabled={openingBackupDir}
            className="whitespace-nowrap rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
          >
            {openingBackupDir ? "打开中..." : "打开目录"}
          </button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2 px-4 py-2">
        <LinkFilters
          values={filters}
          options={filterOptions}
          onChange={setFilters}
          onSearch={handleSearch}
          onReset={handleResetFilters}
          onDropdownApply={handleDropdownApply}
        />

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex min-h-0 min-w-0 flex-col">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white">
              <div
                className={`flex h-9 shrink-0 items-center gap-3 border-b px-3 text-sm ${
                  selectedRowIds.size > 0
                    ? "border-blue-200 bg-blue-50 text-blue-900"
                    : "border-zinc-200 bg-white"
                }`}
              >
                {selectedRowIds.size > 0 ? (
                  <>
                    <span className="text-xs font-medium">
                      已选择 {selectedRowIds.size} 条
                    </span>
                    <button
                      type="button"
                      className="rounded border border-blue-300 bg-white px-2 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      onClick={() => void handleBatchCopySourceText()}
                    >
                      批量复制
                    </button>
                    <button
                      type="button"
                      className="rounded border border-blue-300 bg-white px-2 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      onClick={openBatchEditDialog}
                    >
                      批量编辑
                    </button>
                    <button
                      type="button"
                      className="text-xs text-blue-700 hover:underline"
                      onClick={() => setSelectedRowIds(new Set())}
                    >
                      取消选择
                    </button>
                  </>
                ) : null}
              </div>

              {loading || !filtersInitialized ? (
                <div className="flex h-full items-center justify-center text-sm text-zinc-600">
                  加载中...
                </div>
              ) : (
                <div className="min-h-0 flex-1 overflow-auto">
                  <LinkTable
                    items={items}
                    offset={offset}
                    selectedId={selectedItem?.id ?? null}
                    selectedRowIds={selectedRowIds}
                    onSelect={setSelectedItem}
                    onToggleRow={handleToggleRow}
                    onToggleAll={handleToggleAll}
                    onCopyInfo={(item) => void handleCopyInfo(item)}
                    onEdit={openEditForm}
                    onDelete={requestDelete}
                  />
                </div>
              )}

              <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-3 py-2 text-xs text-zinc-700">
                <div className="shrink-0 whitespace-nowrap">
                  共 {total} 条，显示 {displayRange.start}-{displayRange.end} 条
                </div>
                <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
                  {toast ? (
                    <span
                      className={`max-w-[360px] truncate rounded px-2 py-0.5 text-xs ${getToastClassName(toast.variant)}`}
                      title={toast.message}
                    >
                      {toast.message}
                    </span>
                  ) : null}
                  <LinkPagination
                    total={total}
                    offset={offset}
                    pageSize={pageSize}
                    onPageSizeChange={handlePageSizeChange}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="hidden min-h-0 xl:block">
            <LinkDetailPanel
              item={selectedItem}
              onEdit={openEditForm}
              onDelete={requestDelete}
              onToggleFavorite={(item) => void handleToggleFavorite(item)}
              onToggleStatus={(item) => void handleToggleStatus(item)}
              onUpdateField={handleDetailFieldUpdate}
              onShowToast={showToast}
            />
          </div>
        </div>
      </div>

      <LinkFormDialog
        open={formOpen}
        mode={formMode}
        initialItem={editingItem}
        saving={formSaving}
        errorMessage={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={(values) => void handleFormSubmit(values)}
      />

      <LinkImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onComplete={(hint) => {
          void refreshList(appliedFilters, offset, false);
          if (hint) {
            showToast(hint, "success");
          }
        }}
      />

      <LinkBatchEditDialog
        key={batchEditSession}
        open={batchEditOpen}
        selectedCount={batchEditSelectedCount}
        saving={batchEditSaving}
        result={batchEditResult}
        onClose={closeBatchEditDialog}
        onSubmit={(patch) => void handleBatchEditSubmit(patch)}
      />

      <ConfirmDialog
        open={deleteConfirmItem !== null}
        title="删除资料"
        message="确定要删除这条资料吗？此操作无法撤销。"
        confirmLabel="删除"
        variant="danger"
        confirming={deleteConfirming}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleteConfirming) setDeleteConfirmItem(null);
        }}
      />
    </LibraryShell>
  );
}
