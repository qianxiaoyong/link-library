/**
 * 阶段 6B 手动测试脚本：模拟批量编辑逐条 PATCH 流程。
 * 需要 dev 或 start 服务运行在 BASE_URL。
 */

import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const TEST_PREFIX = "[TEST-BATCH]";

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
  resourceCategory: string | null;
  description: string | null;
  schoolStage: string | null;
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

async function createTestItem(
  suffix: string,
  extra: Record<string, unknown> = {},
): Promise<ResourceLink> {
  const result = await request<{ item: ResourceLink }>("/api/links", {
    method: "POST",
    body: JSON.stringify({
      platform: "baidu",
      title: `${TEST_PREFIX} ${suffix}`,
      rawUrl: `https://pan.baidu.com/s/batch-${suffix}`,
      url: `https://pan.baidu.com/s/batch-${suffix}`,
      resourceCategory: "paper",
      subject: "语文",
      resourceYear: "2025春",
      ...extra,
    }),
  });

  assert.equal(result.status, 201);
  assert.ok(result.body.ok);
  if (!result.body.ok) throw new Error("create failed");
  return result.body.data.item;
}

async function batchPatch(
  ids: string[],
  patch: Record<string, unknown>,
): Promise<{ successCount: number; failureCount: number }> {
  let successCount = 0;
  let failureCount = 0;

  for (const id of ids) {
    const result = await request<{ item: ResourceLink }>(`/api/links/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    if (result.body.ok) successCount += 1;
    else failureCount += 1;
  }

  return { successCount, failureCount };
}

async function main() {
  console.log(`使用 BASE_URL=${BASE_URL}\n`);
  await cleanup();

  const itemA = await createTestItem("001");
  const itemB = await createTestItem("002");
  const ids = [itemA.id, itemB.id];

  await runTest("1. 批量设置资料分类 / 科目 / 资料年份", async () => {
    const result = await batchPatch(ids, {
      resourceCategory: "practice",
      subject: "数学",
      resourceYear: "2026秋",
    });

    assert.equal(result.successCount, 2);
    assert.equal(result.failureCount, 0);

    for (const id of ids) {
      const detail = await request<{ item: ResourceLink }>(`/api/links/${id}`);
      assert.ok(detail.body.ok);
      if (detail.body.ok) {
        assert.equal(detail.body.data.item.resourceCategory, "practice");
        assert.equal(detail.body.data.item.subject, "数学");
        assert.equal(detail.body.data.item.resourceYear, "2026秋");
      }
    }
  });

  await runTest("2. 批量清空科目", async () => {
    const result = await batchPatch(ids, { subject: null });
    assert.equal(result.successCount, 2);

    for (const id of ids) {
      const detail = await request<{ item: ResourceLink }>(`/api/links/${id}`);
      assert.ok(detail.body.ok);
      if (detail.body.ok) {
        assert.equal(detail.body.data.item.subject, null);
      }
    }
  });

  await runTest("3. 批量标记已失效后默认列表不可见", async () => {
    const result = await batchPatch(ids, { status: "invalid" });
    assert.equal(result.successCount, 2);

    const normalList = await request<{ items: ResourceLink[] }>(
      `/api/links?q=${encodeURIComponent(TEST_PREFIX)}`,
    );
    assert.ok(normalList.body.ok);
    if (normalList.body.ok) {
      assert.equal(normalList.body.data.items.length, 0);
    }

    const invalidList = await request<{ items: ResourceLink[] }>(
      `/api/links?status=invalid&q=${encodeURIComponent(TEST_PREFIX)}`,
    );
    assert.ok(invalidList.body.ok);
    if (invalidList.body.ok) {
      assert.equal(invalidList.body.data.items.length, 2);
    }
  });

  await runTest("4. 批量收藏", async () => {
    const result = await batchPatch(ids, { favorite: true });
    assert.equal(result.successCount, 2);

    const favorites = await request<{ items: ResourceLink[] }>(
      `/api/links?favorite=true&status=all&q=${encodeURIComponent(TEST_PREFIX)}`,
    );
    assert.ok(favorites.body.ok);
    if (favorites.body.ok) {
      assert.equal(favorites.body.data.items.length, 2);
    }
  });

  await runTest("5. 批量 PATCH 不支持修改标题（单条 PATCH 仍可改标题）", async () => {
    const single = await request<{ item: ResourceLink }>(`/api/links/${itemA.id}`, {
      method: "PATCH",
      body: JSON.stringify({ title: `${TEST_PREFIX} 单条改标题` }),
    });
    assert.ok(single.body.ok);
    if (single.body.ok) {
      assert.equal(single.body.data.item.title, `${TEST_PREFIX} 单条改标题`);
    }
  });

  await cleanup();
  console.log("\n全部批量编辑 API 流程测试通过。");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
