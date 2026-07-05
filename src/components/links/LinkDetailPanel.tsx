"use client";

import { useEffect, useRef, useState } from "react";
import type {
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
  "h-8 w-full min-w-0 rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:border-blue-500 disabled:bg-zinc-50";

const textareaClassName =
  "w-full min-w-0 resize-y rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 outline-none focus:border-blue-500 disabled:bg-zinc-50";

const titleInputClassName =
  "w-full min-w-0 rounded border border-transparent bg-transparent px-0 py-0 text-base font-semibold text-zinc-900 outline-none hover:border-zinc-300 focus:border-blue-500 focus:bg-white focus:px-2 focus:py-1 disabled:bg-zinc-50";

function toNullable(value: string): string | null {
  return value.trim() === "" ? null : value.trim();
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-zinc-100 py-3 last:border-b-0">
      <h3 className="mb-2 text-xs font-medium text-zinc-700">【{title}】</h3>
      {children}
    </section>
  );
}

function DetailGridField({
  label,
  htmlFor,
  className = "",
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label className="mb-0.5 block text-xs text-zinc-600" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

function DetailReadonlyLine({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-baseline gap-2 text-sm">
      <span className="w-14 shrink-0 text-xs text-zinc-600">{label}</span>
      <span className="min-w-0 flex-1 break-all text-zinc-900">{value}</span>
    </div>
  );
}

function DetailEditableInput({
  id,
  value,
  onSave,
  disabled = false,
  required = false,
  requiredLabel,
  onShowToast,
}: {
  id?: string;
  value: string | null;
  onSave: (nextValue: string) => Promise<void>;
  disabled?: boolean;
  required?: boolean;
  requiredLabel?: string;
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
      onShowToast(`${requiredLabel ?? "字段"}不能为空`, "warning");
      return;
    }

    try {
      await onSave(trimmed);
    } catch {
      setDraft(value ?? "");
    }
  }

  return (
    <input
      id={id}
      className={inputClassName}
      value={draft}
      disabled={disabled}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => void commitDraft()}
    />
  );
}

function DetailEditableTextarea({
  id,
  value,
  onSave,
  disabled = false,
  onShowToast,
}: {
  id?: string;
  value: string | null;
  onSave: (nextValue: string) => Promise<void>;
  disabled?: boolean;
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

    try {
      await onSave(trimmed);
    } catch {
      setDraft(value ?? "");
    }
  }

  return (
    <textarea
      id={id}
      className={`${textareaClassName} min-h-[56px]`}
      rows={2}
      value={draft}
      disabled={disabled}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => void commitDraft()}
    />
  );
}

function DetailSelectInput<T extends string>({
  id,
  value,
  options,
  onSave,
  disabled = false,
}: {
  id?: string;
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
      // 父组件已提示错误
    }
  }

  return (
    <select
      id={id}
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
  );
}

