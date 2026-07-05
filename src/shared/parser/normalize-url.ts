export type NormalizePanUrlResult = {
  platform: "baidu" | "quark" | null;
  rawUrl: string;
  url: string;
  accessCodeFromUrl: string | null;
};

function trimUrlTrailingPunctuation(url: string): string {
  return url.replace(/[)\]}>,，。；;！!？?]+$/, "");
}

export function normalizePanUrl(rawUrl: string): NormalizePanUrlResult {
  const trimmed = trimUrlTrailingPunctuation(rawUrl.trim());

  if (/pan\.baidu\.com\/s\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const accessCodeFromUrl = parsed.searchParams.get("pwd");
      parsed.search = "";
      parsed.hash = "";

      return {
        platform: "baidu",
        rawUrl: trimmed,
        url: parsed.toString(),
        accessCodeFromUrl,
      };
    } catch {
      return {
        platform: null,
        rawUrl: trimmed,
        url: trimmed,
        accessCodeFromUrl: null,
      };
    }
  }

  if (/pan\.quark\.cn\/s\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      parsed.search = "";
      parsed.hash = "";

      return {
        platform: "quark",
        rawUrl: trimmed,
        url: parsed.toString(),
        accessCodeFromUrl: null,
      };
    } catch {
      return {
        platform: null,
        rawUrl: trimmed,
        url: trimmed,
        accessCodeFromUrl: null,
      };
    }
  }

  return {
    platform: null,
    rawUrl: trimmed,
    url: trimmed,
    accessCodeFromUrl: null,
  };
}
