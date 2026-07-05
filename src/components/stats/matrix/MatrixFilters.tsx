import type { CoverageMatrixFilterOptions } from "@/shared/api/coverage-matrix-client";
import { LINK_PLATFORM_LABELS } from "@/shared/constants/link-taxonomy";
import type { LinkPlatform, ResourceCategory } from "@/shared/types/resource-link";

export type MatrixFilterValues = {
  platform: LinkPlatform | "";
  resourceYear: string;
  semester: string;
  schoolStage: string;
  subject: string;
  textbookEdition: string;
  resourceCategory: ResourceCategory | "";
};

export const defaultMatrixFilterValues: MatrixFilterValues = {
  platform: "",
  resourceYear: "",
  semester: "",
  schoolStage: "",
  subject: "",
  textbookEdition: "",
  resourceCategory: "",
};

const controlBaseClassName =
  "h-9 shrink-0 rounded border border-zinc-300 bg-white px-2 text-sm outline-none focus:border-blue-500";

const FILTER_SELECT_WIDTH = "w-[116px]";
const COMPACT_SELECT_WIDTH = "w-[76px]";
const TEXTBOOK_SELECT_WIDTH = "w-[96px]";
const PLATFORM_SELECT_WIDTH = "w-[106px]";

function buildSelectClassName(
  widthClassName: string,
  isDefault: boolean,
): string {
  return `${controlBaseClassName} ${widthClassName} ${
    isDefault ? "text-zinc-400" : "text-zinc-900"
  }`;
}

type MatrixFiltersProps = {
  values: MatrixFilterValues;
  options: CoverageMatrixFilterOptions;
  onChange: (values: MatrixFilterValues) => void;
  onSearch: () => void;
  onReset: () => void;
};

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
  widthClassName = FILTER_SELECT_WIDTH,
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

export function MatrixFilters({
  values,
  options,
  onChange,
  onSearch,
  onReset,
}: MatrixFiltersProps) {
  function updateField<K extends keyof MatrixFilterValues>(
    key: K,
    value: MatrixFilterValues[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  return (
    <section className="shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
      <div className="flex min-h-[36px] items-center gap-2 overflow-x-auto">
        <select
          id="matrix-filter-platform"
          className={buildSelectClassName(PLATFORM_SELECT_WIDTH, !values.platform)}
          title="平台"
          value={values.platform}
          onChange={(event) =>
            updateField(
              "platform",
              event.target.value as MatrixFilterValues["platform"],
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

        <FilterSelect
          id="matrix-filter-resource-year"
          label="资料年份"
          value={values.resourceYear}
          options={options.resourceYears}
          onChange={(value) => updateField("resourceYear", value)}
        />

        <FilterSelect
          id="matrix-filter-semester"
          label="学期"
          value={values.semester}
          options={options.semesters}
          widthClassName={COMPACT_SELECT_WIDTH}
          onChange={(value) => updateField("semester", value)}
        />

        <FilterSelect
          id="matrix-filter-school-stage"
          label="学段"
          value={values.schoolStage}
          options={options.schoolStages}
          widthClassName={COMPACT_SELECT_WIDTH}
          onChange={(value) => updateField("schoolStage", value)}
        />

        <FilterSelect
          id="matrix-filter-subject"
          label="科目"
          value={values.subject}
          options={options.subjects}
          widthClassName={COMPACT_SELECT_WIDTH}
          onChange={(value) => updateField("subject", value)}
        />

        <FilterSelect
          id="matrix-filter-textbook-edition"
          label="教材版本"
          value={values.textbookEdition}
          options={options.textbookEditions}
          widthClassName={TEXTBOOK_SELECT_WIDTH}
          onChange={(value) => updateField("textbookEdition", value)}
        />

        <select
          id="matrix-filter-category"
          className={buildSelectClassName(
            COMPACT_SELECT_WIDTH,
            !values.resourceCategory,
          )}
          title="资料分类"
          value={values.resourceCategory}
          onChange={(event) =>
            updateField(
              "resourceCategory",
              event.target.value as MatrixFilterValues["resourceCategory"],
            )
          }
        >
          <option value="">分类</option>
          <option value="practice">练习</option>
          <option value="paper">试卷</option>
          <option value="special">专项</option>
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
          查询
        </button>
      </div>
    </section>
  );
}
