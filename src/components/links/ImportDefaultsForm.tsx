"use client";

import type { LinkStatus, ResourceCategory } from "@/shared/types/resource-link";

export type ImportDefaultsValues = {
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
  disabled?: boolean;
};

const inputClassName =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 disabled:bg-zinc-100";

const labelClassName = "mb-1 block text-sm font-medium text-zinc-700";

export const defaultImportDefaultsValues: ImportDefaultsValues = {
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

export function ImportDefaultsForm({
  values,
  onChange,
  disabled = false,
}: ImportDefaultsFormProps) {
  function updateField<K extends keyof ImportDefaultsValues>(
    key: K,
    value: ImportDefaultsValues[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-800">批量填充信息</h3>
      <p className="mb-3 text-xs text-zinc-600">
        以下字段将统一应用到本次导入的所有条目。
      </p>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className={labelClassName} htmlFor="import-category">
            资料分类
          </label>
          <select
            id="import-category"
            className={inputClassName}
            disabled={disabled}
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
          <label className={labelClassName} htmlFor="import-status">
            状态
          </label>
          <select
            id="import-status"
            className={inputClassName}
            disabled={disabled}
            value={values.status}
            onChange={(event) =>
              updateField("status", event.target.value as LinkStatus)
            }
          >
            <option value="normal">正常</option>
            <option value="invalid">已失效</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className={labelClassName} htmlFor="import-description">
            备注
          </label>
          <textarea
            id="import-description"
            className={inputClassName}
            rows={2}
            disabled={disabled}
            value={values.description}
            onChange={(event) => updateField("description", event.target.value)}
          />
        </div>

        {(
          [
            ["import-school-stage", "学段", "schoolStage"],
            ["import-grade", "年级", "grade"],
            ["import-semester", "学期", "semester"],
            ["import-subject", "科目", "subject"],
            ["import-resource-year", "资料年份", "resourceYear"],
          ] as const
        ).map(([id, label, key]) => (
          <div key={id}>
            <label className={labelClassName} htmlFor={id}>
              {label}
            </label>
            <input
              id={id}
              className={inputClassName}
              disabled={disabled}
              value={values[key]}
              onChange={(event) => updateField(key, event.target.value)}
            />
          </div>
        ))}

        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              disabled={disabled}
              checked={values.favorite}
              onChange={(event) => updateField("favorite", event.target.checked)}
            />
            是否收藏
          </label>
        </div>
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
