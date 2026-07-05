import { getLinkDatabase } from "@/server/db/link-db";

export type ResourceLinkFieldFilterOptions = {
  resourceYears: string[];
  semesters: string[];
  schoolStages: string[];
  subjects: string[];
  grades: string[];
  textbookEditions: string[];
};

type ListDistinctFieldOptions = {
  normalOnly?: boolean;
};

function listDistinctFieldValues(
  field: string,
  options: ListDistinctFieldOptions = {},
): string[] {
  const db = getLinkDatabase();
  const conditions = [
    `${field} IS NOT NULL`,
    `TRIM(${field}) != ''`,
  ];

  if (options.normalOnly) {
    conditions.unshift("status = 'normal'");
  }

  const rows = db
    .prepare(
      `SELECT DISTINCT ${field} AS value
       FROM resource_links
       WHERE ${conditions.join(" AND ")}
       ORDER BY ${field} COLLATE NOCASE ASC`,
    )
    .all() as Array<{ value: string }>;

  return rows.map((row) => row.value.trim());
}

export function listResourceLinkFieldFilterOptions(
  options: ListDistinctFieldOptions = {},
): ResourceLinkFieldFilterOptions {
  return {
    resourceYears: listDistinctFieldValues("resource_year", options),
    semesters: listDistinctFieldValues("semester", options),
    schoolStages: listDistinctFieldValues("school_stage", options),
    subjects: listDistinctFieldValues("subject", options),
    grades: listDistinctFieldValues("grade", options),
    textbookEditions: listDistinctFieldValues("textbook_edition", options),
  };
}

export type CoverageMatrixFieldFilterOptions = Omit<
  ResourceLinkFieldFilterOptions,
  "grades"
>;

export function listCoverageMatrixFieldFilterOptions(): CoverageMatrixFieldFilterOptions {
  const options = listResourceLinkFieldFilterOptions({ normalOnly: true });
  const { grades: _grades, ...matrixOptions } = options;
  return matrixOptions;
}
