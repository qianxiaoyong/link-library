import assert from "node:assert/strict";
import {
  formatGradeCoverage,
  MIN_CONSECUTIVE_FOR_RANGE,
  parseGradeSortKey,
} from "../src/shared/grade-display";

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
  runTest("别名排序键：新初二等同初二", () => {
    assert.equal(parseGradeSortKey("新初二"), 8);
    assert.equal(parseGradeSortKey("初二"), 8);
    assert.equal(parseGradeSortKey("预二"), 8);
  });

  runTest("4 个连续数字合并为区间", () => {
    assert.equal(formatGradeCoverage(["1", "2", "3", "4"]), "1-4");
    assert.equal(formatGradeCoverage(["3", "4", "5", "6"]), "3-6");
  });

  runTest("不足 4 个连续数字不合并", () => {
    assert.equal(formatGradeCoverage(["1", "2", "3"]), "1,2,3");
    assert.equal(formatGradeCoverage(["1", "4", "5", "6"]), "1,4,5,6");
  });

  runTest("用户示例：1,3,4,5,6 => 1,3-6", () => {
    assert.equal(formatGradeCoverage(["1", "3", "4", "5", "6"]), "1,3-6");
  });

  runTest("多段连续：1,2,5,6,7,8 => 1,2,5-8", () => {
    assert.equal(formatGradeCoverage(["1", "2", "5", "6", "7", "8"]), "1,2,5-8");
  });

  runTest("中文年级连续段合并", () => {
    assert.equal(
      formatGradeCoverage(["三年级", "四年级", "五年级", "六年级"]),
      "三年级-六年级",
    );
  });

  runTest("别名与标准名去重后合并", () => {
    assert.equal(
      formatGradeCoverage(["初二", "新初二", "初三", "高一", "高二"]),
      "初二-高二",
    );
    assert.equal(formatGradeCoverage(["初二", "新初二", "高一"]), "初二,高一");
  });

  runTest("无法识别排序键的年级单独列出", () => {
    assert.equal(formatGradeCoverage(["1", "2", "幼升小"]), "1,2,幼升小");
  });

  runTest("空年级显示未填计数", () => {
    assert.equal(formatGradeCoverage(["1", null, "", "未填"]), "1,未填(3)");
  });

  runTest("常量：至少 4 个才算连续段", () => {
    assert.equal(MIN_CONSECUTIVE_FOR_RANGE, 4);
  });

  console.log("\n全部年级展示算法测试通过。");
}

main();
