import { z } from "zod";
import {
  LINK_PLATFORMS,
  RESOURCE_CATEGORIES,
} from "@/shared/constants/link-taxonomy";

export const linkFiltersConfigSchema = z.object({
  platform: z.union([z.enum(LINK_PLATFORMS), z.literal("")]).optional(),
  status: z
    .union([z.enum(["normal", "invalid"]), z.literal("all")])
    .default("normal"),
  favorite: z.boolean().optional(),
  resourceCategory: z
    .union([z.enum(RESOURCE_CATEGORIES), z.literal("")])
    .optional(),
  schoolStage: z.string().default(""),
  grade: z.string().default(""),
  semester: z.string().default(""),
  subject: z.string().default(""),
  resourceYear: z.string().default(""),
  textbookEdition: z.string().default(""),
});

export type LinkFiltersConfig = z.infer<typeof linkFiltersConfigSchema>;

export const defaultLinkFiltersConfig: LinkFiltersConfig = {
  status: "normal",
  schoolStage: "",
  grade: "",
  semester: "",
  subject: "",
  resourceYear: "",
  textbookEdition: "",
};