function DetailMoreMenu({
  item,
  onEdit,
  onToggleStatus,
}: {
  item: ResourceLink;
  onEdit: (item: ResourceLink) => void;
  onToggleStatus: (item: ResourceLink) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
        aria-label="更多操作"
        onClick={() => setOpen((current) => !current)}
      >
        ⋮ 更多
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[128px] rounded-md border border-zinc-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            className="block w-full px-3 py-1.5 text-left text-xs text-zinc-800 hover:bg-zinc-50"
            onClick={() => {
              setOpen(false);
              onEdit(item);
            }}
          >
            完整编辑
          </button>
          <button
            type="button"
            className="block w-full px-3 py-1.5 text-left text-xs text-zinc-800 hover:bg-zinc-50"
            onClick={() => {
              setOpen(false);
              onToggleStatus(item);
            }}
          >
            {item.status === "normal" ? "标记已失效" : "标记正常"}
          </button>
        </div>
      ) : null}
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
  const [sourceTextExpanded, setSourceTextExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitleDraft(item.title);
    setSourceTextExpanded(false);
  }, [item.id, item.title]);

  async function savePatch(patch: UpdateResourceLinkInput) {
    setSaving(true);
    try {
      await onUpdateField(item.id, patch);
    } finally {
      setSaving(false);
    }
  }

  async function handleCopySourceText() {
    if (!item.sourceText?.trim()) {
      onShowToast("当前资料没有原始输入内容。", "warning");
      return;
    }

    try {
      await copyToClipboard(item.sourceText);
      onShowToast("已复制原始输入内容。", "success");
    } catch {
      onShowToast("复制失败，请稍后重试。", "error");
    }
  }

  async function handleCopyRawUrl() {
    try {
      await copyToClipboard(item.rawUrl);
      onShowToast("已复制原始链接。", "success");
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

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              className={`rounded border px-2 py-1 text-xs hover:bg-zinc-50 ${
                item.favorite
                  ? "border-amber-300 text-amber-800 hover:bg-amber-50"
                  : "border-zinc-300 text-zinc-700"
              }`}
              onClick={() => onToggleFavorite(item)}
            >
              {item.favorite ? "取消收藏" : "收藏"}
            </button>
            <button
              type="button"
              className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50"
              onClick={() => void handleCopySourceText()}
            >
              复制
            </button>
            <button
              type="button"
              className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
              onClick={() => onDelete(item)}
            >
              删除
            </button>
          </div>
          <DetailMoreMenu
            item={item}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3">
        <DetailSection title="链接信息">
          <div className="space-y-2">
            <DetailReadonlyLine
              label="平台"
              value={getPlatformLabel(item.platform)}
            />
            <DetailReadonlyLine
              label="提取码"
              value={item.accessCode ? item.accessCode : "无"}
            />
            <div className="min-w-0">
              <div className="mb-0.5 flex items-center justify-between gap-2">
                <span className="text-xs text-zinc-600">原始链接</span>
                <button
                  type="button"
                  className="shrink-0 text-xs text-blue-600 hover:underline"
                  onClick={() => void handleCopyRawUrl()}
                >
                  复制
                </button>
              </div>
              <a
                href={item.rawUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="block truncate text-sm text-blue-600 hover:underline"
                title={item.rawUrl}
              >
                {item.rawUrl}
              </a>
            </div>
          </div>
        </DetailSection>

        <DetailSection title="基础">
          <div className="grid grid-cols-2 gap-x-2 gap-y-2">
            <DetailGridField label="资料分类" htmlFor="detail-category">
              <DetailSelectInput
                id="detail-category"
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
            </DetailGridField>
            <DetailGridField
              label="备注"
              htmlFor="detail-description"
              className="col-span-2"
            >
              <DetailEditableTextarea
                id="detail-description"
                value={item.description}
                disabled={saving}
                onShowToast={onShowToast}
                onSave={async (nextValue) => {
                  await savePatch({ description: toNullable(nextValue) });
                }}
              />
            </DetailGridField>
          </div>
        </DetailSection>

        <DetailSection title="学段信息">
          <div className="grid grid-cols-2 gap-x-2 gap-y-2">
            <DetailGridField label="学段" htmlFor="detail-school-stage">
              <DetailEditableInput
                id="detail-school-stage"
                value={item.schoolStage}
                disabled={saving}
                onShowToast={onShowToast}
                onSave={async (nextValue) => {
                  await savePatch({ schoolStage: toNullable(nextValue) });
                }}
              />
            </DetailGridField>
            <DetailGridField label="年级" htmlFor="detail-grade">
              <DetailEditableInput
                id="detail-grade"
                value={item.grade}
                disabled={saving}
                onShowToast={onShowToast}
                onSave={async (nextValue) => {
                  await savePatch({ grade: toNullable(nextValue) });
                }}
              />
            </DetailGridField>
            <DetailGridField label="学期" htmlFor="detail-semester">
              <DetailEditableInput
                id="detail-semester"
                value={item.semester}
                disabled={saving}
                onShowToast={onShowToast}
                onSave={async (nextValue) => {
                  await savePatch({ semester: toNullable(nextValue) });
                }}
              />
            </DetailGridField>
            <DetailGridField label="科目" htmlFor="detail-subject">
              <DetailEditableInput
                id="detail-subject"
                value={item.subject}
                disabled={saving}
                onShowToast={onShowToast}
                onSave={async (nextValue) => {
                  await savePatch({ subject: toNullable(nextValue) });
                }}
              />
            </DetailGridField>
            <DetailGridField label="资料年份" htmlFor="detail-resource-year">
              <DetailEditableInput
                id="detail-resource-year"
                value={item.resourceYear}
                disabled={saving}
                onShowToast={onShowToast}
                onSave={async (nextValue) => {
                  await savePatch({ resourceYear: toNullable(nextValue) });
                }}
              />
            </DetailGridField>
            <DetailGridField label="教材版本" htmlFor="detail-textbook-edition">
              <DetailEditableInput
                id="detail-textbook-edition"
                value={item.textbookEdition}
                disabled={saving}
                onShowToast={onShowToast}
                onSave={async (nextValue) => {
                  await savePatch({ textbookEdition: toNullable(nextValue) });
                }}
              />
            </DetailGridField>
          </div>
        </DetailSection>

        <section className="py-3">
          <button
            type="button"
            className="text-xs text-blue-600 hover:underline"
            onClick={() => setSourceTextExpanded((current) => !current)}
          >
            {sourceTextExpanded ? "收起原始输入片段" : "展开原始输入片段"}
          </button>
          {sourceTextExpanded ? (
            <div className="mt-2 rounded border border-zinc-200 bg-zinc-50 p-2 text-xs leading-relaxed text-zinc-700 whitespace-pre-wrap break-all">
              {displayValue(item.sourceText)}
            </div>
          ) : null}
        </section>
      </div>

      <div className="shrink-0 border-t border-zinc-100 px-3 py-2 text-[11px] text-zinc-500">
        创建 {formatDateTime(item.createdAt)} · 更新{" "}
        {formatDateTime(item.updatedAt)}
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
