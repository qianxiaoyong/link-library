"use client";

import { useEffect, useState } from "react";
import type {
  LinkStatus,
  ResourceCategory,
  ResourceLink,
  UpdateResourceLinkInput,
} from "@/shared/types/resource-link";
import { LinkStatusBadge } from "./LinkStatusBadge";
import type { PageToastVariant } from "./use-page-toast";
import {
  copyToClipboard,
  displayValue,
  formatDateTime,
  getPlatformLabel,
} from "./link-ui-utils";

type LinkDetailPanelProps = {
  item: ResourceLink | null;
  onEdit: (item: ResourceLink) => void;
  onDelete: (item: ResourceLink) => void;
  onToggleFavorite: (item: ResourceLink) => void;
  onToggleStatus: (item: ResourceLink) => void;
  onUpdateField: (
    id: string,
    patch: UpdateResourceLinkInput,
  ) => Promise<void>;
  onShowToast: (message: string, variant?: PageToastVariant) => void;
};

const inputClassName =
  "w-full min-w-0 rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:border-blue-500 disabled:bg-zinc-50";

const titleInputClassName =
  "w-full min-w-0 rounded border border-transparent bg-transparent px-0 py-0 text-base font-semibold text-zinc-900 outline-none hover:border-zinc-300 focus:border-blue-500 focus:bg-white focus:px-2 focus:py-1 disabled:bg-zinc-50";

const rowClassName =
  "grid grid-cols-[88px_1fr] gap-2 border-b border-zinc-100 py-2 text-sm";

function toNullable(value: string): string | null {
  return value.trim() === "" ? null : value.trim();
}

function DetailReadonlyRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className={rowClassName}>
      <div className="font-medium text-zinc-600">{label}</div>
      <div className="break-all text-zinc-900">{value}</div>
    </div>
  );
}

function DetailEditableRow({
  label,
  value,
  onSave,
  disabled = false,
  multiline = false,
  required = false,
  onShowToast,
}: {
  label: string;
  value: string | null;
  onSave: (nextValue: string) => Promise<void>;
  disabled?: boolean;
  multiline?: boolean;
  required?: boolean;
  onShowToast: (message: string, variant?: PageToastVariant) => void;
}) {
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  async function commitDraft() {
    const trimmed = draft.trim();
    const current = (value ?? "").trim();

    if (trimmed === current) return;

    if (required && trimmed === "") {
      setDraft(value ?? "");
      onShowToast(`${label}不能为空`, "warning");
      return;
    }

    try {
      await onSave(trimmed);
    } catch {
      setDraft(value ?? "");
    }
  }

  return (
    <div className={rowClassName}>
      <label className="font-medium text-zinc-600">{label}</label>
      <div>
        {multiline ? (
          <textarea
            className={`${inputClassName} min-h-[56px] resize-y`}
            value={draft}
            disabled={disabled}
            rows={2}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => void commitDraft()}
          />
        ) : (
          <input
            className={inputClassName}
            value={draft}
            disabled={disabled}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => void commitDraft()}
          />
        )}
      </div>
    </div>
  );
}

