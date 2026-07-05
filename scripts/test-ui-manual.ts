/**
 * 阶段 4A 手动测试脚本：通过 HTTP API 模拟 UI 操作流程。
 * 需要 dev 或 start 服务运行在 BASE_URL。
 */

import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const TEST_PREFIX = "[TEST-UI]";

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

type ResourceLink = {
  id: string;
  title: string;
  platform: string;
  status: string;
  favorite: boolean;
  subject: string | null;
  resourceYear: string | null;
  description: string | null;
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

async function cleanup() {
  const list = await request<{ items: ResourceLink[]; total: number }>(
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

  let baiduId = "";
  let quarkId = "";

  await runTest("1. 列表默认 status=normal", async () => {
    const result = await request<{
      items: ResourceLink[];
      total: number;
      limit: number;
      offset: number;
    }>("/api/links");

    assert.equal(result.status, 200);
    assert.ok(result.body.ok);
    if (result.body.ok) {
      assert.ok(
        result.body.data.items.every((item) => item.status === "normal"),
      );
    }
  });

  await runTest("2. 新增百度资料", async () => {
    const result = await request<{ item: ResourceLink }>("/api/links", {
      method: "POST",
      body: JSON.stringify({
        platform: "baidu",
        title: `${TEST_PREFIX} 百度资料`,
        rawUrl: "https://pan.baidu.com/s/test-ui-001?pwd=abcd",
        url: "https://pan.baidu.com/s/test-ui-001",
        accessCode: "abcd",
        resourceCategory: "practice",
        schoolStage: "小学",
        grade: "三年级",
        semester: "上学期",
        subject: "数学",
        resourceYear: "2026秋",
      }),
    });

    assert.equal(result.status, 201);
    assert.ok(result.body.ok);
    if (result.body.ok) {
      baiduId = result.body.data.item.id;
      assert.equal(result.body.data.item.title, `${TEST_PREFIX} 百度资料`);
    }
  });

  await runTest("3. 新增夸克资料", async () => {
    const result = await request<{ item: ResourceLink }>("/api/links", {
      method: "POST",
      body: JSON.stringify({
        platform: "quark",
        title: `${TEST_PREFIX} 夸克资料`,
        rawUrl: "https://pan.quark.cn/s/test-ui-002",
        url: "https://pan.quark.cn/s/test-ui-002",
        resourceCategory: "special",
        subject: "英语",
      }),
    });

    assert.equal(result.status, 201);
    assert.ok(result.body.ok);
    if (result.body.ok) {
      quarkId = result.body.data.item.id;
    }
  });

  await runTest("4. 重复链接返回 DUPLICATE_LINK", async () => {
    const result = await request<{ item: ResourceLink }>("/api/links", {
      method: "POST",
      body: JSON.stringify({
        platform: "baidu",
        title: `${TEST_PREFIX} 重复资料`,
        rawUrl: "https://pan.baidu.com/s/test-ui-001?pwd=abcd",
        url: "https://pan.baidu.com/s/test-ui-001",
      }),
    });

    assert.equal(result.status, 409);
    assert.ok(!result.body.ok);
    if (!result.body.ok) {
      assert.equal(result.body.error.code, "DUPLICATE_LINK");
    }
  });

  await runTest("5. 搜索 [TEST] 与 数学", async () => {
    const byPrefix = await request<{ items: ResourceLink[] }>(
      `/api/links?q=${encodeURIComponent(TEST_PREFIX)}&status=all`,
    );
    assert.ok(byPrefix.body.ok);
    if (byPrefix.body.ok) {
      assert.ok(byPrefix.body.data.items.length >= 2);
    }

    const bySubject = await request<{ items: ResourceLink[] }>(
      "/api/links?q=数学&status=all",
    );
    assert.ok(bySubject.body.ok);
    if (bySubject.body.ok) {
      assert.ok(bySubject.body.data.items.some((item) => item.id === baiduId));
    }
  });

  await runTest("6. 平台 / 分类 / 收藏筛选", async () => {
    const baiduOnly = await request<{ items: ResourceLink[] }>(
      `/api/links?platform=baidu&status=all&q=${encodeURIComponent(TEST_PREFIX)}`,
    );
    assert.ok(baiduOnly.body.ok);
    if (baiduOnly.body.ok) {
      assert.ok(
        baiduOnly.body.data.items.every((item) => item.platform === "baidu"),
      );
    }

    const practiceOnly = await request<{ items: ResourceLink[] }>(
      `/api/links?resourceCategory=practice&status=all&q=${encodeURIComponent(TEST_PREFIX)}`,
    );
    assert.ok(practiceOnly.body.ok);
    if (practiceOnly.body.ok) {
      assert.equal(practiceOnly.body.data.items.length, 1);
    }

    await request(`/api/links/${baiduId}`, {
      method: "PATCH",
      body: JSON.stringify({ favorite: true }),
    });

    const favorites = await request<{ items: ResourceLink[] }>(
      `/api/links?favorite=true&status=all&q=${encodeURIComponent(TEST_PREFIX)}`,
    );
    assert.ok(favorites.body.ok);
    if (favorites.body.ok) {
      assert.ok(favorites.body.data.items.some((item) => item.id === baiduId));
    }
  });

  await runTest("7. 编辑资料", async () => {
    const result = await request<{ item: ResourceLink }>(`/api/links/${baiduId}`, {
      method: "PATCH",
      body: JSON.stringify({
        description: "UI测试备注",
        resourceYear: "2026秋更新",
      }),
    });

    assert.ok(result.body.ok);
    if (result.body.ok) {
      assert.equal(result.body.data.item.description, "UI测试备注");
      assert.equal(result.body.data.item.resourceYear, "2026秋更新");
    }
  });

  await runTest("8. 标记失效后默认列表不可见", async () => {
    await request(`/api/links/${baiduId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "invalid" }),
    });

    const normalList = await request<{ items: ResourceLink[] }>(
      `/api/links?q=${encodeURIComponent(TEST_PREFIX)}`,
    );
    assert.ok(normalList.body.ok);
    if (normalList.body.ok) {
      assert.ok(!normalList.body.data.items.some((item) => item.id === baiduId));
    }

    const allList = await request<{ items: ResourceLink[] }>(
      `/api/links?status=all&q=${encodeURIComponent(TEST_PREFIX)}`,
    );
    assert.ok(allList.body.ok);
    if (allList.body.ok) {
      assert.ok(allList.body.data.items.some((item) => item.id === baiduId));
    }
  });

  await runTest("9. 删除测试资料", async () => {
    const deleteBaidu = await request<{ deleted: boolean }>(
      `/api/links/${baiduId}`,
      { method: "DELETE" },
    );
    const deleteQuark = await request<{ deleted: boolean }>(
      `/api/links/${quarkId}`,
      { method: "DELETE" },
    );

    assert.ok(deleteBaidu.body.ok);
    assert.ok(deleteQuark.body.ok);

    const list = await request<{ items: ResourceLink[] }>(
      `/api/links?status=all&q=${encodeURIComponent(TEST_PREFIX)}`,
    );
    assert.ok(list.body.ok);
    if (list.body.ok) {
      assert.equal(list.body.data.items.length, 0);
    }
  });

  console.log("\n全部 UI 流程 API 测试通过。");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
