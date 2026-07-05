import assert from "node:assert/strict";
import { initLinkDatabase } from "../src/server/db/init-link-db";
import { closeLinkDatabase, getLinkDatabase } from "../src/server/db/link-db";
import {
  createResourceLink,
  deleteResourceLinksByTitlePrefix,
} from "../src/server/repositories/resource-link-repository";
import { getCoverageMatrix } from "../src/server/stats/coverage-matrix-service";
import { buildCoverageMatrix } from "../src/shared/stats/coverage-matrix";

const TEST_PREFIX = "[MATRIX-TEST]";

function runTest(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`[通过] ${name}`);
  } catch (error) {
    console.error(`[失败] ${name}`);
    throw error;
  }
}

function cleanupTestData(): void {
  const removed = deleteResourceLinksByTitlePrefix(TEST_PREFIX);
  if (removed > 0) {
    console.log(`已清理 ${removed} 条测试数据`);
  }
}

function main(): void {
  console.log("初始化数据库...");
  initLinkDatabase(getLinkDatabase());

  runTest("纯函数：动态列与年级覆盖格式", () => {
    const result = buildCoverageMatrix([
      {
        title: `${TEST_PREFIX} 《53天天练》`,
        grade: "3",
        resourceCategory: "practice",
        subject: "数学",
        textbookEdition: "人教",
      },
      {
        title: `${TEST_PREFIX} 《53天天练》`,
        grade: "4",
        resourceCategory: "practice",
        subject: "数学",
        textbookEdition: "人教",
      },
      {
        title: `${TEST_PREFIX} 《53天天练》`,
        grade: "5",
        resourceCategory: "practice",
        subject: "数学",
        textbookEdition: "人教",
      },
      {
        title: `${TEST_PREFIX} 《53天天练》`,
        grade: "6",
        resourceCategory: "practice",
        subject: "数学",
        textbookEdition: "人教",
      },
      {
        title: `${TEST_PREFIX} 《53天天练》`,
        grade: "3",
        resourceCategory: "practice",
        subject: "语文",
        textbookEdition: null,
      },
      {
        title: `${TEST_PREFIX} 无书名号`,
        grade: "1",
        resourceCategory: "practice",
        subject: "语文",
        textbookEdition: null,
      },
    ]);

    assert.equal(result.matchedRecords, 5);
    assert.equal(result.skippedRecords, 1);
    assert.equal(result.columns.length, 2);
    assert.equal(result.columns[0]?.label, "数学·人教");
    assert.equal(result.columns[1]?.label, "语文");

    const row = result.rows.find((item) => item.bookTitle === "53天天练");
    assert.ok(row);
    assert.equal(row.categoryLabel, "练习");

    const mathColumnKey = result.columns[0]?.key;
    assert.ok(mathColumnKey);
    assert.equal(row.cells[mathColumnKey]?.gradeCoverage, "3-6");
    assert.equal(row.cells[mathColumnKey]?.count, 4);

    const chineseColumnKey = result.columns[1]?.key;
    assert.ok(chineseColumnKey);
    assert.equal(row.cells[chineseColumnKey]?.gradeCoverage, "3");
  });

  cleanupTestData();

  createResourceLink({
    platform: "baidu",
    title: `${TEST_PREFIX} 2026《一本预备》`,
    rawUrl: "https://pan.baidu.com/s/matrix-test-1",
    url: "https://pan.baidu.com/s/matrix-test-1",
    accessCode: null,
    resourceCategory: "practice",
    description: null,
    schoolStage: null,
    grade: "1",
    semester: "上册",
    subject: "数学",
    resourceYear: "2026",
    textbookEdition: "北师",
    status: "normal",
    favorite: false,
    sourceText: null,
  });

  createResourceLink({
    platform: "baidu",
    title: `${TEST_PREFIX} 2026《一本预备》`,
    rawUrl: "https://pan.baidu.com/s/matrix-test-2",
    url: "https://pan.baidu.com/s/matrix-test-2",
    accessCode: null,
    resourceCategory: "practice",
    description: null,
    schoolStage: null,
    grade: "3",
    semester: "上册",
    subject: "数学",
    resourceYear: "2026",
    textbookEdition: "北师",
    status: "normal",
    favorite: false,
    sourceText: null,
  });

  createResourceLink({
    platform: "baidu",
    title: `${TEST_PREFIX} 2026《一本预备》`,
    rawUrl: "https://pan.baidu.com/s/matrix-test-3",
    url: "https://pan.baidu.com/s/matrix-test-3",
    accessCode: null,
    resourceCategory: "practice",
    description: null,
    schoolStage: null,
    grade: "4",
    semester: "上册",
    subject: "数学",
    resourceYear: "2026",
    textbookEdition: "北师",
    status: "normal",
    favorite: false,
    sourceText: null,
  });

  createResourceLink({
    platform: "baidu",
    title: `${TEST_PREFIX} 2026《一本预备》`,
    rawUrl: "https://pan.baidu.com/s/matrix-test-4",
    url: "https://pan.baidu.com/s/matrix-test-4",
    accessCode: null,
    resourceCategory: "practice",
    description: null,
    schoolStage: null,
    grade: "5",
    semester: "上册",
    subject: "数学",
    resourceYear: "2026",
    textbookEdition: "北师",
    status: "normal",
    favorite: false,
    sourceText: null,
  });

  createResourceLink({
    platform: "baidu",
    title: `${TEST_PREFIX} 2026《一本预备》`,
    rawUrl: "https://pan.baidu.com/s/matrix-test-5",
    url: "https://pan.baidu.com/s/matrix-test-5",
    accessCode: null,
    resourceCategory: "practice",
    description: null,
    schoolStage: null,
    grade: "6",
    semester: "上册",
    subject: "数学",
    resourceYear: "2026",
    textbookEdition: "北师",
    status: "normal",
    favorite: false,
    sourceText: null,
  });

  createResourceLink({
    platform: "baidu",
    title: `${TEST_PREFIX} 2026《一本预备》`,
    rawUrl: "https://pan.baidu.com/s/matrix-test-6",
    url: "https://pan.baidu.com/s/matrix-test-6",
    accessCode: null,
    resourceCategory: "practice",
    description: null,
    schoolStage: null,
    grade: "9",
    semester: "上册",
    subject: "数学",
    resourceYear: "2026",
    textbookEdition: "北师",
    status: "invalid",
    favorite: false,
    sourceText: null,
  });

  runTest("服务层：筛选并排除失效资料", () => {
    const result = getCoverageMatrix({
      resourceYear: "2026",
      semester: "上册",
      subject: "数学",
      textbookEdition: "北师",
      resourceCategory: "practice",
    });

    assert.equal(result.totalRecords, 5);
    assert.equal(result.matchedRecords, 5);
    assert.equal(result.rows.length, 1);
    assert.equal(result.rows[0]?.cells[result.columns[0]?.key ?? ""]?.gradeCoverage, "1,3-6");
  });

  runTest("服务层：书名号包含筛选", () => {
    const matched = getCoverageMatrix({
      resourceYear: "2026",
      semester: "上册",
      subject: "数学",
      textbookEdition: "北师",
      resourceCategory: "practice",
      bookTitle: "一本",
    });

    assert.equal(matched.rows.length, 1);
    assert.equal(matched.rows[0]?.bookTitle, "一本预备");

    const empty = getCoverageMatrix({
      resourceYear: "2026",
      semester: "上册",
      subject: "数学",
      textbookEdition: "北师",
      resourceCategory: "practice",
      bookTitle: "不存在",
    });

    assert.equal(empty.totalRecords, 0);
    assert.equal(empty.rows.length, 0);
  });

  cleanupTestData();
  closeLinkDatabase();

  console.log("\n全部覆盖矩阵阶段 2 测试通过。");
}

main();
