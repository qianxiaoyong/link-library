import { getLinkDatabase } from "@/server/db/link-db";
import {
  mapCreateInputToInsertValues,
  mapRowToResourceLink,
  type ResourceLinkRow,
} from "@/server/mappers/resource-link-mapper";
import type {
  CreateResourceLinkInput,
  LinkPlatform,
  ResourceLink,
  UpdateResourceLinkInput,
} from "@/shared/types/resource-link";

export class DuplicateLinkError extends Error {
  readonly code = "DUPLICATE_LINK";

  constructor(message = "该链接已存在") {
    super(message);
    this.name = "DuplicateLinkError";
  }
}

export type ListResourceLinksFilters = {
  q?: string;
  platform?: LinkPlatform;
  status?: "normal" | "invalid" | "all";
  favorite?: boolean;
  resourceCategory?: "practice" | "paper" | "special";
  schoolStage?: string;
  grade?: string;
  semester?: string;
  subject?: string;
  resourceYear?: string;
  textbookEdition?: string;
  limit?: number;
  offset?: number;
};

const SELECT_COLUMNS = `
  id, platform, title, raw_url, url, access_code, resource_category,
  description, school_stage, grade, semester, subject, resource_year,
  textbook_edition, status, favorite, source_text, created_at, updated_at
`;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE"
  );
}

function buildWhereClause(filters: ListResourceLinksFilters): {
  conditions: string[];
  params: unknown[];
} {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.status && filters.status !== "all") {
    conditions.push("status = ?");
    params.push(filters.status);
  }

  if (filters.platform) {
    conditions.push("platform = ?");
    params.push(filters.platform);
  }

  if (filters.favorite !== undefined) {
    conditions.push("favorite = ?");
    params.push(filters.favorite ? 1 : 0);
  }

  if (filters.resourceCategory) {
    conditions.push("resource_category = ?");
    params.push(filters.resourceCategory);
  }

  if (filters.schoolStage) {
    conditions.push("school_stage = ?");
    params.push(filters.schoolStage);
  }

  if (filters.grade) {
    conditions.push("grade = ?");
    params.push(filters.grade);
  }

  if (filters.semester) {
    conditions.push("semester = ?");
    params.push(filters.semester);
  }

  if (filters.subject) {
    conditions.push("subject = ?");
    params.push(filters.subject);
  }

  if (filters.resourceYear) {
    conditions.push("resource_year = ?");
    params.push(filters.resourceYear);
  }

  if (filters.textbookEdition) {
    conditions.push("textbook_edition = ?");
    params.push(filters.textbookEdition);
  }

  if (filters.q?.trim()) {
    const keyword = `%${filters.q.trim()}%`;
    conditions.push(`(
      title LIKE ? OR
      description LIKE ? OR
      subject LIKE ? OR
      grade LIKE ? OR
      resource_year LIKE ? OR
      textbook_edition LIKE ?
    )`);
    params.push(keyword, keyword, keyword, keyword, keyword, keyword);
  }

  return { conditions, params };
}

function findDuplicate(
  platform: LinkPlatform,
  url: string,
  excludeId?: string,
): boolean {
  const db = getLinkDatabase();
  const row = excludeId
    ? db
        .prepare(
          `SELECT id FROM resource_links WHERE platform = ? AND url = ? AND id != ? LIMIT 1`,
        )
        .get(platform, url, excludeId)
    : db
        .prepare(
          `SELECT id FROM resource_links WHERE platform = ? AND url = ? LIMIT 1`,
        )
        .get(platform, url);

  return Boolean(row);
}

const LIST_ORDER_BY = "created_at DESC";

