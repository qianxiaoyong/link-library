import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import { initLinkDatabase } from "../src/server/db/init-link-db";
import { closeLinkDatabase, getLinkDatabase } from "../src/server/db/link-db";
import {
  backupLinkDatabase,
  getBackupDirectory,
} from "../src/server/backup/backup-database";
import {
  buildLinksExcelBuffer,
  EXCEL_HEADERS,
} from "../src/server/export/export-links-excel";
import {
  createResourceLink,
  deleteResourceLinksByTitlePrefix,
  listResourceLinksForExport,
} from "../src/server/repositories/resource-link-repository";

const TEST_PREFIX = "[TEST-EXPORT]";

function runTest(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve(fn())
    .then(() => console.log(`[通过] ${name}`))
    .catch((error) => {
      console.error(`[失败] ${name}`);
      throw error;
    });
}

async function readExcelRowCount(buffer: Buffer): Promise<number> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const sheet = workbook.getWorksheet(1);
  assert.ok(sheet);
  return Math.max(0, sheet.rowCount - 1);
}

async function readExcelHeader(buffer: Buffer): Promise<string[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const sheet = workbook.getWorksheet(1);
  assert.ok(sheet);
  const row = sheet.getRow(1);
  return EXCEL_HEADERS.map((_, index) => String(row.getCell(index + 1).value ?? ""));
}

function cleanupTestData() {
  deleteResourceLinksByTitlePrefix(TEST_PREFIX);

  const backupDir = getBackupDirectory();
  if (!fs.existsSync(backupDir)) return;

  for (const fileName of fs.readdirSync(backupDir)) {
    if (fileName.includes("test-export")) {
      fs.unlinkSync(path.join(backupDir, fileName));
    }
  }
}

async function main() {
  console.log("初始化数据库...");
  initLinkDatabase(getLinkDatabase());
  cleanupTestData();

  createResourceLink({
    platform: "baidu",
    title: `${TEST_PREFIX} 正常资料`,
    rawUrl: "https://pan.baidu.com/s/test-export-normal?pwd=abcd",
    url: "https://pan.baidu.com/s/test-export-normal",
    accessCode: "abcd",
    resourceCategory: "practice",
    description: null,
    schoolStage: "小学",
    grade: "三年级",
    semester: "上学期",
    subject: "数学",
    resourceYear: "2026秋",
    status: "normal",
    favorite: false,
    sourceText: null,
  });

  createResourceLink({
    platform: "quark",
    title: `${TEST_PREFIX} 失效资料`,
    rawUrl: "https://pan.quark.cn/s/test-export-invalid",
    url: "https://pan.quark.cn/s/test-export-invalid",
    accessCode: null,
    resourceCategory: null,
    description: null,
    schoolStage: null,
    grade: null,
    semester: null,
    subject: null,
    resourceYear: null,
    status: "invalid",
    favorite: false,
    sourceText: null,
  });

  await runTest("导出全部资料包含 normal + invalid", async () => {
    const allItems = listResourceLinksForExport({ status: "all", q: TEST_PREFIX });
    assert.equal(allItems.length, 2);

    const { buffer, fileName } = await buildLinksExcelBuffer(allItems, "all");
    assert.ok(buffer.length > 0);
    assert.match(fileName, /全部资料/);

    const rowCount = await readExcelRowCount(buffer);
    assert.equal(rowCount, 2);

    const headers = await readExcelHeader(buffer);
    assert.deepEqual(headers, [...EXCEL_HEADERS]);
  });

  await runTest("导出筛选结果只包含 normal", async () => {
    const filteredItems = listResourceLinksForExport({
      status: "normal",
      subject: "数学",
      q: TEST_PREFIX,
    });
    assert.equal(filteredItems.length, 1);
    assert.equal(filteredItems[0].status, "normal");

    const { buffer } = await buildLinksExcelBuffer(filteredItems, "filtered");
    const rowCount = await readExcelRowCount(buffer);
    assert.equal(rowCount, 1);
  });

  await runTest("数据库备份生成 .db 文件", () => {
    const result = backupLinkDatabase();
    assert.match(result.fileName, /^link-library-backup-\d{8}-\d{6}\.db$/);
    assert.match(result.relativePath, /^_workspace\/link-library\/backups\//);
    assert.ok(fs.existsSync(result.backupPath));

    const stat = fs.statSync(result.backupPath);
    assert.ok(stat.size > 0);
  });

  cleanupTestData();
  closeLinkDatabase();

  console.log("\n全部导出与备份测试通过。");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
