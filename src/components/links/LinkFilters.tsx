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
  textbookEdition: string;
};

type LinkFiltersProps = {
  values: LinkFilterValues;
  onChange: (values: LinkFilterValues) => void;
  onSearch: () => void;
  onReset: () => void;
  onDropdownApply: (values: LinkFilterValues) => void;
};

const controlClassName =
  "h-9 shrink-0 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-900 outline-none focus:border-blue-500";

export const defaultLinkFilterValues: LinkFilterValues = {
  q: "",
  status: "normal",
  schoolStage: "",
  grade: "",
  semester: "",
  subject: "",
  resourceYear: "",
  textbookEdition: "",
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
    <section className="shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
      <div className="flex min-h-[36px] items-center gap-2 overflow-x-auto">
        <input
          id="filter-q"
          className={`${controlClassName} w-[280px]`}
          placeholder="搜索：标题/备注/科目/年级/年份/版本"
          title="搜索：标题/备注/科目/年级/年份/版本"
          value={values.q}
          onChange={(event) => updateField("q", event.target.value)}
          onKeyDown={handleTextKeyDown}
        />

        <input
          id="filter-resource-year"
          className={`${controlClassName} w-[120px]`}
          placeholder="资料年份"
          value={values.resourceYear}
          onChange={(event) => updateField("resourceYear", event.target.value)}
          onKeyDown={handleTextKeyDown}
        />

        <input
          id="filter-semester"
          className={`${controlClassName} w-[100px]`}
          placeholder="学期"
          value={values.semester}
          onChange={(event) => updateField("semester", event.target.value)}
          onKeyDown={handleTextKeyDown}
        />

        <input
          id="filter-school-stage"
          className={`${controlClassName} w-[100px]`}
          placeholder="学段"
          value={values.schoolStage}
          onChange={(event) => updateField("schoolStage", event.target.value)}
          onKeyDown={handleTextKeyDown}
        />

        <input
          id="filter-subject"
          className={`${controlClassName} w-[110px]`}
          placeholder="科目"
          value={values.subject}
          onChange={(event) => updateField("subject", event.target.value)}
          onKeyDown={handleTextKeyDown}
        />

        <input
          id="filter-grade"
          className={`${controlClassName} w-[100px]`}
          placeholder="年级"
          value={values.grade}
          onChange={(event) => updateField("grade", event.target.value)}
          onKeyDown={handleTextKeyDown}
        />

        <input
          id="filter-textbook-edition"
          className={`${controlClassName} w-[110px]`}
          placeholder="教材版本"
          value={values.textbookEdition}
          onChange={(event) =>
            updateField("textbookEdition", event.target.value)
          }
          onKeyDown={handleTextKeyDown}
        />

        <select
          id="filter-category"
          className={`${controlClassName} w-[110px]`}
          title="资料分类"
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
          <option value="">分类：全部</option>
          <option value="practice">练习</option>
          <option value="paper">试卷</option>
          <option value="special">专项</option>
        </select>

        <select
          id="filter-platform"
          className={`${controlClassName} w-[110px]`}
          title="平台"
          value={values.platform ?? ""}
          onChange={(event) =>
            updateField(
              "platform",
              (event.target.value || undefined) as LinkFilterValues["platform"],
              true,
            )
          }
        >
          <option value="">平台：全部</option>
          <option value="baidu">百度网盘</option>
          <option value="quark">夸克网盘</option>
        </select>

        <select
          id="filter-status"
          className={`${controlClassName} w-[100px]`}
          title="状态"
          value={values.status}
          onChange={(event) =>
            updateField(
              "status",
              event.target.value as LinkFilterValues["status"],
              true,
            )
          }
        >
          <option value="normal">状态：正常</option>
          <option value="invalid">已失效</option>
          <option value="all">全部</option>
        </select>

        <select
          id="filter-favorite"
          className={`${controlClassName} w-[100px]`}
          title="收藏"
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
          <option value="">收藏：全部</option>
          <option value="true">仅收藏</option>
          <option value="false">未收藏</option>
        </select>

        <button
          type="button"
          onClick={onReset}
          className="h-9 w-16 shrink-0 rounded border border-zinc-300 bg-white text-sm text-zinc-700 hover:bg-zinc-100"
        >
          重置
        </button>
        <button
          type="button"
          onClick={onSearch}
          className="h-9 w-16 shrink-0 rounded bg-blue-600 text-sm text-white hover:bg-blue-700"
        >
          搜索
        </button>
      </div>
    </section>
  );
}
