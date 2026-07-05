"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  backupDatabase,
  batchUpdateLinks,
  createLink,
  deleteLink,
  downloadExportExcel,
  getErrorMessage,
  listLinks,
  updateLink,
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
import { copyToClipboard } from "./link-ui-utils";
import { getToastClassName, usePageToast } from "./use-page-toast";

const PAGE_SIZE = 50;

function filtersToParams(
  filters: LinkFilterValues,
  pageOffset: number,
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
    limit: PAGE_SIZE,
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
  };
}

export function LinkLibraryPage() {
  const { toast, showToast } = usePageToast();
  const [filters, setFilters] = useState<LinkFilterValues>(defaultLinkFilterValues);
  const [appliedFilters, setAppliedFilters] =
    useState<LinkFilterValues>(defaultLinkFilterValues);
  const [offset, setOffset] = useState(0);
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

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  );
  const currentPage = useMemo(
    () => Math.floor(offset / PAGE_SIZE) + 1,
    [offset],
  );

  const refreshList = useCallback(
    async (
      nextFilters: LinkFilterValues,
      nextOffset: number,
      keepSelection = true,
    ) => {
      setLoading(true);

      try {
        const result = await listLinks(filtersToParams(nextFilters, nextOffset));
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
    [showToast],
  );

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      setLoading(true);

      try {
        const result = await listLinks(filtersToParams(appliedFilters, offset));
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
  }, [appliedFilters, offset, showToast]);

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
      await refreshList(appliedFilters, offset);
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
      await refreshList(appliedFilters, offset, false);
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
      setSelectedItem(updated);
      await refreshList(appliedFilters, offset);
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

      if (appliedFilters.status === "normal" && updated.status === "invalid") {
        setSelectedItem(null);
      } else {
        setSelectedItem(updated);
      }

      await refreshList(appliedFilters, offset, false);
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

        if (
          appliedFilters.status === "normal" &&
          updated.status === "invalid" &&
          selectedItem?.id === id
        ) {
          setSelectedItem(null);
        } else {
          setSelectedItem((current) => (current?.id === id ? updated : current));
        }

        await refreshList(appliedFilters, offset, false);
      } catch (error) {
        showToast(getErrorMessage(error), "error");
        throw error;
      }
    },
    [appliedFilters, offset, refreshList, selectedItem?.id, showToast],
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

  function handlePrevPage() {
    setOffset((current) => Math.max(0, current - PAGE_SIZE));
  }

  function handleNextPage() {
    setOffset((current) => {
      const next = current + PAGE_SIZE;
      return next >= total ? current : next;
    });
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
        `数据库备份成功：${result.fileName}`,
        "success",
      );
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setBackingUp(false);
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
      await refreshList(appliedFilters, offset, false);

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
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-100">
      <header className="shrink-0 border-b border-zinc-200 bg-white">
        <div className="flex h-14 items-center justify-between gap-4 px-4">
          <div className="min-w-0 shrink">
            <h1 className="truncate text-lg font-semibold text-zinc-900">
              学习资料链接库
            </h1>
            <p className="truncate text-xs text-zinc-600">
              管理百度网盘与夸克网盘学习资料链接
            </p>
          </div>
          <div className="flex shrink-0 flex-nowrap items-center gap-1.5 overflow-x-auto">
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
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2 px-4 py-2">
        <LinkFilters
          values={filters}
          onChange={setFilters}
          onSearch={handleSearch}
          onReset={handleResetFilters}
          onDropdownApply={handleDropdownApply}
        />

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-h-0 min-w-0 flex-col gap-2">
            {selectedRowIds.size > 0 ? (
              <div className="flex shrink-0 flex-wrap items-center gap-3 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                <span>已选择 {selectedRowIds.size} 条</span>
                <button
                  type="button"
                  className="rounded border border-blue-300 bg-white px-2 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  onClick={openBatchEditDialog}
                >
                  批量编辑
                </button>
                <button
                  type="button"
                  className="text-blue-700 hover:underline"
                  onClick={() => setSelectedRowIds(new Set())}
                >
                  取消选择
                </button>
              </div>
            ) : null}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white">
              {loading ? (
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

              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-200 px-3 py-2 text-xs text-zinc-700">
                <div className="shrink-0 whitespace-nowrap">
                  共 {total} 条，第 {currentPage} / {totalPages} 页
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  {toast ? (
                    <span
                      className={`max-w-[360px] truncate rounded px-2 py-0.5 text-xs ${getToastClassName(toast.variant)}`}
                      title={toast.message}
                    >
                      {toast.message}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    className="shrink-0 rounded border border-zinc-300 px-2 py-1 hover:bg-zinc-50 disabled:opacity-50"
                    onClick={handlePrevPage}
                    disabled={offset === 0}
                  >
                    上一页
                  </button>
                  <button
                    type="button"
                    className="shrink-0 rounded border border-zinc-300 px-2 py-1 hover:bg-zinc-50 disabled:opacity-50"
                    onClick={handleNextPage}
                    disabled={offset + PAGE_SIZE >= total}
                  >
                    下一页
                  </button>
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
    </div>
  );
}
