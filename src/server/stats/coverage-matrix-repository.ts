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

  if (filters.resourceYear) {
    conditions.push("resource_year = ?");
    params.push(filters.resourceYear);
  }

  if (filters.semester) {
    conditions.push("semester = ?");
    params.push(filters.semester);
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