function DetailSelectRow<T extends string>({
  label,
  value,
  options,
  onSave,
  disabled = false,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onSave: (nextValue: T) => Promise<void>;
  disabled?: boolean;
}) {
  async function handleChange(nextValue: T) {
    if (nextValue === value) return;

    try {
      await onSave(nextValue);
    } catch {
      // 父组件已提示错误，select 会随 item 回滚
    }
  }

  return (
    <div className={rowClassName}>
      <label className="font-medium text-zinc-600">{label}</label>
      <select
        className={inputClassName}
        value={value}
        disabled={disabled}
        onChange={(event) => void handleChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type LinkDetailPanelContentProps = Omit<LinkDetailPanelProps, "item"> & {
  item: ResourceLink;
};

function LinkDetailPanelContent({
  item,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleStatus,
  onUpdateField,
  onShowToast,
}: LinkDetailPanelContentProps) {
  const [titleDraft, setTitleDraft] = useState(item.title);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitleDraft(item.title);
  }, [item.title]);

  async function savePatch(patch: UpdateResourceLinkInput) {
    setSaving(true);
    try {
      await onUpdateField(item.id, patch);
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyInfo(current: ResourceLink) {
    if (!current.sourceText?.trim()) {
      onShowToast("当前资料没有原始输入内容。", "warning");
      return;
    }

    try {
      await copyToClipboard(current.sourceText);
      onShowToast("已复制原始输入内容。", "success");
    } catch {
      onShowToast("复制失败，请稍后重试。", "error");
    }
  }

  async function commitTitle() {
    const trimmed = titleDraft.trim();
    if (trimmed === item.title.trim()) return;

    if (trimmed === "") {
      setTitleDraft(item.title);
      onShowToast("标题不能为空", "warning");
      return;
    }

    try {
      await savePatch({ title: trimmed });
    } catch {
      setTitleDraft(item.title);
    }
  }

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="shrink-0 border-b border-zinc-100 p-3">
        <input
          className={titleInputClassName}
          value={titleDraft}
          disabled={saving}
          onChange={(event) => setTitleDraft(event.target.value)}
          onBlur={() => void commitTitle()}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <LinkStatusBadge status={item.status} />
          {item.favorite ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
              已收藏
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50"
            onClick={() => void handleCopyInfo(item)}
          >
            复制信息
          </button>
          <button
            type="button"
            className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50"
            onClick={() => onEdit(item)}
          >
            编辑
          </button>
          <button
            type="button"
            className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
            onClick={() => onDelete(item)}
          >
            删除
          </button>
          <button
            type="button"
            className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50"
            onClick={() => onToggleFavorite(item)}
          >
            {item.favorite ? "取消收藏" : "收藏"}
          </button>
          <button
            type="button"
            className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50"
            onClick={() => onToggleStatus(item)}
          >
            {item.status === "normal" ? "标记已失效" : "标记正常"}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <DetailReadonlyRow label="平台" value={getPlatformLabel(item.platform)} />
        <DetailReadonlyRow
          label="原始链接"
          value={
            <a
              href={item.rawUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-blue-600 hover:underline"
            >
              {item.rawUrl}
            </a>
          }
        />
        <DetailReadonlyRow
          label="提取码"
          value={item.accessCode ? item.accessCode : "无"}
        />

        <DetailSelectRow
          label="资料分类"
          value={item.resourceCategory ?? ""}
          disabled={saving}
          options={[
            { value: "", label: "空" },
            { value: "practice", label: "练习" },
            { value: "paper", label: "试卷" },
            { value: "special", label: "专项" },
          ]}
          onSave={async (nextValue) => {
            await savePatch({
              resourceCategory: (nextValue || null) as ResourceCategory | null,
            });
          }}
        />
        <DetailEditableRow
          label="备注"
          value={item.description}
          disabled={saving}
          multiline
          onShowToast={onShowToast}
          onSave={async (nextValue) => {
            await savePatch({ description: toNullable(nextValue) });
          }}
        />
        <DetailEditableRow
          label="学段"
          value={item.schoolStage}
          disabled={saving}
          onShowToast={onShowToast}
          onSave={async (nextValue) => {
            await savePatch({ schoolStage: toNullable(nextValue) });
          }}
        />
        <DetailEditableRow
          label="年级"
          value={item.grade}
          disabled={saving}
          onShowToast={onShowToast}
          onSave={async (nextValue) => {
            await savePatch({ grade: toNullable(nextValue) });
          }}
        />
        <DetailEditableRow
          label="学期"
          value={item.semester}
          disabled={saving}
          onShowToast={onShowToast}
          onSave={async (nextValue) => {
            await savePatch({ semester: toNullable(nextValue) });
          }}
        />
        <DetailEditableRow
          label="科目"
          value={item.subject}
          disabled={saving}
          onShowToast={onShowToast}
          onSave={async (nextValue) => {
            await savePatch({ subject: toNullable(nextValue) });
          }}
        />
        <DetailEditableRow
          label="资料年份"
          value={item.resourceYear}
          disabled={saving}
          onShowToast={onShowToast}
          onSave={async (nextValue) => {
            await savePatch({ resourceYear: toNullable(nextValue) });
          }}
        />
        <DetailSelectRow
          label="状态"
          value={item.status}
          disabled={saving}
          options={[
            { value: "normal", label: "正常" },
            { value: "invalid", label: "已失效" },
          ]}
          onSave={async (nextValue) => {
            await savePatch({ status: nextValue as LinkStatus });
          }}
        />
        <DetailSelectRow
          label="是否收藏"
          value={item.favorite ? "true" : "false"}
          disabled={saving}
          options={[
            { value: "false", label: "否" },
            { value: "true", label: "是" },
          ]}
          onSave={async (nextValue) => {
            await savePatch({ favorite: nextValue === "true" });
          }}
        />

        <DetailReadonlyRow label="原始输入" value={displayValue(item.sourceText)} />
        <DetailReadonlyRow label="创建时间" value={formatDateTime(item.createdAt)} />
        <DetailReadonlyRow label="更新时间" value={formatDateTime(item.updatedAt)} />
      </div>
    </aside>
  );
}

export function LinkDetailPanel({
  item,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleStatus,
  onUpdateField,
  onShowToast,
}: LinkDetailPanelProps) {
  if (!item) {
    return (
      <aside className="flex h-full items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-500">
        请选择一条资料查看详情
      </aside>
    );
  }

  return (
    <LinkDetailPanelContent
      key={item.id}
      item={item}
      onEdit={onEdit}
      onDelete={onDelete}
      onToggleFavorite={onToggleFavorite}
      onToggleStatus={onToggleStatus}
      onUpdateField={onUpdateField}
      onShowToast={onShowToast}
    />
  );
}