export function listResourceLinks(filters: ListResourceLinksFilters = {}): {
  items: ResourceLink[];
  total: number;
} {
  const db = getLinkDatabase();
  const limit = Math.min(filters.limit ?? 50, 200);
  const offset = filters.offset ?? 0;
  const { conditions, params } = buildWhereClause(filters);
  const whereSql =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const totalRow = db
    .prepare(`SELECT COUNT(*) AS total FROM resource_links ${whereSql}`)
    .get(...params) as { total: number };

  const rows = db
    .prepare(
      `SELECT ${SELECT_COLUMNS}
       FROM resource_links
       ${whereSql}
       ORDER BY ${LIST_ORDER_BY}
       LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset) as ResourceLinkRow[];

  return {
    items: rows.map(mapRowToResourceLink),
    total: totalRow.total,
  };
}

export function listResourceLinksForExport(
  filters: Omit<ListResourceLinksFilters, "limit" | "offset"> = {},
): ResourceLink[] {
  const db = getLinkDatabase();
  const { conditions, params } = buildWhereClause(filters);
  const whereSql =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = db
    .prepare(
      `SELECT ${SELECT_COLUMNS}
       FROM resource_links
       ${whereSql}
       ORDER BY ${LIST_ORDER_BY}`,
    )
    .all(...params) as ResourceLinkRow[];

  return rows.map(mapRowToResourceLink);
}

export function getResourceLinkById(id: string): ResourceLink | null {
  const db = getLinkDatabase();
  const row = db
    .prepare(`SELECT ${SELECT_COLUMNS} FROM resource_links WHERE id = ?`)
    .get(id) as ResourceLinkRow | undefined;

  return row ? mapRowToResourceLink(row) : null;
}

export function createResourceLink(
  input: CreateResourceLinkInput,
): ResourceLink {
  const db = getLinkDatabase();

  if (findDuplicate(input.platform, input.url)) {
    throw new DuplicateLinkError();
  }

  const id = crypto.randomUUID();
  const values = mapCreateInputToInsertValues(input, id);

  try {
    db.prepare(
      `INSERT INTO resource_links (
        id, platform, title, raw_url, url, access_code, resource_category,
        description, school_stage, grade, semester, subject, resource_year,
        textbook_edition, status, favorite, source_text
      ) VALUES (
        @id, @platform, @title, @raw_url, @url, @access_code, @resource_category,
        @description, @school_stage, @grade, @semester, @subject, @resource_year,
        @textbook_edition, @status, @favorite, @source_text
      )`,
    ).run(values);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new DuplicateLinkError();
    }
    throw error;
  }

  const created = getResourceLinkById(id);
  if (!created) {
    throw new Error("创建资料链接后读取失败");
  }

  return created;
}

export function updateResourceLink(
  id: string,
  input: UpdateResourceLinkInput,
): ResourceLink | null {
  const db = getLinkDatabase();
  const existing = getResourceLinkById(id);

  if (!existing) {
    return null;
  }

  const nextUrl = input.url ?? existing.url;
  if (findDuplicate(existing.platform, nextUrl, id)) {
    throw new DuplicateLinkError();
  }

  const fields: string[] = [];
  const params: Record<string, unknown> = { id };

  if (input.title !== undefined) {
    fields.push("title = @title");
    params.title = input.title;
  }
  if (input.rawUrl !== undefined) {
    fields.push("raw_url = @raw_url");
    params.raw_url = input.rawUrl;
  }
  if (input.url !== undefined) {
    fields.push("url = @url");
    params.url = input.url;
  }
  if (input.accessCode !== undefined) {
    fields.push("access_code = @access_code");
    params.access_code = input.accessCode;
  }
  if (input.resourceCategory !== undefined) {
    fields.push("resource_category = @resource_category");
    params.resource_category = input.resourceCategory;
  }
  if (input.description !== undefined) {
    fields.push("description = @description");
    params.description = input.description;
  }
  if (input.schoolStage !== undefined) {
    fields.push("school_stage = @school_stage");
    params.school_stage = input.schoolStage;
  }
  if (input.grade !== undefined) {
    fields.push("grade = @grade");
    params.grade = input.grade;
  }
  if (input.semester !== undefined) {
    fields.push("semester = @semester");
    params.semester = input.semester;
  }
  if (input.subject !== undefined) {
    fields.push("subject = @subject");
    params.subject = input.subject;
  }
  if (input.resourceYear !== undefined) {
    fields.push("resource_year = @resource_year");
    params.resource_year = input.resourceYear;
  }
  if (input.textbookEdition !== undefined) {
    fields.push("textbook_edition = @textbook_edition");
    params.textbook_edition = input.textbookEdition;
  }
  if (input.status !== undefined) {
    fields.push("status = @status");
    params.status = input.status;
  }
  if (input.favorite !== undefined) {
    fields.push("favorite = @favorite");
    params.favorite = input.favorite ? 1 : 0;
  }
  if (input.sourceText !== undefined) {
    fields.push("source_text = @source_text");
    params.source_text = input.sourceText;
  }

  if (fields.length === 0) {
    return existing;
  }

  try {
    db.prepare(
      `UPDATE resource_links SET ${fields.join(", ")} WHERE id = @id`,
    ).run(params);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new DuplicateLinkError();
    }
    throw error;
  }

  return getResourceLinkById(id);
}

export function deleteResourceLink(id: string): boolean {
  const db = getLinkDatabase();
  const result = db
    .prepare(`DELETE FROM resource_links WHERE id = ?`)
    .run(id);

  return result.changes > 0;
}

export function deleteResourceLinksByTitlePrefix(prefix: string): number {
  const db = getLinkDatabase();
  const result = db
    .prepare(`DELETE FROM resource_links WHERE title LIKE ?`)
    .run(`${prefix}%`);

  return result.changes;
}

export function createManyResourceLinksSkipDuplicates(
  inputs: CreateResourceLinkInput[],
): {
  created: ResourceLink[];
  skippedDuplicates: Array<{
    platform: LinkPlatform;
    url: string;
    title: string;
  }>;
  failures: Array<{
    title?: string;
    reason: string;
  }>;
} {
  const created: ResourceLink[] = [];
  const skippedDuplicates: Array<{
    platform: LinkPlatform;
    url: string;
    title: string;
  }> = [];
  const failures: Array<{ title?: string; reason: string }> = [];

  for (const input of inputs) {
    try {
      if (findDuplicate(input.platform, input.url)) {
        skippedDuplicates.push({
          platform: input.platform,
          url: input.url,
          title: input.title,
        });
        continue;
      }

      created.push(createResourceLink(input));
    } catch (error) {
      if (error instanceof DuplicateLinkError) {
        skippedDuplicates.push({
          platform: input.platform,
          url: input.url,
          title: input.title,
        });
        continue;
      }

      failures.push({
        title: input.title,
        reason: error instanceof Error ? error.message : "写入失败",
      });
    }
  }

  return { created, skippedDuplicates, failures };
}
