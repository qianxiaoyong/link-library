import { z } from "zod";
import { LINK_PLATFORMS, RESOURCE_CATEGORIES } from "@/shared/constants/link-taxonomy";

export const coverageMatrixFiltersConfigSchema = z.object({
  platform: z.union([z.enum(LINK_PLATFORMS), z.literal("")]).default(""),
  resourceYear: z.string().default(""),
  semester: z.string().default(""),
  schoolStage: z.string().default(""),
  subject: z.string().default(""),
  textbookEdition: z.string().default(""),
  resourceCategory: z
    .union([z.enum(RESOURCE_CATEGORIES), z.literal("")])
    .default(""),
});

export type CoverageMatrixFiltersConfig = z.infer<
  typeof coverageMatrixFiltersConfigSchema
>;

export const defaultCoverageMatrixFiltersConfig: CoverageMatrixFiltersConfig = {
  platform: "",
  resourceYear: "",
  semester: "",
  schoolStage: "",
  subject: "",
  textbookEdition: "",
  resourceCategory: "",
};
