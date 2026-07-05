"use client";

import { useState } from "react";
import type {
  CreateResourceLinkInput,
  LinkPlatform,
  LinkStatus,
  ResourceCategory,
  ResourceLink,
  UpdateResourceLinkInput,
} from "@/shared/types/resource-link";

export type LinkFormMode = "create" | "edit";

export type LinkFormValues = {
  platform: LinkPlatform;
  title: string;
  rawUrl: string;
  url: string;
  accessCode: string;
  resourceCategory: ResourceCategory | "";
  description: string;
  schoolStage: string;
  grade: string;
  semester: string;
  subject: string;
  resourceYear: string;
  status: LinkStatus;
  favorite: boolean;
  sourceText: string;
};

type LinkFormDialogProps = {
  open: boolean;
  mode: LinkFormMode;
  initialItem?: ResourceLink | null;
  saving: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (
    values: CreateResourceLinkInput | UpdateResourceLinkInput,
  ) => void;
};

const inputClassName =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500";

const labelClassName = "mb-1 block text-sm font-medium text-zinc-700";

export const emptyLinkFormValues: LinkFormValues = {
  platform: "baidu",
  title: "",
  rawUrl: "",
  url: "",
  accessCode: "",
  resourceCategory: "",
  description: "",
  schoolStage: "",
  grade: "",
  semester: "",
  subject: "",
  resourceYear: "",
  status: "normal",
  favorite: false,
  sourceText: "",
};

function toFormValues(item: ResourceLink): LinkFormValues {
  return {
    platform: item.platform,
    title: item.title,
    rawUrl: item.rawUrl,
    url: item.url,
    accessCode: item.accessCode ?? "",
    resourceCategory: item.resourceCategory ?? "",
    description: item.description ?? "",
    schoolStage: item.schoolStage ?? "",
    grade: item.grade ?? "",
    semester: item.semester ?? "",
    subject: item.subject ?? "",
    resourceYear: item.resourceYear ?? "",
    status: item.status,
    favorite: item.favorite,
    sourceText: item.sourceText ?? "",
  };
}

function toNullable(value: string): string | null {
  return value.trim() === "" ? null : value.trim();
}

type LinkFormDialogContentProps = Omit<LinkFormDialogProps, "open">;

