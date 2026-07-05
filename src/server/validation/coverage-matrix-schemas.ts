import { z } from "zod";
import { RESOURCE_CATEGORIES } from "@/shared/constants/link-taxonomy";

export const coverageMatrixQuerySchema = z.object({
  resourceYear: z.string().optional(),
  semester: z.string().optional(),
  schoolStage: z.string().optional(),
  subject: z.string().optional(),
  textbookEdition: z.string().optional(),
  resourceCategory: z.enum(RESOURCE_CATEGORIES).optional(),
});

export type CoverageMatrixQuery = z.infer<typeof coverageMatrixQuerySchema>;
