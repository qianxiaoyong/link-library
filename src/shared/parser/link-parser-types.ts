import type { LinkPlatform } from "@/shared/types/resource-link";

export type ParsedLinkItem = {
  platform: LinkPlatform;
  title: string;
  rawUrl: string;
  url: string;
  accessCode: string | null;
  sourceText: string;
  warnings: string[];
};

export type ParseLinkTextResult = {
  items: ParsedLinkItem[];
  failures: Array<{
    sourceText: string;
    reason: string;
  }>;
  summary: {
    totalItems: number;
    baiduCount: number;
    quarkCount: number;
    failureCount: number;
  };
};
