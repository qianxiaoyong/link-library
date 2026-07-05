import { z } from "zod";
import { RESOURCE_CATEGORIES } from "@/shared/constants/link-taxonomy";

export const coverageMatrixCellNoteSchema = z.object({
  bookTitle: z.string().trim().min(1, "书名号不能为空"),
  resourceCategory: z.enum(RESOURCE_CATEGORIES).nullable(),
  subject: z.string().trim().min(1, "科目不能为空"),
  textbookEdition: z.string().trim().min(1, "教材版本不能为空"),
  note: z.string().max(500, "备注最多 500 字").optional().default(""),
});

export type CoverageMatrixCellNoteInput = z.infer<
  typeof coverageMatrixCellNoteSchema
>;
