import type { CoverageMatrixFilterOptions } from "@/shared/api/coverage-matrix-client";
import type { ResourceCategory } from "@/shared/types/resource-link";

export type MatrixFilterValues = {
  resourceYear: string;
  semester: string;
  schoolStage: string;
  subject: string;
  textbookEdition: string;
  resourceCategory: ResourceCategory | "";
};

export const defaultMatrixFilterValues: MatrixFilterValues = {
  resourceYear: "",
  semester: "",
  schoolStage: "",
  subject: "",
  textbookEdition: "",
  resourceCategory: "",
};

const controlClassName =
  "h-9 shrink-0 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-900 outline-none focus:border-blue-500";

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
  widthClassName: string;
  onChange: (value: string) => void;
};

function FilterSelect({
  id,
  label,
  value,
  options,
  widthClassName,
  onChange,
}: FilterSelectProps) {
  const mergedOptions = withSelectedOption(options, value);

  return (
    <select
      id={id}
      className={`${controlClassName} ${widthClassName}`}
      title={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{label}：全部</option>
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
        <FilterSelect
          id="matrix-filter-resource-year"
          label="资料年份"
          value={values.resourceYear}
          options={options.resourceYears}
          widthClassName="w-[120px]"
          onChange={(value) => updateField("resourceYear", value)}
        />

        <FilterSelect
          id="matrix-filter-semester"
          label="学期"
          value={values.semester}
          options={options.semesters}
          widthClassName="w-[100px]"
          onChange={(value) => updateField("semester", value)}
        />

        <FilterSelect
          id="matrix-filter-school-stage"
          label="学段"
          value={values.schoolStage}
          options={options.schoolStages}
          widthClassName="w-[100px]"
          onChange={(value) => updateField("schoolStage", value)}
        />

        <FilterSelect
          id="matrix-filter-subject"
          label="科目"
          value={values.subject}
          options={options.subjects}
          widthClassName="w-[110px]"
          onChange={(value) => updateField("subject", value)}
        />

        <FilterSelect
          id="matrix-filter-textbook-edition"
          label="教材版本"
          value={values.textbookEdition}
          options={options.textbookEditions}
          widthClassName="w-[110px]"
          onChange={(value) => updateField("textbookEdition", value)}
        />

        <select
          id="matrix-filter-category"
          className={`${controlClassName} w-[110px]`}
          title="资料分类"
          value={values.resourceCategory}
          onChange={(event) =>
            updateField(
              "resourceCategory",
              event.target.value as MatrixFilterValues["resourceCategory"],
            )
          }
        >
          <option value="">分类：全部</option>
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
