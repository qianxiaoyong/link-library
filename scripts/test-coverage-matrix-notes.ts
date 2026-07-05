import assert from "node:assert/strict";
import { initLinkDatabase } from "../src/server/db/init-link-db";
import { closeLinkDatabase, getLinkDatabase } from "../src/server/db/link-db";
import {
  listCoverageMatrixCellNotes,
  upsertCoverageMatrixCellNote,
} from "../src/server/repositories/coverage-matrix-note-repository";
import {
  buildMatrixCellNoteKey,
  parseMatrixCellNoteKey,
} from "../src/shared/stats/coverage-matrix/cell-note-key";

const TEST_BOOK = "[NOTE-TEST] 典中点";

function runTest(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`[通过] ${name}`);
  } catch (error) {
    console.error(`[失败] ${name}`);
    throw error;
  }
}

function cleanupTestNotes(): void {
  const db = getLinkDatabase();
  db.prepare(
    `DELETE FROM coverage_matrix_cell_notes WHERE book_title LIKE '[NOTE-TEST]%'`,
  ).run();
}

function main(): void {
  console.log("初始化数据库...");
  initLinkDatabase(getLinkDatabase());
  cleanupTestNotes();

  runTest("cell-note-key 编解码", () => {
    const identity = {
      bookTitle: TEST_BOOK,
      resourceCategory: "practice" as const,
      subject: "数学",
      textbookEdition: "苏教",
    };
    const key = buildMatrixCellNoteKey(identity);
    const parsed = parseMatrixCellNoteKey(key);
    assert.deepEqual(parsed, identity);
  });

  runTest("备注 upsert / list / 清除", () => {
    const saved = upsertCoverageMatrixCellNote({
      bookTitle: TEST_BOOK,
      resourceCategory: "practice",
      subject: "数学",
      textbookEdition: "苏教",
      note: "缺 3 年级上册",
    });

    assert.ok(saved);
    assert.equal(saved?.note, "缺 3 年级上册");

    const notes = listCoverageMatrixCellNotes();
    assert.ok(
      notes.some(
        (item) =>
          item.bookTitle === TEST_BOOK &&
          item.subject === "数学" &&
          item.textbookEdition === "苏教" &&
          item.note === "缺 3 年级上册",
      ),
    );

    const cleared = upsertCoverageMatrixCellNote({
      bookTitle: TEST_BOOK,
      resourceCategory: "practice",
      subject: "数学",
      textbookEdition: "苏教",
      note: "   ",
    });
    assert.equal(cleared, null);

    const afterClear = listCoverageMatrixCellNotes().filter(
      (item) => item.bookTitle === TEST_BOOK,
    );
    assert.equal(afterClear.length, 0);
  });

  runTest("未分类备注使用空分类键", () => {
    upsertCoverageMatrixCellNote({
      bookTitle: TEST_BOOK,
      resourceCategory: null,
      subject: "语文",
      textbookEdition: "未填",
      note: "待补",
    });

    const key = buildMatrixCellNoteKey({
      bookTitle: TEST_BOOK,
      resourceCategory: null,
      subject: "语文",
      textbookEdition: "未填",
    });
    assert.match(key, /^\u001f/);

    const notes = listCoverageMatrixCellNotes();
    assert.ok(notes.some((item) => item.resourceCategory === null && item.note === "待补"));
  });

  cleanupTestNotes();
  console.log("全部通过。");
}

try {
  main();
} finally {
  closeLinkDatabase();
}
