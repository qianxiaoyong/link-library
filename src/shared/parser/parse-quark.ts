import { normalizePanUrl } from "./normalize-url";
import type { ParsedLinkItem } from "./link-parser-types";

const QUARK_BLOCK_START = /我用夸克网盘分享了/g;

const QUARK_TITLE_PATTERN = /我用夸克网盘分享了「(.+?)」/;

export function findQuarkBlockStart(text: string, linkIndex: number): number {
  let lastStart = 0;

  for (const match of text.matchAll(QUARK_BLOCK_START)) {
    const index = match.index ?? 0;
    if (index < linkIndex) {
      lastStart = index;
    } else {
      break;
    }
  }

  return lastStart;
}

export function findQuarkBlockEnd(
  text: string,
  linkIndex: number,
  nextBlockStart: number | null,
): number {
  const afterLink = text.slice(linkIndex);
  const linkLineMatch = afterLink.match(/\r?\n/);

  let end = text.length;
  if (linkLineMatch?.index !== undefined) {
    end = linkIndex + linkLineMatch.index + linkLineMatch[0].length;
  }

  if (nextBlockStart !== null && nextBlockStart < end) {
    return nextBlockStart;
  }

  return end;
}

export function extractQuarkTitle(text: string): string | null {
  const match = text.match(QUARK_TITLE_PATTERN);
  if (!match?.[1]) {
    return null;
  }

  return match[1];
}

export function parseQuarkBlock(sourceText: string, rawUrl: string): ParsedLinkItem {
  const normalized = normalizePanUrl(rawUrl);
  const warnings: string[] = [];

  if (normalized.platform !== "quark") {
    warnings.push("无法识别为有效的夸克网盘链接");
  }

  let title = extractQuarkTitle(sourceText);
  if (!title) {
    title = "未命名夸克资料";
    warnings.push("未能提取标题，已使用默认标题");
  }

  return {
    platform: "quark",
    title,
    rawUrl: normalized.rawUrl,
    url: normalized.url,
    accessCode: null,
    sourceText,
    warnings,
  };
}
