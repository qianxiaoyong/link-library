import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { initLinkDatabase } from "../src/server/db/init-link-db";
import { closeLinkDatabase, getLinkDatabase } from "../src/server/db/link-db";
import { getLinkLibraryWorkspaceDir } from "../src/server/config/workspace-path";
import {
  readCoverageMatrixFiltersConfig,
  writeCoverageMatrixFiltersConfig,
} from "../src/server/stats/coverage-matrix-filters-store";

function runTest(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`[通过] ${name}`);
  } catch (error) {
    console.error(`[失败] ${name}`);
    throw error;
  }
}

function cleanupConfigFile(): void {
  const configPath = path.join(
    getLinkLibraryWorkspaceDir(),
    "matrix-filters.json",
  );
  if (fs.existsSync(configPath)) {
    fs.rmSync(configPath);
  }
}

function main(): void {
  console.log("初始化数据库...");
  initLinkDatabase(getLinkDatabase());
  cleanupConfigFile();

  runTest("默认读取为空配置", () => {
    const config = readCoverageMatrixFiltersConfig();
    assert.equal(config.platform, "");
    assert.equal(config.resourceYear, "");
    assert.equal(config.subject, "");
  });

  runTest("写入并读取矩阵筛选配置", () => {
    writeCoverageMatrixFiltersConfig({
      platform: "baidu",
      resourceYear: "2026",
      semester: "上册",
      schoolStage: "小学",
      subject: "数学",
      textbookEdition: "人教",
      resourceCategory: "practice",
    });

    const config = readCoverageMatrixFiltersConfig();
    assert.equal(config.platform, "baidu");
    assert.equal(config.resourceYear, "2026");
    assert.equal(config.semester, "上册");
    assert.equal(config.schoolStage, "小学");
    assert.equal(config.subject, "数学");
    assert.equal(config.textbookEdition, "人教");
    assert.equal(config.resourceCategory, "practice");
  });

  cleanupConfigFile();
  console.log("全部通过。");
}

try {
  main();
} finally {
  closeLinkDatabase();
}
