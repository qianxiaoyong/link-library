import { NextRequest } from "next/server";
import {
  handleRepositoryError,
  jsonFailure,
  jsonSuccess,
  jsonValidationError,
} from "@/server/api/route-utils";
import {
  listCoverageMatrixCellNotes,
  upsertCoverageMatrixCellNote,
} from "@/server/repositories/coverage-matrix-note-repository";
import { coverageMatrixCellNoteSchema } from "@/server/validation/coverage-matrix-note-schemas";
import { buildMatrixCellNoteKey } from "@/shared/stats/coverage-matrix/cell-note-key";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const notes = listCoverageMatrixCellNotes();
  const noteMap: Record<string, string> = {};

  for (const item of notes) {
    noteMap[
      buildMatrixCellNoteKey({
        bookTitle: item.bookTitle,
        resourceCategory: item.resourceCategory,
        subject: item.subject,
        textbookEdition: item.textbookEdition,
      })
    ] = item.note;
  }

  return jsonSuccess({ notes: noteMap });
}

export async function PUT(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonFailure("VALIDATION_ERROR", "请求体必须是合法 JSON", 400);
  }

  const parsed = coverageMatrixCellNoteSchema.safeParse(body);

  if (!parsed.success) {
    return jsonValidationError(parsed.error);
  }

  try {
    const item = upsertCoverageMatrixCellNote(parsed.data);
    const key = buildMatrixCellNoteKey({
      bookTitle: parsed.data.bookTitle,
      resourceCategory: parsed.data.resourceCategory,
      subject: parsed.data.subject,
      textbookEdition: parsed.data.textbookEdition,
    });

    return jsonSuccess({
      key,
      note: item?.note ?? "",
      deleted: !item,
    });
  } catch (error) {
    return handleRepositoryError(error);
  }
}
