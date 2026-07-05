import { normalizePanUrl } from "./normalize-url";
import type { ParsedLinkItem } from "./link-parser-types";

const BAIDU_BLOCK_START =
  /(?:【[^】]*】)?(?:通过百度网盘分享的文件|通过网盘分享的文件)/g;

const BAIDU_TITLE_PATTERN = /分享的文件[：:]\s*(.+?)(?:\r?\n|$)/;

const BAIDU_ACCESS_CODE_PATTERN = /提取码[：:]\s*(\S+)/;

export function findBaiduBlockStart(text: string, linkIndex: number): number {
  let lastStart = 0;

  for (const match of text.matchAll(BAIDU_BLOCK_START)) {
    const index = match.index ?? 0;
    if (index < linkIndex) {
      lastStart = index;
    } else {
      break;
    }
  }

  return lastStart;
}

export function findBaiduBlockEnd(
  text: string,
  linkIndex: number,
  nextBlockStart: number | null,
): number {
  const afterLink = text.slice(linkIndex);
  const accessCodeMatch = afterLink.match(BAIDU_ACCESS_CODE_PATTERN);

  if (accessCodeMatch?.index !== undefined) {
    const endFromAccessCode =
      linkIndex + accessCodeMatch.index + accessCodeMatch[0].length;
    if (nextBlockStart === null || endFromAccessCode < nextBlockStart) {
      return endFromAccessCode;
    }
  }

  if (nextBlockStart !== null) {
    return nextBlockStart;
  }

  return text.length;
}

export function extractBaiduTitle(text: string): string | null {
  const match = text.match(BAIDU_TITLE_PATTERN);
  if (!match?.[1]) {
    return null;
  }

  return match[1].trim();
}

export function extractBaiduAccessCode(
  text: string,
  accessCodeFromUrl: string | null,
): string | null {
  const match = text.match(BAIDU_ACCESS_CODE_PATTERN);
  if (match?.[1]) {
    return match[1].trim();
  }

  return accessCodeFromUrl;
}

export function parseBaiduBlock(sourceText: string, rawUrl: string): ParsedLinkItem {
  const normalized = normalizePanUrl(rawUrl);
  const warnings: string[] = [];

  if (normalized.platform !== "baidu") {
    warnings.push("无法识别为有效的百度网盘链接");
  }

  let title = extractBaiduTitle(sourceText);
  if (!title) {
    title = "未命名百度资料";
    warnings.push("未能提取标题，已使用默认标题");
  }

  const accessCode = extractBaiduAccessCode(
    sourceText,
    normalized.accessCodeFromUrl,
  );

  return {
    platform: "baidu",
    title,
    rawUrl: normalized.rawUrl,
    url: normalized.url,
    accessCode,
    sourceText,
    warnings,
  };
}
