"use client";

import { LINK_PLATFORM_LABELS } from "@/shared/constants/link-taxonomy";
import type { LinkFilterOptions } from "@/shared/api/links-client";
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
  options: LinkFilterOptions;
  onChange: (values: LinkFilterValues) => void;
  onSearch: () => void;
  onReset: () => void;
  onDropdownApply: (values: LinkFilterValues) => void;
};

const controlBaseClassName =
  "h-9 shrink-0 rounded border border-zinc-300 bg-white px-2 text-sm outline-none focus:border-blue-500";

const STANDARD_SELECT_WIDTH = "w-[116px]";
const COMPACT_SELECT_WIDTH = "w-[76px]";
const TEXTBOOK_SELECT_WIDTH = "w-[96px]";
const PLATFORM_SELECT_WIDTH = "w-[106px]";
const STATUS_SELECT_WIDTH = "w-[110px]";
const FAVORITE_SELECT_WIDTH = "w-[100px]";

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

const DROPDOWN_KEYS = new Set<keyof LinkFilterValues>([
  "platform",
  "status",
  "resourceCategory",
  "favorite",
  "resourceYear",
  "semester",
  "schoolStage",
  "subject",
  "grade",
  "textbookEdition",
]);

function buildSelectClassName(
  widthClassName: string,
  isDefault: boolean,
): string {
  return `${controlBaseClassName} ${widthClassName} ${
    isDefault ? "text-zinc-400" : "text-zinc-900"
  }`;
}

function withSelectedOption(options: string[], selected: string): string[] {
  if (!selected || options.includes(selected)) {
    return options;
  }
  return [selected, ...options];
}

type FilterSelectProps = {
  id: string;
  label: string;
  value: string;
  options: string[];
  widthClassName?: string;
  onChange: (value: string) => void;
};

function FilterSelect({
  id,
  label,
  value,
  options,
  widthClassName = STANDARD_SELECT_WIDTH,
  onChange,
}: FilterSelectProps) {
  const mergedOptions = withSelectedOption(options, value);

  return (
    <select
      id={id}
      className={buildSelectClassName(widthClassName, !value)}
      title={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{label}</option>
      {mergedOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function LinkFilters({
  values,
  options,
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
          className={`${controlBaseClassName} w-[280px] text-zinc-900`}
          placeholder="搜索：标题/备注/科目/年级/年份/版本"
          title="搜索：标题/备注/科目/年级/年份/版本"
          value={values.q}
          onChange={(event) => updateField("q", event.target.value)}
          onKeyDown={handleTextKeyDown}
        />

        <FilterSelect
          id="filter-resource-year"
          label="资料年份"
          value={values.resourceYear}
          options={options.resourceYears}
          onChange={(value) => updateField("resourceYear", value, true)}
        />

        <FilterSelect
          id="filter-semester"
          label="学期"
          value={values.semester}
          options={options.semesters}
          widthClassName={COMPACT_SELECT_WIDTH}
          onChange={(value) => updateField("semester", value, true)}
        />

        <FilterSelect
          id="filter-school-stage"
          label="学段"
          value={values.schoolStage}
          options={options.schoolStages}
          widthClassName={COMPACT_SELECT_WIDTH}
          onChange={(value) => updateField("schoolStage", value, true)}
        />

        <FilterSelect
          id="filter-subject"
          label="科目"
          value={values.subject}
          options={options.subjects}
          widthClassName={COMPACT_SELECT_WIDTH}
          onChange={(value) => updateField("subject", value, true)}
        />

        <FilterSelect
          id="filter-grade"
          label="年级"
          value={values.grade}
          options={options.grades}
          widthClassName={COMPACT_SELECT_WIDTH}
          onChange={(value) => updateField("grade", value, true)}
        />

        <FilterSelect
          id="filter-textbook-edition"
          label="教材版本"
          value={values.textbookEdition}
          options={options.textbookEditions}
          widthClassName={TEXTBOOK_SELECT_WIDTH}
          onChange={(value) => updateField("textbookEdition", value, true)}
        />

        <select
          id="filter-category"
          className={buildSelectClassName(
            COMPACT_SELECT_WIDTH,
            !values.resourceCategory,
          )}
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
          <option value="">分类</option>
          <option value="practice">练习</option>
          <option value="paper">试卷</option>
          <option value="special">专项</option>
        </select>

        <select
          id="filter-platform"
          className={buildSelectClassName(PLATFORM_SELECT_WIDTH, !values.platform)}
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
          <option value="">平台</option>
          {(Object.entries(LINK_PLATFORM_LABELS) as Array<[LinkPlatform, string]>).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ),
          )}
        </select>

        <select
          id="filter-status"
          className={buildSelectClassName(
            STATUS_SELECT_WIDTH,
            values.status === "normal",
          )}
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
          className={buildSelectClassName(
            FAVORITE_SELECT_WIDTH,
            values.favorite === undefined,
          )}
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
          <option value="">收藏</option>
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
