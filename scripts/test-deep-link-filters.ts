import assert from "node:assert/strict";
import {
  buildLinksPagePath,
  buildMatrixCellDeepLink,
  buildStatsBookTitleDeepLink,
  decodeLinksDeepLinkParams,
  encodeLinksDeepLinkParams,
} from "../src/shared/library/deep-link-filters";

function runTest(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`[通过] ${name}`);
  } catch (error) {
    console.error(`[失败] ${name}`);
    throw error;
  }
}

function main(): void {
  runTest("编码深链参数", () => {
    const params = encodeLinksDeepLinkParams({
      q: "一本预备",
      resourceYear: "2026",
      subject: "数学",
      textbookEdition: "北师",
      resourceCategory: "practice",
    });

    assert.equal(params.get("q"), "一本预备");
    assert.equal(params.get("resourceYear"), "2026");
    assert.equal(params.get("subject"), "数学");
    assert.equal(params.get("textbookEdition"), "北师");
    assert.equal(params.get("resourceCategory"), "practice");
  });

  runTest("解码深链参数", () => {
    const searchParams = new URLSearchParams(
      "q=%E4%B8%80%E6%9C%AC%E9%A2%84%E5%A4%87&resourceYear=2026&subject=%E6%95%B0%E5%AD%A6&textbookEdition=%E5%8C%97%E5%B8%88&resourceCategory=practice",
    );
    const decoded = decodeLinksDeepLinkParams(searchParams);

    assert.deepEqual(decoded, {
      q: "一本预备",
      resourceYear: "2026",
      semester: undefined,
      schoolStage: undefined,
      subject: "数学",
      textbookEdition: "北师",
      resourceCategory: "practice",
    });
  });

  runTest("统计书名号深链使用 q 不带书名号括号", () => {
    const href = buildStatsBookTitleDeepLink(
      {
        resourceYear: "2026",
        subject: "数学",
        textbookEdition: "北师",
        resourceCategory: "practice",
      },
      "一本预备",
    );

    assert.equal(
      href,
      "/links?q=%E4%B8%80%E6%9C%AC%E9%A2%84%E5%A4%87&resourceYear=2026&subject=%E6%95%B0%E5%AD%A6&textbookEdition=%E5%8C%97%E5%B8%88&resourceCategory=practice",
    );
  });

  runTest("空筛选仅带 q", () => {
    assert.equal(
      buildLinksPagePath({ q: "期末复习专项" }),
      "/links?q=%E6%9C%9F%E6%9C%AB%E5%A4%8D%E4%B9%A0%E4%B8%93%E9%A1%B9",
    );
  });

  runTest("忽略非法分类参数", () => {
    const decoded = decodeLinksDeepLinkParams(
      new URLSearchParams("resourceCategory=invalid"),
    );
    assert.equal(decoded.resourceCategory, undefined);
  });

  runTest("矩阵单元格深链包含学期与列维度", () => {
    const href = buildMatrixCellDeepLink(
      {
        resourceYear: "2026",
        semester: "上册",
        resourceCategory: "practice",
      },
      "53天天练",
      { subject: "数学", textbookEdition: "人教" },
      "practice",
    );

    assert.match(href, /resourceYear=2026/);
    assert.match(href, /semester=%E4%B8%8A%E5%86%8C/);
    assert.match(href, /subject=%E6%95%B0%E5%AD%A6/);
    assert.match(href, /textbookEdition=%E4%BA%BA%E6%95%99/);
    assert.match(href, /resourceCategory=practice/);
    assert.match(href, /q=53%E5%A4%A9%E5%A4%A9%E7%BB%83/);
  });

  console.log("\n全部深链测试通过。");
}

main();
