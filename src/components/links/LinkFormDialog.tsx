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
  textbookEdition: string;
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
  "min-w-0 rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-blue-500";

const linkInputClassName = `${inputClassName} w-full overflow-x-auto font-mono text-xs`;

const labelClassName = "mb-0.5 block text-xs font-medium text-zinc-600";

const sectionTitleClassName =
  "mb-2 border-b border-zinc-200 pb-1 text-xs font-semibold text-zinc-800";

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
  textbookEdition: "",
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
    textbookEdition: item.textbookEdition ?? "",
    status: item.status,
    favorite: item.favorite,
    sourceText: item.sourceText ?? "",
  };
}

function toNullable(value: string): string | null {
  return value.trim() === "" ? null : value.trim();
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className={sectionTitleClassName}>{title}</h3>
      {children}
    </section>
  );
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
  const [sourceTextExpanded, setSourceTextExpanded] = useState(false);

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
        textbookEdition: toNullable(values.textbookEdition),
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
      textbookEdition: toNullable(values.textbookEdition),
      status: values.status,
      favorite: values.favorite,
      sourceText: toNullable(values.sourceText),
    };
    onSubmit(payload);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-[900px] flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-5 py-3">
          <h2 className="text-base font-semibold text-zinc-900">
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

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-3">
            <FormSection title="基础信息">
              <div className="flex flex-wrap items-end gap-2">
                {mode === "create" ? (
                  <div>
                    <label className={labelClassName} htmlFor="form-platform">
                      平台
                    </label>
                    <select
                      id="form-platform"
                      className={`${inputClassName} w-[120px]`}
                      value={values.platform}
                      onChange={(event) =>
                        updateField(
                          "platform",
                          event.target.value as LinkPlatform,
                        )
                      }
                    >
                      <option value="baidu">百度网盘</option>
                      <option value="quark">夸克网盘</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className={labelClassName}>平台</label>
                    <div className="flex h-[34px] w-[120px] items-center rounded border border-zinc-200 bg-zinc-50 px-2 text-sm text-zinc-700">
                      {values.platform === "baidu" ? "百度网盘" : "夸克网盘"}
                    </div>
                  </div>
                )}

                <div>
                  <label className={labelClassName} htmlFor="form-category">
                    资料分类
                  </label>
                  <select
                    id="form-category"
                    className={`${inputClassName} w-[110px]`}
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
                  <label className={labelClassName} htmlFor="form-status">
                    状态
                  </label>
                  <select
                    id="form-status"
                    className={`${inputClassName} w-[100px]`}
                    value={values.status}
                    onChange={(event) =>
                      updateField("status", event.target.value as LinkStatus)
                    }
                  >
                    <option value="normal">正常</option>
                    <option value="invalid">已失效</option>
                  </select>
                </div>

                <div>
                  <label className={labelClassName} htmlFor="form-favorite">
                    是否收藏
                  </label>
                  <select
                    id="form-favorite"
                    className={`${inputClassName} w-[90px]`}
                    value={values.favorite ? "true" : "false"}
                    onChange={(event) =>
                      updateField("favorite", event.target.value === "true")
                    }
                  >
                    <option value="false">否</option>
                    <option value="true">是</option>
                  </select>
                </div>
              </div>

              <div className="mt-2">
                <label className={labelClassName} htmlFor="form-title">
                  标题
                </label>
                <input
                  id="form-title"
                  className={`${inputClassName} w-full`}
                  value={values.title}
                  onChange={(event) => updateField("title", event.target.value)}
                />
              </div>
            </FormSection>

            <FormSection title="链接信息">
              <div className="space-y-2">
                <div>
                  <label className={labelClassName} htmlFor="form-raw-url">
                    原始链接
                  </label>
                  <input
                    id="form-raw-url"
                    className={linkInputClassName}
                    value={values.rawUrl}
                    onChange={(event) =>
                      updateField("rawUrl", event.target.value)
                    }
                  />
                </div>

                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <label className={labelClassName} htmlFor="form-url">
                      标准链接
                    </label>
                    <input
                      id="form-url"
                      className={linkInputClassName}
                      value={values.url}
                      onChange={(event) => updateField("url", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClassName} htmlFor="form-access-code">
                      提取码
                    </label>
                    <input
                      id="form-access-code"
                      className={`${inputClassName} w-[140px]`}
                      value={values.accessCode}
                      onChange={(event) =>
                        updateField("accessCode", event.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection title="学习资料信息">
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <label className={labelClassName} htmlFor="form-school-stage">
                    学段
                  </label>
                  <input
                    id="form-school-stage"
                    className={`${inputClassName} w-[100px]`}
                    value={values.schoolStage}
                    onChange={(event) =>
                      updateField("schoolStage", event.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="form-grade">
                    年级
                  </label>
                  <input
                    id="form-grade"
                    className={`${inputClassName} w-[100px]`}
                    value={values.grade}
                    onChange={(event) => updateField("grade", event.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="form-semester">
                    学期
                  </label>
                  <input
                    id="form-semester"
                    className={`${inputClassName} w-[100px]`}
                    value={values.semester}
                    onChange={(event) =>
                      updateField("semester", event.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="form-subject">
                    科目
                  </label>
                  <input
                    id="form-subject"
                    className={`${inputClassName} w-[120px]`}
                    value={values.subject}
                    onChange={(event) =>
                      updateField("subject", event.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="form-resource-year">
                    资料年份
                  </label>
                  <input
                    id="form-resource-year"
                    className={`${inputClassName} w-[120px]`}
                    value={values.resourceYear}
                    onChange={(event) =>
                      updateField("resourceYear", event.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="form-textbook-edition">
                    教材版本
                  </label>
                  <input
                    id="form-textbook-edition"
                    className={`${inputClassName} w-[120px]`}
                    value={values.textbookEdition}
                    onChange={(event) =>
                      updateField("textbookEdition", event.target.value)
                    }
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="备注">
              <textarea
                id="form-description"
                className={`${inputClassName} w-full`}
                rows={2}
                value={values.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
              />
            </FormSection>

            {mode === "edit" ? (
              <FormSection title="原始输入片段">
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => setSourceTextExpanded((current) => !current)}
                >
                  {sourceTextExpanded ? "收起原始输入" : "展开原始输入"}
                </button>
                {sourceTextExpanded ? (
                  <textarea
                    id="form-source-text"
                    className={`${inputClassName} mt-1 w-full`}
                    rows={4}
                    value={values.sourceText}
                    onChange={(event) =>
                      updateField("sourceText", event.target.value)
                    }
                  />
                ) : null}
              </FormSection>
            ) : null}

            {validationError ? (
              <div className="rounded bg-red-50 px-2 py-1.5 text-xs text-red-700">
                {validationError}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="rounded bg-red-50 px-2 py-1.5 text-xs text-red-700">
                {errorMessage}
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-zinc-200 px-5 py-3">
            <button
              type="button"
              className="rounded border border-zinc-300 px-4 py-1.5 text-sm hover:bg-zinc-50"
              onClick={onClose}
              disabled={saving}
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
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
