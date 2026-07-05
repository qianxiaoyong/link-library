import { z } from "zod";
import {
  LINK_PLATFORMS,
  LINK_STATUSES,
  RESOURCE_CATEGORIES,
} from "@/shared/constants/link-taxonomy";

const nullableString = z.string().nullable().optional();
const resourceCategorySchema = z.enum(RESOURCE_CATEGORIES).nullable().optional();
const linkStatusSchema = z.enum(LINK_STATUSES).optional();

export const createResourceLinkSchema = z.object({
  platform: z.enum(LINK_PLATFORMS),
  title: z.string().min(1),
  rawUrl: z.string().min(1),
  url: z.string().min(1),
  accessCode: nullableString,
  resourceCategory: resourceCategorySchema,
  description: nullableString,
  schoolStage: nullableString,
  grade: nullableString,
  semester: nullableString,
  subject: nullableString,
  resourceYear: nullableString,
  textbookEdition: nullableString,
  status: linkStatusSchema.default("normal"),
  favorite: z.boolean().optional().default(false),
  sourceText: nullableString,
});

export const updateResourceLinkSchema = z
  .object({
    title: z.string().min(1).optional(),
    rawUrl: z.string().min(1).optional(),
    url: z.string().min(1).optional(),
    accessCode: nullableString,
    resourceCategory: resourceCategorySchema,
    description: nullableString,
    schoolStage: nullableString,
    grade: nullableString,
    semester: nullableString,
    subject: nullableString,
    resourceYear: nullableString,
    textbookEdition: nullableString,
    status: linkStatusSchema,
    favorite: z.boolean().optional(),
    sourceText: nullableString,
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "至少需要一个可更新字段",
  });

export const importParseSchema = z.object({
  text: z.string(),
});

export const parsedLinkItemSchema = z.object({
  platform: z.enum(LINK_PLATFORMS),
  title: z.string().min(1),
  rawUrl: z.string().min(1),
  url: z.string().min(1),
  accessCode: z.string().nullable(),
  sourceText: z.string(),
  warnings: z.array(z.string()),
});

export const importApplyDefaultsSchema = z
  .object({
    resourceCategory: resourceCategorySchema,
    description: nullableString,
    schoolStage: nullableString,
    grade: nullableString,
    semester: nullableString,
    subject: nullableString,
    resourceYear: nullableString,
    textbookEdition: nullableString,
    status: linkStatusSchema,
    favorite: z.boolean().optional(),
  })
  .optional();

export const importApplySchema = z.object({
  items: z.array(parsedLinkItemSchema).min(1),
  defaults: importApplyDefaultsSchema,
});

export const importDefaultsConfigSchema = z.object({
  title: z.string().default(""),
  resourceCategory: z
    .union([z.enum(RESOURCE_CATEGORIES), z.literal("")])
    .default(""),
  description: z.string().default(""),
  schoolStage: z.string().default(""),
  grade: z.string().default(""),
  semester: z.string().default(""),
  subject: z.string().default(""),
  resourceYear: z.string().default(""),
  textbookEdition: z.string().default(""),
  status: linkStatusSchema.default("normal"),
  favorite: z.boolean().default(false),
});

export const listResourceLinksQuerySchema = z.object({
  q: z.string().optional(),
  platform: z.enum(LINK_PLATFORMS).optional(),
  status: z.enum([...LINK_STATUSES, "all"]).optional().default("normal"),
  favorite: z
    .enum(["true", "false"])
    .optional()
    .transform((value) =>
      value === undefined ? undefined : value === "true",
    ),
  resourceCategory: z.enum(RESOURCE_CATEGORIES).optional(),
  schoolStage: z.string().optional(),
  grade: z.string().optional(),
  semester: z.string().optional(),
  subject: z.string().optional(),
  resourceYear: z.string().optional(),
  textbookEdition: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type CreateResourceLinkBody = z.infer<typeof createResourceLinkSchema>;
export type UpdateResourceLinkBody = z.infer<typeof updateResourceLinkSchema>;
export type ImportApplyBody = z.infer<typeof importApplySchema>;
export type ImportDefaultsConfigBody = z.infer<typeof importDefaultsConfigSchema>;
export type ListResourceLinksQuery = z.infer<typeof listResourceLinksQuerySchema>;

export const exportExcelQuerySchema = z.object({
  scope: z.enum(["filtered", "all"]).default("filtered"),
  q: z.string().optional(),
  platform: z.enum(LINK_PLATFORMS).optional(),
  status: z.enum([...LINK_STATUSES, "all"]).optional().default("normal"),
  favorite: z
    .enum(["true", "false"])
    .optional()
    .transform((value) =>
      value === undefined ? undefined : value === "true",
    ),
  resourceCategory: z.enum(RESOURCE_CATEGORIES).optional(),
  schoolStage: z.string().optional(),
  grade: z.string().optional(),
  semester: z.string().optional(),
  subject: z.string().optional(),
  resourceYear: z.string().optional(),
  textbookEdition: z.string().optional(),
});

export type ExportExcelQuery = z.infer<typeof exportExcelQuerySchema>;
