import { z } from "zod";
import { RESOURCE_CATEGORIES } from "@/shared/constants/link-taxonomy";

export const titleBracketStatsQuerySchema = z.object({
  resourceYear: z.string().optional(),
  subject: z.string().optional(),
  textbookEdition: z.string().optional(),
  resourceCategory: z.enum(RESOURCE_CATEGORIES).optional(),
});

export type TitleBracketStatsQuery = z.infer<
  typeof titleBracketStatsQuerySchema
>;
