import { getLinkDatabase } from "@/server/db/link-db";
import type { TitleBracketStatsQuery } from "@/server/validation/title-bracket-stats-schemas";
import type { TitleBracketStatsInputRow } from "@/shared/stats";

function buildStatsWhereClause(filters: TitleBracketStatsQuery): {
  conditions: string[];
  params: unknown[];
} {
  const conditions = ["status = ?"];
  const params: unknown[] = ["normal"];

  if (filters.resourceYear) {
    conditions.push("resource_year = ?");
    params.push(filters.resourceYear);
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

export function listTitleBracketStatsRows(
  filters: TitleBracketStatsQuery,
): TitleBracketStatsInputRow[] {
  const db = getLinkDatabase();
  const { conditions, params } = buildStatsWhereClause(filters);
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = db
    .prepare(
      `SELECT title, grade
       FROM resource_links
       ${whereClause}
       ORDER BY title ASC`,
    )
    .all(...params) as Array<{ title: string; grade: string | null }>;

  return rows.map((row) => ({
    title: row.title,
    grade: row.grade,
  }));
}
