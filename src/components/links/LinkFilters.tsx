"use client";

import type { LinkPlatform, LinkStatus, ResourceCategory } from "@/shared/types/resource-link";

export type LinkFilterValues = {
  q: string;
  platform?: LinkPlatform;
  status: LinkStatus | "all";
  favorite?: boolean;
  resourceCategory?: ResourceCategory;
  schoolStage: string;
  grade: string;
  semester: string;
  subject: string;
  resourceYear: string;
};

type LinkFiltersProps = {
  values: LinkFilterValues;
  onChange: (values: LinkFilterValues) => void;
  onSearch: () => void;
  onReset: () => void;
};

const inputClassName =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500";

const labelClassName = "mb-1 block text-sm font-medium text-zinc-700";

export const defaultLinkFilterValues: LinkFilterValues = {
  q: "",
  status: "normal",
  schoolStage: "",
  grade: "",
  semester: "",
  subject: "",
  resourceYear: "",
};

export function LinkFilters({
  values,
  onChange,
  onSearch,
  onReset,
}: LinkFiltersProps) {
  function updateField<K extends keyof LinkFilterValues>(
    key: K,
    value: LinkFilterValues[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-800">筛选条件</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            重置
          </button>
          <button
            type="button"
            onClick={onSearch}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            搜索
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="md:col-span-2 xl:col-span-4">
          <label className={labelClassName} htmlFor="filter-q">
            搜索
          </label>
          <input
            id="filter-q"
            className={inputClassName}
            placeholder="标题、备注、科目、年级、年份、链接..."
            value={values.q}
            onChange={(event) => updateField("q", event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSearch();
            }}
          />
        </div>

        <div>
          <label className={labelClassName} htmlFor="filter-platform">
            平台
          </label>
          <select
            id="filter-platform"
            className={inputClassName}
            value={values.platform ?? ""}
            onChange={(event) =>
              updateField(
                "platform",
                (event.target.value || undefined) as LinkFilterValues["platform"],
              )
            }
          >
            <option value="">全部</option>
            <option value="baidu">百度网盘</option>
            <option value="quark">夸克网盘</option>
          </select>
        </div>

        <div>
          <label className={labelClassName} htmlFor="filter-status">
            状态
          </label>
          <select
            id="filter-status"
            className={inputClassName}
            value={values.status}
            onChange={(event) =>
              updateField("status", event.target.value as LinkFilterValues["status"])
            }
          >
            <option value="normal">正常</option>
            <option value="invalid">已失效</option>
            <option value="all">全部</option>
          </select>
        </div>

        <div>
          <label className={labelClassName} htmlFor="filter-favorite">
            收藏
          </label>
          <select
            id="filter-favorite"
            className={inputClassName}
            value={
              values.favorite === undefined ? "" : values.favorite ? "true" : "false"
            }
            onChange={(event) => {
              const value = event.target.value;
              updateField(
                "favorite",
                value === "" ? undefined : value === "true",
              );
            }}
          >
            <option value="">全部</option>
            <option value="true">仅收藏</option>
          </select>
        </div>

        <div>
          <label className={labelClassName} htmlFor="filter-category">
            资料分类
          </label>
          <select
            id="filter-category"
            className={inputClassName}
            value={values.resourceCategory ?? ""}
            onChange={(event) =>
              updateField(
                "resourceCategory",
                (event.target.value ||
                  undefined) as LinkFilterValues["resourceCategory"],
              )
            }
          >
            <option value="">全部</option>
            <option value="practice">练习</option>
            <option value="paper">试卷</option>
            <option value="special">专项</option>
          </select>
        </div>

        <div>
          <label className={labelClassName} htmlFor="filter-school-stage">
            学段
          </label>
          <input
            id="filter-school-stage"
            className={inputClassName}
            value={values.schoolStage}
            onChange={(event) => updateField("schoolStage", event.target.value)}
          />
        </div>

        <div>
          <label className={labelClassName} htmlFor="filter-grade">
            年级
          </label>
          <input
            id="filter-grade"
            className={inputClassName}
            value={values.grade}
            onChange={(event) => updateField("grade", event.target.value)}
          />
        </div>

        <div>
          <label className={labelClassName} htmlFor="filter-semester">
            学期
          </label>
          <input
            id="filter-semester"
            className={inputClassName}
            value={values.semester}
            onChange={(event) => updateField("semester", event.target.value)}
          />
        </div>

        <div>
          <label className={labelClassName} htmlFor="filter-subject">
            科目
          </label>
          <input
            id="filter-subject"
            className={inputClassName}
            value={values.subject}
            onChange={(event) => updateField("subject", event.target.value)}
          />
        </div>

        <div>
          <label className={labelClassName} htmlFor="filter-resource-year">
            资料年份
          </label>
          <input
            id="filter-resource-year"
            className={inputClassName}
            value={values.resourceYear}
            onChange={(event) => updateField("resourceYear", event.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
