import assert from "node:assert/strict";
import { sortMatrixCellLinkItems } from "../src/components/stats/matrix/matrix-cell-links-sort";
import type { ResourceLink } from "../src/shared/types/resource-link";

function makeItem(
  partial: Pick<ResourceLink, "id" | "platform" | "grade" | "title">,
): ResourceLink {
  return {
    rawUrl: "https://example.com",
    url: "https://example.com",
    accessCode: null,
    resourceCategory: "practice",
    description: null,
    schoolStage: null,
    semester: null,
    subject: "数学",
    resourceYear: null,
    textbookEdition: "人教版",
    status: "normal",
    favorite: false,
    sourceText: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

function runTest(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`[通过] ${name}`);
  } catch (error) {
    console.error(`[失败] ${name}`);
    throw error;
  }
}

runTest("百度优先于夸克，同年台内年级升序，多值年级靠后", () => {
  const sorted = sortMatrixCellLinkItems([
    makeItem({ id: "1", platform: "quark", grade: "2", title: "夸克2" }),
    makeItem({ id: "2", platform: "baidu", grade: "1-6", title: "百度多值" }),
    makeItem({ id: "3", platform: "baidu", grade: "6", title: "百度6" }),
    makeItem({ id: "4", platform: "baidu", grade: "3,4", title: "百度3,4" }),
    makeItem({ id: "5", platform: "baidu", grade: "1", title: "百度1" }),
    makeItem({ id: "6", platform: "quark", grade: "1", title: "夸克1" }),
  ]);

  assert.deepEqual(
    sorted.map((item) => item.id),
    ["5", "3", "2", "4", "6", "1"],
  );
});

console.log("\n矩阵单元格列表排序测试通过。");
