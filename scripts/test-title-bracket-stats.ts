import assert from "node:assert/strict";
import { initLinkDatabase } from "../src/server/db/init-link-db";
import { closeLinkDatabase, getLinkDatabase } from "../src/server/db/link-db";
import {
  createResourceLink,
  deleteResourceLinksByTitlePrefix,
} from "../src/server/repositories/resource-link-repository";
import { getTitleBracketStats } from "../src/server/stats/title-bracket-stats-service";
import {
  aggregateByBookTitle,
  extractFirstBookTitle,
} from "../src/shared/stats";

const TEST_PREFIX = "[STATS-TEST]";

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

  runTest("无书名号时返回 null", () => {
    assert.equal(extractFirstBookTitle("2026秋数学练习"), null);
  });

  runTest("只取第一对书名号", () => {
    assert.equal(
      extractFirstBookTitle("2026秋《一本预备》《数学》"),
      "一本预备",
    );
  });

  runTest("空书名号内容跳过", () => {
    assert.equal(extractFirstBookTitle("2026秋《》数学"), null);
  });

  runTest("聚合年级去重并格式化", () => {
    const items = aggregateByBookTitle([
      { title: `${TEST_PREFIX} 《优秀英语作文范文》`, grade: "初一" },
      { title: `${TEST_PREFIX} 《优秀英语作文范文》`, grade: "初一" },
      { title: `${TEST_PREFIX} 《优秀英语作文范文》`, grade: "初二" },
      { title: `${TEST_PREFIX} 《期末复习专项》`, grade: null },
      { title: `${TEST_PREFIX} 无书名号资料`, grade: "三年级" },
    ]);

    assert.equal(items.length, 2);

    const english = items.find((item) => item.bookTitle === "优秀英语作文范文");
    assert.ok(english);
    assert.equal(english.count, 3);
    assert.equal(english.gradeSummary, "初一(2)、初二(1)");

    const review = items.find((item) => item.bookTitle === "期末复习专项");
    assert.ok(review);
    assert.equal(review.gradeSummary, "未填(1)");
  });

  cleanupTestData();

  createResourceLink({
    platform: "baidu",
    title: `${TEST_PREFIX} 2026《一本预备》`,
    rawUrl: "https://pan.baidu.com/s/stats-test-1",
    url: "https://pan.baidu.com/s/stats-test-1",
    accessCode: null,
    resourceCategory: "practice",
    description: null,
    schoolStage: null,
    grade: "初一",
    semester: null,
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
    rawUrl: "https://pan.baidu.com/s/stats-test-2",
    url: "https://pan.baidu.com/s/stats-test-2",
    accessCode: null,
    resourceCategory: "practice",
    description: null,
    schoolStage: null,
    grade: "初一",
    semester: null,
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
    rawUrl: "https://pan.baidu.com/s/stats-test-3",
    url: "https://pan.baidu.com/s/stats-test-3",
    accessCode: null,
    resourceCategory: "practice",
    description: null,
    schoolStage: null,
    grade: "初二",
    semester: null,
    subject: "数学",
    resourceYear: "2026",
    textbookEdition: "北师",
    status: "invalid",
    favorite: false,
    sourceText: null,
  });

  createResourceLink({
    platform: "baidu",
    title: `${TEST_PREFIX} 2025《其他资料》`,
    rawUrl: "https://pan.baidu.com/s/stats-test-4",
    url: "https://pan.baidu.com/s/stats-test-4",
    accessCode: null,
    resourceCategory: "practice",
    description: null,
    schoolStage: null,
    grade: "三年级",
    semester: null,
    subject: "语文",
    resourceYear: "2025",
    textbookEdition: "人教",
    status: "normal",
    favorite: false,
    sourceText: null,
  });

  runTest("服务层筛选并仅统计正常资料", () => {
    const result = getTitleBracketStats({
      resourceYear: "2026",
      subject: "数学",
      textbookEdition: "北师",
      resourceCategory: "practice",
    });

    assert.equal(result.totalRecords, 2);
    assert.equal(result.matchedRecords, 2);
    assert.equal(result.skippedRecords, 0);
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0]?.bookTitle, "一本预备");
    assert.equal(result.items[0]?.gradeSummary, "初一(2)");
  });

  runTest("筛选无结果时返回空列表", () => {
    const result = getTitleBracketStats({
      resourceYear: "2099",
    });

    assert.equal(result.items.length, 0);
    assert.equal(result.totalRecords, 0);
  });

  cleanupTestData();
  closeLinkDatabase();

  console.log("\n全部统计阶段 1 测试通过。");
}

main();
