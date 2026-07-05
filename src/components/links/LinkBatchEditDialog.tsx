"use client";

import { useMemo, useState } from "react";
import type {
  LinkStatus,
  ResourceCategory,
  UpdateResourceLinkInput,
} from "@/shared/types/resource-link";

export type BatchEditFieldKey =
  | "resourceCategory"
  | "schoolStage"
  | "grade"
  | "semester"
  | "subject"
  | "resourceYear"
  | "status"
  | "favorite"
  | "description";

export type BatchEditFormState = {
  enabled: Record<BatchEditFieldKey, boolean>;
  resourceCategory: ResourceCategory | "";
  schoolStage: string;
  grade: string;
  semester: string;
  subject: string;
  resourceYear: string;
  status: LinkStatus;
  favorite: boolean;
  description: string;
};

export type BatchEditFailure = {
  id: string;
  title?: string;
  reason: string;
};

export type BatchEditResult = {
  successCount: number;
  failureCount: number;
  failures: BatchEditFailure[];
};

const inputClassName =
  "w-full min-w-0 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 disabled:bg-zinc-50 disabled:text-zinc-500";

const defaultEnabled: Record<BatchEditFieldKey, boolean> = {
  resourceCategory: false,
  schoolStage: false,
  grade: false,
  semester: false,
  subject: false,
  resourceYear: false,
  status: false,
  favorite: false,
  description: false,
};

const defaultFormState: BatchEditFormState = {
  enabled: defaultEnabled,
  resourceCategory: "",
  schoolStage: "",
  grade: "",
  semester: "",
  subject: "",
  resourceYear: "",
  status: "normal",
  favorite: false,
  description: "",
};

function toNullable(value: string): string | null {
  return value.trim() === "" ? null : value.trim();
}

export function buildBatchEditPatch(
  form: BatchEditFormState,
): UpdateResourceLinkInput {
  const patch: UpdateResourceLinkInput = {};

  if (form.enabled.resourceCategory) {
    patch.resourceCategory = form.resourceCategory || null;
  }
  if (form.enabled.schoolStage) {
    patch.schoolStage = toNullable(form.schoolStage);
  }
  if (form.enabled.grade) {
    patch.grade = toNullable(form.grade);
  }
  if (form.enabled.semester) {
    patch.semester = toNullable(form.semester);
  }
  if (form.enabled.subject) {
    patch.subject = toNullable(form.subject);
  }
  if (form.enabled.resourceYear) {
    patch.resourceYear = toNullable(form.resourceYear);
  }
  if (form.enabled.status) {
    patch.status = form.status;
  }
  if (form.enabled.favorite) {
    patch.favorite = form.favorite;
  }
  if (form.enabled.description) {
    patch.description = toNullable(form.description);
  }

  return patch;
}

type LinkBatchEditDialogProps = {
  open: boolean;
  selectedCount: number;
  saving: boolean;
  result: BatchEditResult | null;
  onClose: () => void;
  onSubmit: (patch: UpdateResourceLinkInput) => void;
};

type BatchFieldRowProps = {
  label: string;
  enabled: boolean;
  onToggle: (checked: boolean) => void;
  children: React.ReactNode;
};

function BatchFieldRow({
  label,
  enabled,
  onToggle,
  children,
}: Omit<BatchFieldRowProps, "fieldKey">) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-zinc-800">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => onToggle(event.target.checked)}
        />
        <span className="whitespace-nowrap">{label}</span>
      </label>
      <div>{children}</div>
    </div>
  );
}

