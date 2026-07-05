import { getLinkDatabase } from "@/server/db/link-db";
import type { ResourceCategory } from "@/shared/types/resource-link";
import { normalizeMatrixNoteCategory } from "@/shared/stats/coverage-matrix/cell-note-key";

export type CoverageMatrixCellNoteRecord = {
  bookTitle: string;
  resourceCategory: ResourceCategory | null;
  subject: string;
  textbookEdition: string;
  note: string;
  updatedAt: string;
};

type CoverageMatrixCellNoteRow = {
  book_title: string;
  resource_category: string;
  subject: string;
  textbook_edition: string;
  note: string;
  updated_at: string;
};

function mapRow(row: CoverageMatrixCellNoteRow): CoverageMatrixCellNoteRecord {
  return {
    bookTitle: row.book_title,
    resourceCategory:
      row.resource_category === ""
        ? null
        : (row.resource_category as ResourceCategory),
    subject: row.subject,
    textbookEdition: row.textbook_edition,
    note: row.note,
    updatedAt: row.updated_at,
  };
}

export function listCoverageMatrixCellNotes(): CoverageMatrixCellNoteRecord[] {
  const db = getLinkDatabase();
  const rows = db
    .prepare(
      `SELECT book_title, resource_category, subject, textbook_edition, note, updated_at
       FROM coverage_matrix_cell_notes
       ORDER BY updated_at DESC`,
    )
    .all() as CoverageMatrixCellNoteRow[];

  return rows.map(mapRow);
}

export function upsertCoverageMatrixCellNote(input: {
  bookTitle: string;
  resourceCategory: ResourceCategory | null;
  subject: string;
  textbookEdition: string;
  note: string;
}): CoverageMatrixCellNoteRecord | null {
  const trimmedNote = input.note.trim();
  const db = getLinkDatabase();
  const resourceCategory = normalizeMatrixNoteCategory(input.resourceCategory);

  if (!trimmedNote) {
    db.prepare(
      `DELETE FROM coverage_matrix_cell_notes
       WHERE book_title = @bookTitle
         AND resource_category = @resourceCategory
         AND subject = @subject
         AND textbook_edition = @textbookEdition`,
    ).run({
      bookTitle: input.bookTitle,
      resourceCategory,
      subject: input.subject,
      textbookEdition: input.textbookEdition,
    });
    return null;
  }

  db.prepare(
    `INSERT INTO coverage_matrix_cell_notes (
       book_title, resource_category, subject, textbook_edition, note, updated_at
     ) VALUES (
       @bookTitle, @resourceCategory, @subject, @textbookEdition, @note, CURRENT_TIMESTAMP
     )
     ON CONFLICT(book_title, resource_category, subject, textbook_edition)
     DO UPDATE SET
       note = excluded.note,
       updated_at = CURRENT_TIMESTAMP`,
  ).run({
    bookTitle: input.bookTitle,
    resourceCategory,
    subject: input.subject,
    textbookEdition: input.textbookEdition,
    note: trimmedNote,
  });

  const row = db
    .prepare(
      `SELECT book_title, resource_category, subject, textbook_edition, note, updated_at
       FROM coverage_matrix_cell_notes
       WHERE book_title = @bookTitle
         AND resource_category = @resourceCategory
         AND subject = @subject
         AND textbook_edition = @textbookEdition`,
    )
    .get({
      bookTitle: input.bookTitle,
      resourceCategory,
      subject: input.subject,
      textbookEdition: input.textbookEdition,
    }) as CoverageMatrixCellNoteRow | undefined;

  return row ? mapRow(row) : null;
}
