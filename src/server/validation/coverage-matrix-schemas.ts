import { z } from "zod";
import { LINK_PLATFORMS, RESOURCE_CATEGORIES } from "@/shared/constants/link-taxonomy";

export const coverageMatrixQuerySchema = z.object({
  platform: z.enum(LINK_PLATFORMS).optional(),
  resourceYear: z.string().optional(),
  semester: z.string().optional(),
  schoolStage: z.string().optional(),
  subject: z.string().optional(),
  textbookEdition: z.string().optional(),
  resourceCategory: z.enum(RESOURCE_CATEGORIES).optional(),
});

export type CoverageMatrixQuery = z.infer<typeof coverageMatrixQuerySchema>;
