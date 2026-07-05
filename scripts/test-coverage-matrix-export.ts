import assert from "node:assert/strict";
import ExcelJS from "exceljs";
import {
  buildCoverageMatrixExcelBuffer,
  buildCoverageMatrixExportTitle,
} from "../src/server/export/export-coverage-matrix-excel";
import { buildCoverageMatrix } from "../src/shared/stats/coverage-matrix";

function runTest(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve(fn())
    .then(() => console.log(`[通过] ${name}`))
    .catch((error) => {
      console.error(`[失败] ${name}`);
      throw error;
    });
}

async function main(): Promise<void> {
  await runTest("导出标题根据筛选条件生成", () => {
    assert.equal(
      buildCoverageMatrixExportTitle({
        resourceYear: "2025",
        semester: "秋上册",
      }),
      "2025秋上册年级覆盖矩阵",
    );
  });

  await runTest("Excel 包含标题、分类行与矩阵数据", async () => {
    const matrix = buildCoverageMatrix([
      {
        title: "2025《53天天练》",
        grade: "3",
        resourceCategory: "practice",
        subject: "数学",
        textbookEdition: "人教",
      },
      {
        title: "2025《53天天练》",
        grade: "4",
        resourceCategory: "practice",
        subject: "数学",
        textbookEdition: "人教",
      },
      {
        title: "2025《53天天练》",
        grade: "5",
        resourceCategory: "practice",
        subject: "数学",
        textbookEdition: "人教",
      },
      {
        title: "2025《53天天练》",
        grade: "6",
        resourceCategory: "practice",
        subject: "数学",
        textbookEdition: "人教",
      },
      {
        title: "2025《期末卷》",
        grade: "1",
        resourceCategory: "paper",
        subject: "语文",
        textbookEdition: null,
      },
    ]);

    const { buffer, fileName } = await buildCoverageMatrixExcelBuffer(matrix, {
      resourceYear: "2025",
      semester: "秋上册",
    });

    assert.match(fileName, /^2025-秋上册-覆盖矩阵-/);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
    const sheet = workbook.getWorksheet("覆盖矩阵");
    assert.ok(sheet);

    assert.equal(String(sheet.getCell("A1").value), "2025秋上册年级覆盖矩阵");
    assert.equal(String(sheet.getRow(2).getCell(1).value), "书名号");
    assert.equal(String(sheet.getRow(2).getCell(2).value), "数学·人教");
    assert.equal(String(sheet.getRow(2).getCell(3).value), "语文");

    assert.equal(String(sheet.getRow(3).getCell(1).value), "练习");
    assert.equal(String(sheet.getRow(4).getCell(1).value), "53天天练");
    assert.equal(String(sheet.getRow(4).getCell(2).value), "3-6");

    assert.equal(String(sheet.getRow(5).getCell(1).value), "试卷");
    assert.equal(String(sheet.getRow(6).getCell(1).value), "期末卷");
    assert.equal(String(sheet.getRow(6).getCell(3).value), "1");
  });

  console.log("\n全部覆盖矩阵导出测试通过。");
}

void main();
