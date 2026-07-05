/**
 * 阶段 4B 批量导入 UI 流程测试（HTTP 层）
 * 需要 dev 或 start 服务运行在 BASE_URL。
 */

import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const TEST_PREFIX = "[TEST-IMPORT]";

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

type ParsedLinkItem = {
  platform: string;
  title: string;
  rawUrl: string;
  url: string;
  accessCode: string | null;
  sourceText: string;
  warnings: string[];
};

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<{ status: number; body: ApiEnvelope<T> }> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body = (await response.json()) as ApiEnvelope<T>;
  return { status: response.status, body };
}

function runTest(name: string, fn: () => Promise<void>): Promise<void> {
  return fn()
    .then(() => console.log(`[通过] ${name}`))
    .catch((error) => {
      console.error(`[失败] ${name}`);
      throw error;
    });
}

const BAIDU_SINGLE = `通过网盘分享的文件：${TEST_PREFIX} 26秋待整理
链接: https://pan.baidu.com/s/test-import-baidu-001?pwd=gr89 提取码: gr89 
--来自百度网盘超级会员v6的分享`;

const QUARK_BATCH = `我用夸克网盘分享了「${TEST_PREFIX} 🍎⭐️小学英语3-6年级上册《优秀英语作文范文》」，点击链接即可保存。打开「夸克APP」，无需下载在线播放视频，畅享原画5倍速，支持电视投屏。
链接：https://pan.quark.cn/s/test-import-quark-001

我用夸克网盘分享了「${TEST_PREFIX} 🍎⭐️小学语文1-6年级上册《期末复习专项合集》」，点击链接即可保存。打开「夸克APP」，无需下载在线播放视频，畅享原画5倍速，支持电视投屏。
链接：https://pan.quark.cn/s/test-import-quark-002

我用夸克网盘分享了「${TEST_PREFIX} 🍎⭐️小学数学1-6年级上册《期末复习专项合集》」，点击链接即可保存。打开「夸克APP」，无需下载在线播放视频，畅享原画5倍速，支持电视投屏。
链接：https://pan.quark.cn/s/test-import-quark-003`;

async function cleanup() {
  const list = await request<{ items: Array<{ id: string }> }>(
    `/api/links?status=all&q=${encodeURIComponent(TEST_PREFIX)}&limit=200`,
  );
  if (!list.body.ok) return;
  for (const item of list.body.data.items) {
    await request(`/api/links/${item.id}`, { method: "DELETE" });
  }
}

async function main() {
  console.log(`使用 BASE_URL=${BASE_URL}\n`);
  await cleanup();

  await runTest("1. 空输入 parse 返回空结果", async () => {
    const result = await request<{
      items: ParsedLinkItem[];
      summary: { totalItems: number };
    }>("/api/import/parse", {
      method: "POST",
      body: JSON.stringify({ text: "" }),
    });
    assert.equal(result.status, 200);
    assert.ok(result.body.ok);
    if (result.body.ok) {
      assert.equal(result.body.data.summary.totalItems, 0);
    }
  });

  await runTest("2. 百度单条 parse + apply", async () => {
    const parsed = await request<{
      items: ParsedLinkItem[];
      summary: { totalItems: number; baiduCount: number };
    }>("/api/import/parse", {
      method: "POST",
      body: JSON.stringify({ text: BAIDU_SINGLE }),
    });
    assert.ok(parsed.body.ok);
    if (!parsed.body.ok) return;

    assert.equal(parsed.body.data.summary.totalItems, 1);
    assert.equal(parsed.body.data.summary.baiduCount, 1);
    assert.match(parsed.body.data.items[0].rawUrl, /\?pwd=gr89/);
    assert.doesNotMatch(parsed.body.data.items[0].url, /\?pwd=gr89/);

    const applied = await request<{
      summary: { created: number; skippedDuplicates: number; failures: number };
    }>("/api/import/apply", {
      method: "POST",
      body: JSON.stringify({
        items: parsed.body.data.items,
        defaults: {
          resourceCategory: "practice",
          schoolStage: "小学",
          grade: "三年级",
          semester: "上学期",
          subject: "数学",
          resourceYear: "2026秋",
        },
      }),
    });
    assert.ok(applied.body.ok);
    if (applied.body.ok) {
      assert.equal(applied.body.data.summary.created, 1);
    }
  });

  await runTest("3. 夸克批量 parse + apply", async () => {
    const parsed = await request<{
      items: ParsedLinkItem[];
      summary: { totalItems: number; quarkCount: number };
    }>("/api/import/parse", {
      method: "POST",
      body: JSON.stringify({ text: QUARK_BATCH }),
    });
    assert.ok(parsed.body.ok);
    if (!parsed.body.ok) return;

    assert.equal(parsed.body.data.summary.totalItems, 3);
    assert.equal(parsed.body.data.summary.quarkCount, 3);
    assert.ok(parsed.body.data.items.every((item) => item.title.includes("🍎⭐️")));

    const applied = await request<{
      summary: { created: number };
    }>("/api/import/apply", {
      method: "POST",
      body: JSON.stringify({
        items: parsed.body.data.items,
        defaults: {
          resourceCategory: "special",
          schoolStage: "小学",
          subject: "英语",
          resourceYear: "2026秋",
        },
      }),
    });
    assert.ok(applied.body.ok);
    if (applied.body.ok) {
      assert.equal(applied.body.data.summary.created, 3);
    }
  });

  await runTest("4. 重复导入应全部跳过", async () => {
    const parsed = await request<{ items: ParsedLinkItem[] }>("/api/import/parse", {
      method: "POST",
      body: JSON.stringify({ text: BAIDU_SINGLE }),
    });
    assert.ok(parsed.body.ok);
    if (!parsed.body.ok) return;

    const applied = await request<{
      summary: { created: number; skippedDuplicates: number; failures: number };
    }>("/api/import/apply", {
      method: "POST",
      body: JSON.stringify({ items: parsed.body.data.items }),
    });
    assert.ok(applied.body.ok);
    if (applied.body.ok) {
      assert.equal(applied.body.data.summary.created, 0);
      assert.equal(applied.body.data.summary.skippedDuplicates, 1);
      assert.equal(applied.body.data.summary.failures, 0);
    }
  });

  await runTest("5. 移除预览项后只导入部分", async () => {
    const parsed = await request<{ items: ParsedLinkItem[] }>("/api/import/parse", {
      method: "POST",
      body: JSON.stringify({ text: QUARK_BATCH }),
    });
    assert.ok(parsed.body.ok);
    if (!parsed.body.ok) return;

    const partialItems = parsed.body.data.items.slice(1);
    const applied = await request<{
      summary: { created: number; skippedDuplicates: number };
    }>("/api/import/apply", {
      method: "POST",
      body: JSON.stringify({ items: partialItems }),
    });
    assert.ok(applied.body.ok);
    if (applied.body.ok) {
      assert.equal(applied.body.data.summary.created, 0);
      assert.equal(applied.body.data.summary.skippedDuplicates, 2);
    }
  });

  await cleanup();
  console.log("\n全部批量导入流程测试通过。");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