function LinkBatchEditDialogContent({
  selectedCount,
  saving,
  result,
  onClose,
  onSubmit,
}: Omit<LinkBatchEditDialogProps, "open">) {
  const [form, setForm] = useState<BatchEditFormState>(defaultFormState);

  const hasEnabledField = useMemo(
    () => Object.values(form.enabled).some(Boolean),
    [form.enabled],
  );

  function toggleField(fieldKey: BatchEditFieldKey, checked: boolean) {
    setForm((current) => ({
      ...current,
      enabled: { ...current.enabled, [fieldKey]: checked },
    }));
  }

  function updateField<K extends keyof Omit<BatchEditFormState, "enabled">>(
    key: K,
    value: BatchEditFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!hasEnabledField || saving) return;
    onSubmit(buildBatchEditPatch(form));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-[640px] flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">批量编辑资料</h2>
          <button
            type="button"
            className="text-zinc-500 hover:text-zinc-800"
            onClick={onClose}
            disabled={saving}
          >
            关闭
          </button>
        </div>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <p className="text-sm text-zinc-600">
              已选择 {selectedCount} 条资料。只会更新你勾选启用的字段，未勾选字段不会改变。
            </p>

            <div className="space-y-3">
              <BatchFieldRow
                label="资料分类"
                enabled={form.enabled.resourceCategory}
                onToggle={(checked) => toggleField("resourceCategory", checked)}
              >
                <select
                  className={inputClassName}
                  value={form.resourceCategory}
                  disabled={!form.enabled.resourceCategory}
                  onChange={(event) =>
                    updateField(
                      "resourceCategory",
                      event.target.value as ResourceCategory | "",
                    )
                  }
                >
                  <option value="">空</option>
                  <option value="practice">练习</option>
                  <option value="paper">试卷</option>
                  <option value="special">专项</option>
                </select>
              </BatchFieldRow>

              {(
                [
                  ["schoolStage", "学段"],
                  ["grade", "年级"],
                  ["semester", "学期"],
                  ["subject", "科目"],
                  ["resourceYear", "资料年份"],
                ] as const
              ).map(([key, label]) => (
                <BatchFieldRow
                  key={key}
                  label={label}
                  enabled={form.enabled[key]}
                  onToggle={(checked) => toggleField(key, checked)}
                >
                  <input
                    className={inputClassName}
                    value={form[key]}
                    disabled={!form.enabled[key]}
                    onChange={(event) => updateField(key, event.target.value)}
                  />
                </BatchFieldRow>
              ))}

              <BatchFieldRow
                label="状态"
                enabled={form.enabled.status}
                onToggle={(checked) => toggleField("status", checked)}
              >
                <select
                  className={inputClassName}
                  value={form.status}
                  disabled={!form.enabled.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as LinkStatus)
                  }
                >
                  <option value="normal">正常</option>
                  <option value="invalid">已失效</option>
                </select>
              </BatchFieldRow>

              <BatchFieldRow
                label="是否收藏"
                enabled={form.enabled.favorite}
                onToggle={(checked) => toggleField("favorite", checked)}
              >
                <select
                  className={inputClassName}
                  value={form.favorite ? "true" : "false"}
                  disabled={!form.enabled.favorite}
                  onChange={(event) =>
                    updateField("favorite", event.target.value === "true")
                  }
                >
                  <option value="false">否</option>
                  <option value="true">是</option>
                </select>
              </BatchFieldRow>

              <BatchFieldRow
                label="备注"
                enabled={form.enabled.description}
                onToggle={(checked) => toggleField("description", checked)}
              >
                <textarea
                  className={inputClassName}
                  rows={2}
                  value={form.description}
                  disabled={!form.enabled.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                />
              </BatchFieldRow>
            </div>

            {result ? (
              <div
                className={`rounded-md px-3 py-2 text-sm ${
                  result.failureCount > 0
                    ? "bg-amber-50 text-amber-900"
                    : "bg-emerald-50 text-emerald-800"
                }`}
              >
                <p>
                  批量编辑完成：成功 {result.successCount} 条，失败{" "}
                  {result.failureCount} 条。
                </p>
                {result.failures.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-xs">
                    {result.failures.map((failure) => (
                      <li key={failure.id}>
                        {failure.title ? `${failure.title}（${failure.id}）` : failure.id}
                        ：{failure.reason}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-zinc-200 px-6 py-4">
            <button
              type="button"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
              onClick={onClose}
              disabled={saving}
            >
              {result ? "关闭" : "取消"}
            </button>
            {!result ? (
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
                disabled={saving || !hasEnabledField}
              >
                {saving ? "更新中..." : "确认批量编辑"}
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}

export function LinkBatchEditDialog({
  open,
  selectedCount,
  saving,
  result,
  onClose,
  onSubmit,
}: LinkBatchEditDialogProps) {
  if (!open) return null;

  return (
    <LinkBatchEditDialogContent
      selectedCount={selectedCount}
      saving={saving}
      result={result}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}