function LinkFormDialogContent({
  mode,
  initialItem,
  saving,
  errorMessage,
  onClose,
  onSubmit,
}: LinkFormDialogContentProps) {
  const [values, setValues] = useState<LinkFormValues>(() =>
    mode === "edit" && initialItem
      ? toFormValues(initialItem)
      : emptyLinkFormValues,
  );
  const [validationError, setValidationError] = useState("");

  function updateField<K extends keyof LinkFormValues>(
    key: K,
    value: LinkFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setValidationError("");

    if (!values.title.trim()) {
      setValidationError("标题不能为空");
      return;
    }
    if (!values.rawUrl.trim()) {
      setValidationError("原始链接不能为空");
      return;
    }
    if (!values.url.trim()) {
      setValidationError("标准链接不能为空");
      return;
    }

    if (mode === "create") {
      const payload: CreateResourceLinkInput = {
        platform: values.platform,
        title: values.title.trim(),
        rawUrl: values.rawUrl.trim(),
        url: values.url.trim(),
        accessCode: toNullable(values.accessCode),
        resourceCategory: values.resourceCategory || null,
        description: toNullable(values.description),
        schoolStage: toNullable(values.schoolStage),
        grade: toNullable(values.grade),
        semester: toNullable(values.semester),
        subject: toNullable(values.subject),
        resourceYear: toNullable(values.resourceYear),
        status: values.status,
        favorite: values.favorite,
        sourceText: toNullable(values.sourceText),
      };
      onSubmit(payload);
      return;
    }

    const payload: UpdateResourceLinkInput = {
      title: values.title.trim(),
      rawUrl: values.rawUrl.trim(),
      url: values.url.trim(),
      accessCode: toNullable(values.accessCode),
      resourceCategory: values.resourceCategory || null,
      description: toNullable(values.description),
      schoolStage: toNullable(values.schoolStage),
      grade: toNullable(values.grade),
      semester: toNullable(values.semester),
      subject: toNullable(values.subject),
      resourceYear: toNullable(values.resourceYear),
      status: values.status,
      favorite: values.favorite,
      sourceText: toNullable(values.sourceText),
    };
    onSubmit(payload);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">
            {mode === "create" ? "新增资料" : "编辑资料"}
          </h2>
          <button
            type="button"
            className="text-zinc-500 hover:text-zinc-800"
            onClick={onClose}
          >
            关闭
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "create" ? (
            <div>
              <label className={labelClassName} htmlFor="form-platform">
                平台
              </label>
              <select
                id="form-platform"
                className={inputClassName}
                value={values.platform}
                onChange={(event) =>
                  updateField("platform", event.target.value as LinkPlatform)
                }
              >
                <option value="baidu">百度网盘</option>
                <option value="quark">夸克网盘</option>
              </select>
            </div>
          ) : (
            <div>
              <label className={labelClassName}>平台</label>
              <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                {values.platform === "baidu" ? "百度网盘" : "夸克网盘"}
              </div>
            </div>
          )}

          <div>
            <label className={labelClassName} htmlFor="form-title">
              标题
            </label>
            <input
              id="form-title"
              className={inputClassName}
              value={values.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClassName} htmlFor="form-raw-url">
                原始链接
              </label>
              <input
                id="form-raw-url"
                className={inputClassName}
                value={values.rawUrl}
                onChange={(event) => updateField("rawUrl", event.target.value)}
              />
            </div>
            <div>
              <label className={labelClassName} htmlFor="form-url">
                标准链接
              </label>
              <input
                id="form-url"
                className={inputClassName}
                value={values.url}
                onChange={(event) => updateField("url", event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelClassName} htmlFor="form-access-code">
              提取码
            </label>
            <input
              id="form-access-code"
              className={inputClassName}
              value={values.accessCode}
              onChange={(event) => updateField("accessCode", event.target.value)}
            />
          </div>

          <div>
            <label className={labelClassName} htmlFor="form-category">
              资料分类
            </label>
            <select
              id="form-category"
              className={inputClassName}
              value={values.resourceCategory}
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
          </div>

          <div>
            <label className={labelClassName} htmlFor="form-description">
              备注
            </label>
            <textarea
              id="form-description"
              className={inputClassName}
              rows={3}
              value={values.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(
              [
                ["form-school-stage", "学段", "schoolStage"],
                ["form-grade", "年级", "grade"],
                ["form-semester", "学期", "semester"],
                ["form-subject", "科目", "subject"],
                ["form-resource-year", "资料年份", "resourceYear"],
              ] as const
            ).map(([id, label, key]) => (
              <div key={id}>
                <label className={labelClassName} htmlFor={id}>
                  {label}
                </label>
                <input
                  id={id}
                  className={inputClassName}
                  value={values[key]}
                  onChange={(event) => updateField(key, event.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClassName} htmlFor="form-status">
                状态
              </label>
              <select
                id="form-status"
                className={inputClassName}
                value={values.status}
                onChange={(event) =>
                  updateField("status", event.target.value as LinkStatus)
                }
              >
                <option value="normal">正常</option>
                <option value="invalid">已失效</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={values.favorite}
                  onChange={(event) =>
                    updateField("favorite", event.target.checked)
                  }
                />
                是否收藏
              </label>
            </div>
          </div>

          {mode === "edit" ? (
            <div>
              <label className={labelClassName} htmlFor="form-source-text">
                原始输入片段
              </label>
              <textarea
                id="form-source-text"
                className={inputClassName}
                rows={3}
                value={values.sourceText}
                onChange={(event) => updateField("sourceText", event.target.value)}
              />
            </div>
          ) : null}

          {validationError ? (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {validationError}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
              onClick={onClose}
              disabled={saving}
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function LinkFormDialog({
  open,
  mode,
  initialItem,
  saving,
  errorMessage,
  onClose,
  onSubmit,
}: LinkFormDialogProps) {
  if (!open) return null;

  return (
    <LinkFormDialogContent
      key={mode === "edit" ? (initialItem?.id ?? "edit") : "create"}
      mode={mode}
      initialItem={initialItem}
      saving={saving}
      errorMessage={errorMessage}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}
