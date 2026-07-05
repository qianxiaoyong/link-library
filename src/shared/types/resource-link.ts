import type {
  LINK_PLATFORMS,
  LINK_STATUSES,
  RESOURCE_CATEGORIES,
} from "@/shared/constants/link-taxonomy";

export type LinkPlatform = (typeof LINK_PLATFORMS)[number];
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];
export type LinkStatus = (typeof LINK_STATUSES)[number];

export type ResourceLink = {
  id: string;
  platform: LinkPlatform;
  title: string;
  rawUrl: string;
  url: string;
  accessCode: string | null;
  resourceCategory: ResourceCategory | null;
  description: string | null;
  schoolStage: string | null;
  grade: string | null;
  semester: string | null;
  subject: string | null;
  resourceYear: string | null;
  status: LinkStatus;
  favorite: boolean;
  sourceText: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ResourceLinkInput = Omit<
  ResourceLink,
  "id" | "createdAt" | "updatedAt"
>;

export type CreateResourceLinkInput = ResourceLinkInput;

export type UpdateResourceLinkInput = Partial<
  Pick<
    ResourceLink,
    | "title"
    | "rawUrl"
    | "url"
    | "accessCode"
    | "resourceCategory"
    | "description"
    | "schoolStage"
    | "grade"
    | "semester"
    | "subject"
    | "resourceYear"
    | "status"
    | "favorite"
    | "sourceText"
  >
>;
