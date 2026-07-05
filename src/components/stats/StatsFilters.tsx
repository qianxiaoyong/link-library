import type { ResourceCategory } from "@/shared/types/resource-link";

export type StatsFilterValues = {
  resourceYear: string;
  subject: string;
  textbookEdition: string;
  resourceCategory: ResourceCategory | "";
};

export const defaultStatsFilterValues: StatsFilterValues = {
  resourceYear: "",
  subject: "",
  textbookEdition: "",
  resourceCategory: "",
};

const controlBaseClassName =
  "h-9 shrink-0 rounded border border-zinc-300 bg-white px-2 text-sm outline-none focus:border-blue-500";

function buildSelectClassName(
  widthClassName: string,
  isDefault: boolean,
): string {
  return `${controlBaseClassName} ${widthClassName} ${
    isDefault ? "text-zinc-400" : "text-zinc-900"
  }`;
}

type StatsFiltersProps = {
  values: StatsFilterValues;
  onChange: (values: StatsFilterValues) => void;
  onSearch: () => void;
  onReset: () => void;
};

export function StatsFilters({
  values,
  onChange,
  onSearch,
  onReset,
}: StatsFiltersProps) {
  function updateField<K extends keyof StatsFilterValues>(
    key: K,
    value: StatsFilterValues[K],
  ) {
    onChange({ ...values, [key]: value });
  }

  function handleTextKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter") {
      onSearch();
    }
  }

  return (
    <section className="shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
      <div className="flex min-h-[36px] items-center gap-2 overflow-x-auto">
        <input
          id="stats-filter-resource-year"
          className={`${controlBaseClassName} w-[120px] text-zinc-900`}
          placeholder="资料年份"
          value={values.resourceYear}
          onChange={(event) =>
            updateField("resourceYear", event.target.value)
          }
          onKeyDown={handleTextKeyDown}
        />

        <input
          id="stats-filter-subject"
          className={`${controlBaseClassName} w-[110px] text-zinc-900`}
          placeholder="科目"
          value={values.subject}
          onChange={(event) => updateField("subject", event.target.value)}
          onKeyDown={handleTextKeyDown}
        />

        <input
          id="stats-filter-textbook-edition"
          className={`${controlBaseClassName} w-[110px] text-zinc-900`}
          placeholder="教材版本"
          value={values.textbookEdition}
          onChange={(event) =>
            updateField("textbookEdition", event.target.value)
          }
          onKeyDown={handleTextKeyDown}
        />

        <select
          id="stats-filter-category"
          className={buildSelectClassName("w-[110px]", !values.resourceCategory)}
          title="资料分类"
          value={values.resourceCategory}
          onChange={(event) =>
            updateField(
              "resourceCategory",
              event.target.value as StatsFilterValues["resourceCategory"],
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
