"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  backupDatabase,
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
  defaultLinkFilterValues,
  LinkFilters,
  type LinkFilterValues,
} from "./LinkFilters";
import { LinkDetailPanel } from "./LinkDetailPanel";
import { LinkFormDialog, type LinkFormMode } from "./LinkFormDialog";
import { LinkImportDialog } from "./LinkImportDialog";
import { LinkTable } from "./LinkTable";

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
  const [filters, setFilters] = useState<LinkFilterValues>(defaultLinkFilterValues);
  const [appliedFilters, setAppliedFilters] =
    useState<LinkFilterValues>(defaultLinkFilterValues);
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<ResourceLink[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState<ResourceLink | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<LinkFormMode>("create");
  const [editingItem, setEditingItem] = useState<ResourceLink | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importHint, setImportHint] = useState("");
  const [backupMessage, setBackupMessage] = useState("");
  const [backingUp, setBackingUp] = useState(false);

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
      setErrorMessage("");

      try {
        const result = await listLinks(filtersToParams(nextFilters, nextOffset));
        setItems(result.items);
        setTotal(result.total);
        setSelectedItem((current) => {
          if (!keepSelection || !current) return current;
          return result.items.find((item) => item.id === current.id) ?? null;
        });
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      setLoading(true);
      setErrorMessage("");

      try {
        const result = await listLinks(filtersToParams(appliedFilters, offset));
        if (!active) return;
        setItems(result.items);
        setTotal(result.total);
      } catch (error) {
        if (!active) return;
        setErrorMessage(getErrorMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadInitial();

    return () => {
      active = false;
    };
  }, [appliedFilters, offset]);

  function handleSearch() {
    setOffset(0);
    setAppliedFilters(filters);
  }

  function handleResetFilters() {
    setFilters(defaultLinkFilterValues);
    setAppliedFilters(defaultLinkFilterValues);
    setOffset(0);
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
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setFormSaving(false);
    }
  }

  async function handleDelete(item: ResourceLink) {
    const confirmed = window.confirm(
      "确定要删除这条资料吗？此操作无法撤销。",
    );
    if (!confirmed) return;

    try {
      await deleteLink(item.id);
      const index = items.findIndex((entry) => entry.id === item.id);
      const nextItems = items.filter((entry) => entry.id !== item.id);
      setSelectedItem((current) => {
        if (current?.id !== item.id) return current;
        return nextItems[index] ?? nextItems[index - 1] ?? null;
      });
      await refreshList(appliedFilters, offset, false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  async function handleToggleFavorite(item: ResourceLink) {
    try {
      const updated = await updateLink(item.id, {
        favorite: !item.favorite,
      });
      setSelectedItem(updated);
      await refreshList(appliedFilters, offset);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
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
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
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

  function handleExportFiltered() {
    downloadExportExcel({
      scope: "filtered",
      ...filtersToExportParams(appliedFilters),
    });
  }

  function handleExportAll() {
    downloadExportExcel({ scope: "all" });
  }

  async function handleBackupDatabase() {
    setBackingUp(true);
    setBackupMessage("");
    setErrorMessage("");

    try {
      const result = await backupDatabase();
      setBackupMessage(
        `数据库备份成功：${result.fileName}\n备份路径：${result.backupPath}`,
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBackingUp(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">学习资料链接库</h1>
            <p className="mt-1 text-sm text-zinc-600">管理百度网盘与夸克网盘学习资料链接</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={handleExportFiltered}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              导出当前筛选
            </button>
            <button
              type="button"
              onClick={handleExportAll}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              导出全部资料
            </button>
            <button
              type="button"
              onClick={() => void handleBackupDatabase()}
              disabled={backingUp}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
            >
              {backingUp ? "备份中..." : "备份数据库"}
            </button>
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              批量导入
            </button>
            <button
              type="button"
              onClick={openCreateForm}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              新增资料
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-4 px-4 py-4">
        <LinkFilters
          values={filters}
          onChange={setFilters}
          onSearch={handleSearch}
          onReset={handleResetFilters}
        />

        {backupMessage ? (
          <div className="whitespace-pre-line rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {backupMessage}
          </div>
        ) : null}

        {importHint ? (
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {importHint}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-10 text-center text-zinc-600">
            加载中...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <LinkTable
                items={items}
                selectedId={selectedItem?.id ?? null}
                onSelect={setSelectedItem}
                onEdit={openEditForm}
                onDelete={(item) => void handleDelete(item)}
              />

              <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
                <div>
                  共 {total} 条，第 {currentPage} / {totalPages} 页
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 disabled:opacity-50"
                    onClick={handlePrevPage}
                    disabled={offset === 0}
                  >
                    上一页
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 disabled:opacity-50"
                    onClick={handleNextPage}
                    disabled={offset + PAGE_SIZE >= total}
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>

            <LinkDetailPanel
              item={selectedItem}
              onEdit={openEditForm}
              onDelete={(item) => void handleDelete(item)}
              onToggleFavorite={(item) => void handleToggleFavorite(item)}
              onToggleStatus={(item) => void handleToggleStatus(item)}
            />
          </div>
        )}
      </main>

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
          setImportHint(hint ?? "");
        }}
      />
    </div>
  );
}
