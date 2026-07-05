import { getLinkDatabase } from "@/server/db/link-db";
import type { CoverageMatrixQuery } from "@/server/validation/coverage-matrix-schemas";
import type { CoverageMatrixInputRow } from "@/shared/stats/coverage-matrix";
import type { ResourceCategory } from "@/shared/types/resource-link";

function buildCoverageMatrixWhereClause(filters: CoverageMatrixQuery): {
  conditions: string[];
  params: unknown[];
} {
  const conditions = ["status = ?"];
  const params: unknown[] = ["normal"];

  if (filters.platform) {
    conditions.push("platform = ?");
    params.push(filters.platform);
  }

  if (filters.resourceYear) {
    conditions.push("resource_year = ?");
    params.push(filters.resourceYear);
  }

  if (filters.semester) {
    conditions.push("semester = ?");
    params.push(filters.semester);
  }

  if (filters.schoolStage) {
    conditions.push("school_stage = ?");
    params.push(filters.schoolStage);
  }

  if (filters.subject) {
    conditions.push("subject = ?");
    params.push(filters.subject);
  }

  if (filters.textbookEdition) {
    conditions.push("textbook_edition = ?");
    params.push(filters.textbookEdition);
  }

  if (filters.resourceCategory) {
    conditions.push("resource_category = ?");
    params.push(filters.resourceCategory);
  }

  return { conditions, params };
}

export function listCoverageMatrixRows(
  filters: CoverageMatrixQuery,
): CoverageMatrixInputRow[] {
  const db = getLinkDatabase();
  const { conditions, params } = buildCoverageMatrixWhereClause(filters);
  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = db
    .prepare(
      `SELECT title, grade, resource_category, subject, textbook_edition
       FROM resource_links
       ${whereClause}
       ORDER BY title ASC`,
    )
    .all(...params) as Array<{
    title: string;
    grade: string | null;
    resource_category: ResourceCategory | null;
    subject: string | null;
    textbook_edition: string | null;
  }>;

  return rows.map((row) => ({
    title: row.title,
    grade: row.grade,
    resourceCategory: row.resource_category,
    subject: row.subject,
    textbookEdition: row.textbook_edition,
  }));
}

export type CoverageMatrixFilterOptions = {
  resourceYears: string[];
  semesters: string[];
  schoolStages: string[];
  subjects: string[];
  textbookEditions: string[];
};

function listDistinctFieldValues(field: string): string[] {
  const db = getLinkDatabase();
  const rows = db
    .prepare(
      `SELECT DISTINCT ${field} AS value
       FROM resource_links
       WHERE status = 'normal'
         AND ${field} IS NOT NULL
         AND TRIM(${field}) != ''
       ORDER BY ${field} COLLATE NOCASE ASC`,
    )
    .all() as Array<{ value: string }>;

  return rows.map((row) => row.value.trim());
}

export function listCoverageMatrixFilterOptions(): CoverageMatrixFilterOptions {
  return {
    resourceYears: listDistinctFieldValues("resource_year"),
    semesters: listDistinctFieldValues("semester"),
    schoolStages: listDistinctFieldValues("school_stage"),
    subjects: listDistinctFieldValues("subject"),
    textbookEditions: listDistinctFieldValues("textbook_edition"),
  };
}
