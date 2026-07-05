"use client";

import type { LinkStatus, ResourceCategory } from "@/shared/types/resource-link";

export type ImportDefaultsValues = {
  title: string;
  resourceCategory: ResourceCategory | "";
  description: string;
  schoolStage: string;
  grade: string;
  semester: string;
  subject: string;
  resourceYear: string;
  status: LinkStatus;
  favorite: boolean;
};

type ImportDefaultsFormProps = {
  values: ImportDefaultsValues;
  onChange: (values: ImportDefaultsValues) => void;
  onPersist?: (values: ImportDefaultsValues) => void;
  disabled?: boolean;
};

const inputClassName =
  "h-7 w-full min-w-0 rounded border border-zinc-300 bg-white px-2 py-0 text-sm text-zinc-900 outline-none focus:border-blue-500 disabled:bg-zinc-100";

export const defaultImportDefaultsValues: ImportDefaultsValues = {
  title: "",
  resourceCategory: "",
  description: "",
  schoolStage: "",
  grade: "",
  semester: "",
  subject: "",
  resourceYear: "",
  status: "normal",
  favorite: false,
};

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="mb-1.5 text-xs font-medium text-zinc-700">【{title}】</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-2">{children}</div>;
}

function InlineField({
  id,
  label,
  labelWidth = "w-14",
  className = "",
  children,
}: {
  id: string;
  label: string;
  labelWidth?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex min-w-0 items-center gap-1 ${className}`}>
      <label
        className={`${labelWidth} shrink-0 text-right text-xs text-zinc-600`}
        htmlFor={id}
      >
        {label}
      </label>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function ImportDefaultsForm({
  values,
  onChange,
  onPersist,
  disabled = false,
}: ImportDefaultsFormProps) {
  function updateField<K extends keyof ImportDefaultsValues>(
    key: K,
    value: ImportDefaultsValues[K],
    persist = false,
  ) {
    const next = { ...values, [key]: value };
    onChange(next);
    if (persist) {
      onPersist?.(next);
    }
  }

  return (
    <section className="shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-zinc-800">批量填充信息</h3>
        <p className="mt-0.5 text-[11px] leading-tight text-zinc-500">
          统一应用到本次导入的所有条目
        </p>
      </div>

      <div className="divide-y divide-zinc-200/80">
        <FormSection title="基础">
        <InlineField id="import-title" label="标题">
          <input
            id="import-title"
            className={inputClassName}
            disabled={disabled}
            value={values.title}
            onChange={(event) => updateField("title", event.target.value)}
            onBlur={(event) =>
              onPersist?.({
                ...values,
                title: event.currentTarget.value,
              })
            }
          />
        </InlineField>
        <FormRow>
          <InlineField id="import-resource-year" label="资料年份">
            <input
              id="import-resource-year"
              className={inputClassName}
              disabled={disabled}
              value={values.resourceYear}
              onChange={(event) =>
                updateField("resourceYear", event.target.value)
              }
              onBlur={(event) =>
                onPersist?.({
                  ...values,
                  resourceYear: event.currentTarget.value,
                })
              }
            />
          </InlineField>
          <InlineField id="import-category" label="资料分类">
            <select
              id="import-category"
              className={inputClassName}
              disabled={disabled}
              value={values.resourceCategory}
              onChange={(event) =>
                updateField(
                  "resourceCategory",
                  event.target.value as ResourceCategory | "",
                  true,
                )
              }
            >
              <option value="">空</option>
              <option value="practice">练习</option>
              <option value="paper">试卷</option>
              <option value="special">专项</option>
            </select>
          </InlineField>
        </FormRow>
      </FormSection>

      <FormSection title="学段信息">
        <FormRow>
          <InlineField id="import-school-stage" label="学段">
            <input
              id="import-school-stage"
              className={inputClassName}
              disabled={disabled}
              value={values.schoolStage}
              onChange={(event) =>
                updateField("schoolStage", event.target.value)
              }
              onBlur={(event) =>
                onPersist?.({
                  ...values,
                  schoolStage: event.currentTarget.value,
                })
              }
            />
          </InlineField>
          <InlineField id="import-subject" label="科目">
            <input
              id="import-subject"
              className={inputClassName}
              disabled={disabled}
              value={values.subject}
              onChange={(event) => updateField("subject", event.target.value)}
              onBlur={(event) =>
                onPersist?.({
                  ...values,
                  subject: event.currentTarget.value,
                })
              }
            />
          </InlineField>
        </FormRow>
        <FormRow>
          <InlineField id="import-grade" label="年级">
            <input
              id="import-grade"
              className={inputClassName}
              disabled={disabled}
              value={values.grade}
              onChange={(event) => updateField("grade", event.target.value)}
              onBlur={(event) =>
                onPersist?.({
                  ...values,
                  grade: event.currentTarget.value,
                })
              }
            />
          </InlineField>
          <InlineField id="import-semester" label="学期">
            <input
              id="import-semester"
              className={inputClassName}
              disabled={disabled}
              value={values.semester}
              onChange={(event) => updateField("semester", event.target.value)}
              onBlur={(event) =>
                onPersist?.({
                  ...values,
                  semester: event.currentTarget.value,
                })
              }
            />
          </InlineField>
        </FormRow>
      </FormSection>

      <FormSection title="其他">
        <InlineField id="import-description" label="备注">
          <input
            id="import-description"
            className={inputClassName}
            disabled={disabled}
            value={values.description}
            onChange={(event) =>
              updateField("description", event.target.value)
            }
            onBlur={(event) =>
              onPersist?.({
                ...values,
                description: event.currentTarget.value,
              })
            }
          />
        </InlineField>
        <FormRow>
          <InlineField
            id="import-favorite"
            label="是否收藏"
            labelWidth="w-14"
          >
            <select
              id="import-favorite"
              className={inputClassName}
              disabled={disabled}
              value={values.favorite ? "true" : "false"}
              onChange={(event) =>
                updateField("favorite", event.target.value === "true", true)
              }
            >
              <option value="false">否</option>
              <option value="true">是</option>
            </select>
          </InlineField>
          <InlineField id="import-status" label="状态">
            <select
              id="import-status"
              className={inputClassName}
              disabled={disabled}
              value={values.status}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value as LinkStatus,
                  true,
                )
              }
            >
              <option value="normal">正常</option>
              <option value="invalid">已失效</option>
            </select>
          </InlineField>
        </FormRow>
      </FormSection>
      </div>
    </section>
  );
}

export function importDefaultsToInput(
  values: ImportDefaultsValues,
): import("@/shared/api/links-client").ImportDefaultsInput {
  return {
    resourceCategory: values.resourceCategory || null,
    description: values.description.trim() || null,
    schoolStage: values.schoolStage.trim() || null,
    grade: values.grade.trim() || null,
    semester: values.semester.trim() || null,
    subject: values.subject.trim() || null,
    resourceYear: values.resourceYear.trim() || null,
    status: values.status,
    favorite: values.favorite,
  };
}
