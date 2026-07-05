"use client";

import { useState } from "react";
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
  onDropdownApply: (values: LinkFilterValues) => void;
};

const inputClassName =
  "h-8 w-full rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-900 outline-none focus:border-blue-500";

const labelClassName = "mb-0.5 block text-xs font-medium text-zinc-600";

export const defaultLinkFilterValues: LinkFilterValues = {
  q: "",
  status: "normal",
  schoolStage: "",
  grade: "",
  semester: "",
  subject: "",
  resourceYear: "",
};

const DROPDOWN_KEYS = new Set([
  "platform",
  "status",
  "resourceCategory",
  "favorite",
]);

export function LinkFilters({
  values,
  onChange,
  onSearch,
  onReset,
  onDropdownApply,
}: LinkFiltersProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  function updateField<K extends keyof LinkFilterValues>(
    key: K,
    value: LinkFilterValues[K],
    autoApply = false,
  ) {
    const next = { ...values, [key]: value };
    onChange(next);
    if (autoApply || DROPDOWN_KEYS.has(key)) {
      onDropdownApply(next);
    }
  }

  function handleTextKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter") onSearch();
  }

  return (
    <section className="shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <label className={labelClassName} htmlFor="filter-q">
            搜索
          </label>
          <input
            id="filter-q"
            className={inputClassName}
            placeholder="标题、备注、科目、年级、年份、链接..."
            value={values.q}
            onChange={(event) => updateField("q", event.target.value)}
            onKeyDown={handleTextKeyDown}
          />
        </div>
        <button
          type="button"
          onClick={onReset}
          className="h-8 shrink-0 rounded border border-zinc-300 bg-white px-3 text-sm text-zinc-700 hover:bg-zinc-100"
        >
          重置
        </button>
        <button
          type="button"
          onClick={onSearch}
          className="h-8 shrink-0 rounded bg-blue-600 px-3 text-sm text-white hover:bg-blue-700"
        >
          搜索
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
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
                true,
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
              updateField(
                "status",
                event.target.value as LinkFilterValues["status"],
                true,
              )
            }
          >
            <option value="normal">正常</option>
            <option value="invalid">已失效</option>
            <option value="all">全部</option>
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
                true,
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
            onKeyDown={handleTextKeyDown}
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
            onKeyDown={handleTextKeyDown}
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
            onKeyDown={handleTextKeyDown}
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
            onKeyDown={handleTextKeyDown}
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            className="h-8 w-full rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            {moreOpen ? "收起筛选" : "更多筛选"}
          </button>
        </div>
      </div>

      {moreOpen ? (
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          <div>
            <label className={labelClassName} htmlFor="filter-favorite">
              收藏
            </label>
            <select
              id="filter-favorite"
              className={inputClassName}
              value={
                values.favorite === undefined
                  ? ""
                  : values.favorite
                    ? "true"
                    : "false"
              }
              onChange={(event) => {
                const value = event.target.value;
                updateField(
                  "favorite",
                  value === "" ? undefined : value === "true",
                  true,
                );
              }}
            >
              <option value="">全部</option>
              <option value="true">仅收藏</option>
            </select>
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
              onKeyDown={handleTextKeyDown}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
