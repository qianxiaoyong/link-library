import fs from "node:fs";
import {
  closeLinkDatabase,
  getLinkDatabase,
  getLinkDatabasePath,
} from "../src/server/db/link-db";

const REQUIRED_TABLES = ["app_meta", "resource_links"];

const REQUIRED_INDEXES = [
  "idx_resource_links_platform_url",
  "idx_resource_links_status",
  "idx_resource_links_favorite",
  "idx_resource_links_platform",
  "idx_resource_links_resource_category",
  "idx_resource_links_resource_year",
  "idx_resource_links_subject",
  "idx_resource_links_created_at",
];

function checkDatabaseFile(): boolean {
  const dbPath = getLinkDatabasePath();
  const exists = fs.existsSync(dbPath);

  console.log(`[${exists ? "通过" : "失败"}] 数据库文件存在: ${dbPath}`);
  return exists;
}

function checkTables(): boolean {
  const db = getLinkDatabase();
  const rows = db
    .prepare(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name`,
    )
    .all() as Array<{ name: string }>;

  const tableNames = new Set(rows.map((row) => row.name));
  let allPassed = true;

  for (const tableName of REQUIRED_TABLES) {
    const exists = tableNames.has(tableName);
    console.log(`[${exists ? "通过" : "失败"}] 表存在: ${tableName}`);
    allPassed = allPassed && exists;
  }

  return allPassed;
}

function checkSchemaVersion(): boolean {
  const db = getLinkDatabase();
  const row = db
    .prepare(`SELECT value FROM app_meta WHERE key = 'schema_version'`)
    .get() as { value: string } | undefined;

  const exists = Boolean(row?.value);
  console.log(
    `[${exists ? "通过" : "失败"}] schema_version 存在${row ? `: ${row.value}` : ""}`,
  );
  return exists;
}

function checkIndexes(): boolean {
  const db = getLinkDatabase();
  const rows = db
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'index' ORDER BY name`)
    .all() as Array<{ name: string }>;

  const indexNames = new Set(rows.map((row) => row.name));
  let allPassed = true;

  for (const indexName of REQUIRED_INDEXES) {
    const exists = indexNames.has(indexName);
    console.log(`[${exists ? "通过" : "失败"}] 索引存在: ${indexName}`);
    allPassed = allPassed && exists;
  }

  return allPassed;
}

function main(): void {
  console.log("开始检查数据库...\n");

  const results = [
    checkDatabaseFile(),
    checkTables(),
    checkSchemaVersion(),
    checkIndexes(),
  ];

  console.log("");
  if (results.every(Boolean)) {
    console.log("检查结果: 全部通过");
    process.exitCode = 0;
  } else {
    console.log("检查结果: 存在失败项，请先运行 npm run db:init");
    process.exitCode = 1;
  }

  closeLinkDatabase();
}

main();
