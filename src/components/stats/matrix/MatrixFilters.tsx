import type { ResourceCategory } from "@/shared/types/resource-link";

export type MatrixFilterValues = {
  resourceYear: string;
  semester: string;
  subject: string;
  textbookEdition: string;
  resourceCategory: ResourceCategory | "";
};

export const defaultMatrixFilterValues: MatrixFilterValues = {
  resourceYear: "",
  semester: "",
  subject: "",
  textbookEdition: "",
  resourceCategory: "",
};

const controlClassName =
  "h-9 shrink-0 rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-900 outline-none focus:border-blue-500";

type MatrixFiltersProps = {
  values: MatrixFilterValues;
  onChange: (values: MatrixFilterValues) => void;
  onSearch: () => void;
  onReset: () => void;
};

export function MatrixFilters({
  values,
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

  function handleTextKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter") {
      onSearch();
    }
  }

  return (
    <section className="shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
      <div className="flex min-h-[36px] items-center gap-2 overflow-x-auto">
        <input
          id="matrix-filter-resource-year"
          className={`${controlClassName} w-[120px]`}
          placeholder="资料年份"
          value={values.resourceYear}
          onChange={(event) =>
            updateField("resourceYear", event.target.value)
          }
          onKeyDown={handleTextKeyDown}
        />

        <input
          id="matrix-filter-semester"
          className={`${controlClassName} w-[100px]`}
          placeholder="学期"
          value={values.semester}
          onChange={(event) => updateField("semester", event.target.value)}
          onKeyDown={handleTextKeyDown}
        />

        <input
          id="matrix-filter-subject"
          className={`${controlClassName} w-[110px]`}
          placeholder="科目"
          value={values.subject}
          onChange={(event) => updateField("subject", event.target.value)}
          onKeyDown={handleTextKeyDown}
        />

        <input
          id="matrix-filter-textbook-edition"
          className={`${controlClassName} w-[110px]`}
          placeholder="教材版本"
          value={values.textbookEdition}
          onChange={(event) =>
            updateField("textbookEdition", event.target.value)
          }
          onKeyDown={handleTextKeyDown}
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
