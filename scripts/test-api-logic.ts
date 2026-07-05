import assert from "node:assert/strict";
import { initLinkDatabase } from "../src/server/db/init-link-db";
import { getLinkDatabase, closeLinkDatabase } from "../src/server/db/link-db";
import { parseLinkText } from "../src/shared/parser";
import {
  createManyResourceLinksSkipDuplicates,
  createResourceLink,
  deleteResourceLinksByTitlePrefix,
  DuplicateLinkError,
  getResourceLinkById,
  listResourceLinks,
  updateResourceLink,
  deleteResourceLink,
} from "../src/server/repositories/resource-link-repository";

const TEST_PREFIX = "[TEST]";

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

  cleanupTestData();

  const testUrl = "https://pan.baidu.com/s/test-api-logic-url";
  let createdId = "";

  runTest("插入一条百度资料", () => {
    const item = createResourceLink({
      platform: "baidu",
      title: `${TEST_PREFIX} 百度资料`,
      rawUrl: `${testUrl}?pwd=abcd`,
      url: testUrl,
      accessCode: "abcd",
      resourceCategory: null,
      description: null,
      schoolStage: null,
      grade: null,
      semester: null,
      subject: null,
      resourceYear: null,
      textbookEdition: null,
      status: "normal",
      favorite: false,
      sourceText: null,
    });

    createdId = item.id;
    assert.equal(item.title, `${TEST_PREFIX} 百度资料`);
  });

  runTest("重复插入同一条应识别为重复", () => {
    assert.throws(
      () =>
        createResourceLink({
          platform: "baidu",
          title: `${TEST_PREFIX} 重复资料`,
          rawUrl: `${testUrl}?pwd=abcd`,
          url: testUrl,
          accessCode: "abcd",
          resourceCategory: null,
          description: null,
          schoolStage: null,
          grade: null,
          semester: null,
          subject: null,
          resourceYear: null,
          textbookEdition: null,
          status: "normal",
          favorite: false,
          sourceText: null,
        }),
      (error: unknown) => error instanceof DuplicateLinkError,
    );
  });

  runTest("默认列表只返回 normal 资料", () => {
    const result = listResourceLinks({ status: "normal" });
    assert.ok(result.items.some((item) => item.id === createdId));
  });

  runTest("更新 favorite", () => {
    const updated = updateResourceLink(createdId, { favorite: true });
    assert.ok(updated);
    assert.equal(updated.favorite, true);
  });

  runTest("更新 status 为 invalid", () => {
    const updated = updateResourceLink(createdId, { status: "invalid" });
    assert.ok(updated);
    assert.equal(updated.status, "invalid");
  });

  runTest("默认列表不包含 invalid 资料", () => {
    const result = listResourceLinks({ status: "normal" });
    assert.ok(!result.items.some((item) => item.id === createdId));
  });

  runTest("status=all 可查到 invalid 资料", () => {
    const result = listResourceLinks({ status: "all" });
    assert.ok(result.items.some((item) => item.id === createdId));
  });

  runTest("删除资料", () => {
    const deleted = deleteResourceLink(createdId);
    assert.equal(deleted, true);
    assert.equal(getResourceLinkById(createdId), null);
  });

  runTest("批量导入：百度 1 + 夸克 1 + 重复 1", () => {
    const baiduUrl = "https://pan.baidu.com/s/test-api-batch-baidu";
    const quarkUrl = "https://pan.quark.cn/s/test-api-batch-quark";

    const parsed = parseLinkText(`通过网盘分享的文件：${TEST_PREFIX} 批量百度
链接: ${baiduUrl}?pwd=1111 提取码: 1111

我用夸克网盘分享了「${TEST_PREFIX} 批量夸克」，点击链接即可保存。
链接：${quarkUrl}`);

    assert.equal(parsed.items.length, 2);

    const firstApply = createManyResourceLinksSkipDuplicates(
      parsed.items.map((item) => ({
        platform: item.platform,
        title: item.title,
        rawUrl: item.rawUrl,
        url: item.url,
        accessCode: item.accessCode,
        resourceCategory: null,
        description: null,
        schoolStage: null,
        grade: null,
        semester: null,
        subject: null,
        resourceYear: null,
        textbookEdition: null,
        status: "normal",
        favorite: false,
        sourceText: item.sourceText,
      })),
    );

    assert.equal(firstApply.created.length, 2);
    assert.equal(firstApply.skippedDuplicates.length, 0);

    const secondApply = createManyResourceLinksSkipDuplicates(
      parsed.items.map((item) => ({
        platform: item.platform,
        title: item.title,
        rawUrl: item.rawUrl,
        url: item.url,
        accessCode: item.accessCode,
        resourceCategory: null,
        description: null,
        schoolStage: null,
        grade: null,
        semester: null,
        subject: null,
        resourceYear: null,
        textbookEdition: null,
        status: "normal",
        favorite: false,
        sourceText: item.sourceText,
      })),
    );

    assert.equal(secondApply.created.length, 0);
    assert.equal(secondApply.skippedDuplicates.length, 2);
  });

  cleanupTestData();
  closeLinkDatabase();

  console.log("\n全部 API 逻辑测试通过。");
}

main();
