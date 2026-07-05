import type { LinkPlatform } from "@/shared/types/resource-link";
import type { ParseLinkTextResult, ParsedLinkItem } from "./link-parser-types";
import { normalizePanUrl } from "./normalize-url";
import {
  findBaiduBlockEnd,
  findBaiduBlockStart,
  parseBaiduBlock,
} from "./parse-baidu";
import {
  findQuarkBlockEnd,
  findQuarkBlockStart,
  parseQuarkBlock,
} from "./parse-quark";

const PAN_URL_PATTERN =
  /https?:\/\/pan\.(?:baidu\.com|quark\.cn)\/s\/[^\s<>"'\u4e00-\u9fff]+/gi;

type LinkMatch = {
  platform: LinkPlatform;
  rawUrl: string;
  index: number;
  length: number;
};

function trimUrlTrailingPunctuation(url: string): string {
  return url.replace(/[)\]}>,，。；;！!？?]+$/, "");
}

function findAllLinks(input: string): LinkMatch[] {
  const matches: LinkMatch[] = [];

  for (const match of input.matchAll(PAN_URL_PATTERN)) {
    const rawUrl = trimUrlTrailingPunctuation(match[0]);
    const normalized = normalizePanUrl(rawUrl);

    if (!normalized.platform) {
      continue;
    }

    matches.push({
      platform: normalized.platform,
      rawUrl,
      index: match.index ?? 0,
      length: match[0].length,
    });
  }

  return matches;
}

function getNextBlockStart(
  text: string,
  linkMatches: LinkMatch[],
  currentIndex: number,
): number | null {
  for (let i = currentIndex + 1; i < linkMatches.length; i += 1) {
    const next = linkMatches[i];
    if (next.platform === "baidu") {
      return findBaiduBlockStart(text, next.index);
    }
    return findQuarkBlockStart(text, next.index);
  }

  return null;
}

function extractSourceText(
  text: string,
  linkMatch: LinkMatch,
  linkMatches: LinkMatch[],
  matchIndex: number,
): string {
  const nextBlockStart = getNextBlockStart(text, linkMatches, matchIndex);

  if (linkMatch.platform === "baidu") {
    const blockStart = findBaiduBlockStart(text, linkMatch.index);
    const blockEnd = findBaiduBlockEnd(text, linkMatch.index, nextBlockStart);
    return text.slice(blockStart, blockEnd).trim();
  }

  const blockStart = findQuarkBlockStart(text, linkMatch.index);
  const blockEnd = findQuarkBlockEnd(text, linkMatch.index, nextBlockStart);
  return text.slice(blockStart, blockEnd).trim();
}

function buildSummary(items: ParsedLinkItem[], failureCount: number) {
  const baiduCount = items.filter((item) => item.platform === "baidu").length;
  const quarkCount = items.filter((item) => item.platform === "quark").length;

  return {
    totalItems: items.length,
    baiduCount,
    quarkCount,
    failureCount,
  };
}

export function parseLinkText(input: string): ParseLinkTextResult {
  const text = input.trim();

  if (!text) {
    return {
      items: [],
      failures: [],
      summary: {
        totalItems: 0,
        baiduCount: 0,
        quarkCount: 0,
        failureCount: 0,
      },
    };
  }

  const linkMatches = findAllLinks(text);
  const items: ParsedLinkItem[] = [];
  const failures: ParseLinkTextResult["failures"] = [];

  for (let i = 0; i < linkMatches.length; i += 1) {
    const linkMatch = linkMatches[i];
    const sourceText = extractSourceText(text, linkMatch, linkMatches, i);

    try {
      const item =
        linkMatch.platform === "baidu"
          ? parseBaiduBlock(sourceText, linkMatch.rawUrl)
          : parseQuarkBlock(sourceText, linkMatch.rawUrl);

      items.push(item);
    } catch (error) {
      failures.push({
        sourceText,
        reason: error instanceof Error ? error.message : "解析失败",
      });
    }
  }

  return {
    items,
    failures,
    summary: buildSummary(items, failures.length),
  };
}
