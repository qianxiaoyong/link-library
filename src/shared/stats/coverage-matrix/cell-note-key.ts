import type { ResourceCategory } from "@/shared/types/resource-link";

export type MatrixCellNoteIdentity = {
  bookTitle: string;
  resourceCategory: ResourceCategory | null;
  subject: string;
  textbookEdition: string;
};

const FIELD_SEPARATOR = "\u001f";

export function normalizeMatrixNoteCategory(
  resourceCategory: ResourceCategory | null,
): string {
  return resourceCategory ?? "";
}

export function buildMatrixCellNoteKey(
  identity: MatrixCellNoteIdentity,
): string {
  return [
    normalizeMatrixNoteCategory(identity.resourceCategory),
    identity.bookTitle,
    identity.subject,
    identity.textbookEdition,
  ].join(FIELD_SEPARATOR);
}

export function parseMatrixCellNoteKey(key: string): MatrixCellNoteIdentity | null {
  const parts = key.split(FIELD_SEPARATOR);
  if (parts.length !== 4) {
    return null;
  }

  const [categoryRaw, bookTitle, subject, textbookEdition] = parts;
  const resourceCategory =
    categoryRaw === ""
      ? null
      : (categoryRaw as ResourceCategory);

  return {
    bookTitle,
    resourceCategory,
    subject,
    textbookEdition,
  };
}
